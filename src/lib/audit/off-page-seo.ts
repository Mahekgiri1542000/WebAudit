import * as cheerio from 'cheerio';
import type { OffPageSEOResult, CheckItem } from '@/types/audit';

export async function runOffPageSEO(html: string, url: string): Promise<OffPageSEOResult> {
  const $ = cheerio.load(html);
  const checks: CheckItem[] = [];
  const origin = new URL(url).origin;

  // ─── Social profile links ────────────────────────────────────────────────
  const socialProfiles = {
    linkedin: $('a[href*="linkedin.com"]').length > 0,
    twitter: $('a[href*="twitter.com"], a[href*="x.com"]').length > 0,
    facebook: $('a[href*="facebook.com"]').length > 0,
    instagram: $('a[href*="instagram.com"]').length > 0,
    youtube: $('a[href*="youtube.com"]').length > 0,
  };

  const socialCount = Object.values(socialProfiles).filter(Boolean).length;
  checks.push({
    id: 'social-profiles',
    title: 'Social Profile Links',
    status: socialCount === 0 ? 'fail' : socialCount < 2 ? 'warn' : 'pass',
    severity: socialCount === 0 ? 'high' : 'medium',
    value: `${socialCount}/5 platforms linked`,
    note:
      socialCount === 0
        ? 'No social profiles linked — hurts trust signals and E-E-A-T'
        : `${Object.entries(socialProfiles).filter(([,v]) => v).map(([k]) => k).join(', ')} linked`,
  });

  // ─── Google Business Profile link ─────────────────────────────────────────
  const hasGbpLink =
    $('a[href*="maps.google.com"], a[href*="g.page"], a[href*="goo.gl/maps"], a[href*="business.google.com"]')
      .length > 0;

  checks.push({
    id: 'gbp-link',
    title: 'Google Business Profile Link',
    status: hasGbpLink ? 'pass' : 'warn',
    severity: 'medium',
    value: hasGbpLink ? 'Present' : null,
    note: hasGbpLink
      ? 'GBP link found'
      : 'No Google Business Profile link — add a link to your GBP listing for local SEO',
  });

  // ─── NAP in footer ────────────────────────────────────────────────────────
  const footerText = $('footer').text();
  const hasPhone = /(\+?\d[\d\s\-\(\)]{8,}\d)/.test(footerText);
  const hasAddress = /\d{3,5}\s+\w+\s+(St|Ave|Rd|Dr|Blvd|Way|Lane|Pl|Court|Ct)/i.test(footerText);
  const hasNAP = hasPhone || hasAddress;

  checks.push({
    id: 'nap',
    title: 'NAP in Footer (Name, Address, Phone)',
    status: hasNAP ? 'pass' : 'warn',
    severity: 'medium',
    value: `phone:${hasPhone}, address:${hasAddress}`,
    note: hasNAP
      ? 'Contact info found in footer'
      : 'No phone or address in footer — add NAP for local SEO trust signals',
  });

  // ─── Open Graph image (shareability) ─────────────────────────────────────
  const hasOgImage = !!$('meta[property="og:image"]').attr('content');
  const hasOgTitle = !!$('meta[property="og:title"]').attr('content');
  const hasShareableOG = hasOgImage && hasOgTitle;

  checks.push({
    id: 'og-shareability',
    title: 'Social Share Preview (OG Image)',
    status: hasShareableOG ? 'pass' : hasOgImage || hasOgTitle ? 'warn' : 'fail',
    severity: 'medium',
    value: hasShareableOG ? 'Complete' : null,
    note: hasShareableOG
      ? 'Open Graph image + title ready for social sharing'
      : 'Missing og:image or og:title — links won\'t show rich previews when shared on social',
  });

  // ─── Review schema ────────────────────────────────────────────────────────
  const ldJsonBlocks = $('script[type="application/ld+json"]')
    .map((_, el) => { try { return JSON.parse($(el).html() ?? '{}'); } catch { return {}; } })
    .get();

  const hasReviewSchema = ldJsonBlocks.some(
    (b: Record<string, unknown>) => b['@type'] === 'AggregateRating' || b['@type'] === 'Review'
  );

  checks.push({
    id: 'review-schema',
    title: 'Review / Rating Schema',
    status: hasReviewSchema ? 'pass' : 'warn',
    severity: 'low',
    value: hasReviewSchema ? 'Present' : null,
    note: hasReviewSchema
      ? 'Review schema found — eligible for star rating rich results'
      : 'No review schema — add AggregateRating schema if you have customer reviews',
  });

  // ─── Score ────────────────────────────────────────────────────────────────
  const passed = checks.filter((c) => c.status === 'pass').length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    checks,
    hasGbpLink,
    socialProfiles,
    hasNAP,
    hasShareableOG,
  };
}
