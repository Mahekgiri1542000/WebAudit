import * as cheerio from 'cheerio';
import type { WorldwideSEOResult, CheckItem } from '@/types/audit';

function detectUrlStructure(url: string): 'cctld' | 'subdomain' | 'subdirectory' | 'none' {
  const u = new URL(url);
  const ccTLDs = ['.fr', '.de', '.co.uk', '.com.au', '.ca', '.in', '.jp', '.es', '.it', '.nl', '.br', '.ru', '.pl', '.se'];
  if (ccTLDs.some((tld) => u.hostname.endsWith(tld))) return 'cctld';

  const parts = u.hostname.split('.');
  if (parts.length > 2 && /^(fr|de|en|es|it|nl|pt|ru|ja|ko|zh|ar)$/i.test(parts[0])) return 'subdomain';

  const pathParts = u.pathname.split('/').filter(Boolean);
  if (pathParts.length > 0 && /^(fr|de|en|es|it|nl|pt|ru|ja|ko|zh|ar)$/i.test(pathParts[0])) return 'subdirectory';

  return 'none';
}

export async function runWorldwideSEO(html: string, url: string): Promise<WorldwideSEOResult> {
  const $ = cheerio.load(html);
  const checks: CheckItem[] = [];

  // ─── html[lang] ───────────────────────────────────────────────────────────
  const htmlLang = $('html').attr('lang') ?? null;
  const validLang = htmlLang ? /^[a-z]{2}(-[A-Z]{2})?$/.test(htmlLang) : false;

  checks.push({
    id: 'html-lang',
    title: 'html[lang] Attribute',
    status: !htmlLang ? 'fail' : !validLang ? 'warn' : 'pass',
    severity: !htmlLang ? 'high' : 'medium',
    value: htmlLang,
    note: !htmlLang
      ? 'Missing html[lang] — Google and screen readers cannot determine page language'
      : !validLang
        ? `Invalid lang format "${htmlLang}" — use BCP 47 format e.g. "en" or "en-US"`
        : `Language declared as "${htmlLang}"`,
  });

  // ─── hreflang ─────────────────────────────────────────────────────────────
  const hreflangTags = $('link[rel="alternate"][hreflang]').map((_, el) => ({
    hreflang: $(el).attr('hreflang'),
    href: $(el).attr('href'),
  })).get();

  const hasXDefault = hreflangTags.some((t) => t.hreflang === 'x-default');
  const hasRelativeUrls = hreflangTags.some((t) => t.href && !t.href.startsWith('http'));
  const hreflangIssues: string[] = [];

  if (hreflangTags.length > 0 && !hasXDefault)
    hreflangIssues.push('Missing x-default hreflang — needed for language fallback');
  if (hasRelativeUrls)
    hreflangIssues.push('hreflang URLs must be absolute (starting with https://)');

  checks.push({
    id: 'hreflang',
    title: 'hreflang Tags',
    status:
      hreflangTags.length === 0 ? 'warn' :
      hreflangIssues.length > 0 ? 'warn' : 'pass',
    severity: 'medium',
    value: hreflangTags.length > 0 ? `${hreflangTags.length} hreflang tags` : null,
    note:
      hreflangTags.length === 0
        ? 'No hreflang tags — if serving multiple languages/regions, add hreflang'
        : hreflangIssues.length > 0
          ? hreflangIssues.join('; ')
          : `${hreflangTags.length} hreflang tags, x-default present`,
  });

  // ─── URL structure ────────────────────────────────────────────────────────
  const urlStructure = detectUrlStructure(url);
  checks.push({
    id: 'url-structure',
    title: 'International URL Structure',
    status: 'pass',
    severity: 'info',
    value: urlStructure,
    note:
      urlStructure === 'cctld' ? 'Country-specific domain detected — strongest geo-targeting signal'
      : urlStructure === 'subdomain' ? 'Language subdomain detected'
      : urlStructure === 'subdirectory' ? 'Language subdirectory detected'
      : 'No international URL structure — standard single-language setup',
  });

  // ─── LocalBusiness schema ─────────────────────────────────────────────────
  const ldJsonBlocks = $('script[type="application/ld+json"]')
    .map((_, el) => { try { return JSON.parse($(el).html() ?? '{}'); } catch { return {}; } })
    .get() as Record<string, unknown>[];

  const localBusinessTypes = [
    'LocalBusiness', 'Restaurant', 'MedicalBusiness', 'LegalService',
    'Store', 'Hotel', 'HealthAndBeautyBusiness', 'AutoDealer', 'Dentist',
  ];
  const localBusiness = ldJsonBlocks.find((b) => localBusinessTypes.includes(b['@type'] as string));
  const lbAddress = !!(localBusiness?.address as Record<string, unknown>)?.streetAddress;
  const lbPhone = !!localBusiness?.telephone;
  const hasLocalBusiness = !!localBusiness;

  checks.push({
    id: 'local-business-schema',
    title: 'LocalBusiness Schema',
    status: !localBusiness ? 'warn' : !lbAddress || !lbPhone ? 'warn' : 'pass',
    severity: 'high',
    value: localBusiness ? `${localBusiness['@type']}` : null,
    note: !localBusiness
      ? 'No LocalBusiness schema — critical for local SEO and Google Maps visibility'
      : !lbAddress && !lbPhone
        ? 'LocalBusiness schema present but missing address and phone'
        : `${localBusiness['@type']} schema with ${[lbAddress && 'address', lbPhone && 'phone'].filter(Boolean).join(', ')}`,
  });

  // ─── NAP Consistency ─────────────────────────────────────────────────────
  const footerText = $('footer').text();
  const schemaPhone = (localBusiness?.telephone as string)?.replace(/\D/g, '');
  const footerPhone = footerText.match(/(\+?\d[\d\s\-\(\)]{8,}\d)/)?.[1]?.replace(/\D/g, '');
  const napConsistent = schemaPhone && footerPhone ? schemaPhone === footerPhone : true;

  checks.push({
    id: 'nap-consistency',
    title: 'NAP Consistency (Schema vs Footer)',
    status: !schemaPhone ? 'warn' : napConsistent ? 'pass' : 'fail',
    severity: napConsistent ? 'info' : 'high',
    value: schemaPhone ? `Schema: ${schemaPhone}` : null,
    note: !schemaPhone
      ? 'No phone in LocalBusiness schema to verify'
      : napConsistent
        ? 'Phone number consistent between schema and footer'
        : 'Phone number mismatch between schema and footer — causes local ranking issues',
  });

  // ─── GBP link ────────────────────────────────────────────────────────────
  const hasGbpLink =
    $('a[href*="maps.google.com"], a[href*="g.page"], a[href*="goo.gl/maps"]').length > 0;

  checks.push({
    id: 'gbp-link-worldwide',
    title: 'Google Business Profile Link',
    status: hasGbpLink ? 'pass' : 'warn',
    severity: 'medium',
    value: hasGbpLink ? 'Present' : null,
    note: hasGbpLink
      ? 'Google Business Profile link found'
      : 'No GBP link — link to your Google Business Profile for local pack visibility',
  });

  // ─── Score ────────────────────────────────────────────────────────────────
  const weights: Record<string, number> = {
    'html-lang': 20,
    'hreflang': 20,
    'local-business-schema': 25,
    'nap-consistency': 15,
    'gbp-link-worldwide': 10,
    'url-structure': 10,
  };

  let score = 0;
  let totalWeight = 0;
  for (const check of checks) {
    const w = weights[check.id] ?? 5;
    totalWeight += w;
    if (check.status === 'pass') score += w;
    else if (check.status === 'warn') score += w * 0.5;
  }
  const finalScore = Math.round((score / totalWeight) * 100);

  return {
    score: finalScore,
    checks,
    htmlLang,
    hreflangCount: hreflangTags.length,
    hreflangIssues,
    hasLocalBusiness,
    urlStructure,
    napConsistent,
    hasGbpLink,
  };
}
