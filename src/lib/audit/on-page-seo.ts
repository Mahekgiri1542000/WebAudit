import * as cheerio from 'cheerio';
import type { OnPageSEOResult, CheckItem } from '@/types/audit';

export async function runOnPageSEO(
  html: string,
  url: string
): Promise<OnPageSEOResult> {
  const $ = cheerio.load(html);
  const checks: CheckItem[] = [];

  // ─── Meta title ───────────────────────────────────────────────────────────
  const metaTitle = $('title').first().text().trim() || null;
  const titleLen = metaTitle?.length ?? 0;
  checks.push({
    id: 'meta-title',
    title: 'Meta Title',
    status: !metaTitle ? 'fail' : titleLen < 10 ? 'warn' : titleLen > 60 ? 'warn' : 'pass',
    severity: !metaTitle ? 'critical' : 'medium',
    value: metaTitle,
    note: !metaTitle
      ? 'Missing title tag — critical for ranking'
      : titleLen > 60
        ? `Title is ${titleLen} chars — Google truncates at 60`
        : titleLen < 10
          ? 'Title is too short — add descriptive keywords'
          : `Title is ${titleLen} chars — optimal`,
  });

  // ─── Meta description ─────────────────────────────────────────────────────
  const metaDesc =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    null;
  const descLen = metaDesc?.length ?? 0;
  checks.push({
    id: 'meta-description',
    title: 'Meta Description',
    status: !metaDesc ? 'fail' : descLen > 160 ? 'warn' : descLen < 50 ? 'warn' : 'pass',
    severity: !metaDesc ? 'high' : 'medium',
    value: metaDesc,
    note: !metaDesc
      ? 'Missing meta description — affects CTR in search results'
      : descLen > 160
        ? `Description is ${descLen} chars — Google truncates at 160`
        : `Description is ${descLen} chars`,
  });

  // ─── H1 ───────────────────────────────────────────────────────────────────
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h1 = h1s[0] ?? null;
  checks.push({
    id: 'h1',
    title: 'H1 Tag',
    status: h1s.length === 0 ? 'fail' : h1s.length > 1 ? 'warn' : 'pass',
    severity: h1s.length === 0 ? 'high' : 'medium',
    value: h1,
    note:
      h1s.length === 0
        ? 'No H1 found — every page should have exactly one H1'
        : h1s.length > 1
          ? `${h1s.length} H1 tags found — use only one per page`
          : 'H1 present',
  });

  // ─── Heading hierarchy ────────────────────────────────────────────────────
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
  checks.push({
    id: 'heading-hierarchy',
    title: 'Heading Hierarchy',
    status: h2s.length === 0 ? 'warn' : 'pass',
    severity: 'low',
    value: `${h2s.length} H2 tags`,
    note: h2s.length === 0 ? 'No H2 tags — add subheadings to improve content structure' : 'Heading structure present',
  });

  // ─── Canonical ────────────────────────────────────────────────────────────
  const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || null;
  checks.push({
    id: 'canonical',
    title: 'Canonical URL',
    status: canonicalUrl ? 'pass' : 'warn',
    severity: 'medium',
    value: canonicalUrl,
    note: canonicalUrl
      ? 'Canonical tag present'
      : 'Missing canonical tag — add one to prevent duplicate content issues',
  });

  // ─── Robots meta ─────────────────────────────────────────────────────────
  const robotsMeta =
    $('meta[name="robots"]').attr('content')?.toLowerCase()?.trim() || null;
  const isNoIndex = robotsMeta?.includes('noindex');
  checks.push({
    id: 'robots-meta',
    title: 'Robots Meta',
    status: isNoIndex ? 'fail' : 'pass',
    severity: isNoIndex ? 'critical' : 'info',
    value: robotsMeta ?? 'not set (default: index, follow)',
    note: isNoIndex
      ? 'NOINDEX is set — this page is blocked from Google!'
      : 'Page is indexable',
  });

  // ─── Open Graph ───────────────────────────────────────────────────────────
  const hasOgTitle = !!$('meta[property="og:title"]').attr('content');
  const hasOgDesc = !!$('meta[property="og:description"]').attr('content');
  const hasOgImage = !!$('meta[property="og:image"]').attr('content');
  const hasOpenGraph = hasOgTitle && hasOgDesc && hasOgImage;
  checks.push({
    id: 'open-graph',
    title: 'Open Graph Tags',
    status: hasOpenGraph ? 'pass' : hasOgTitle ? 'warn' : 'fail',
    severity: 'medium',
    value: `title:${hasOgTitle}, desc:${hasOgDesc}, image:${hasOgImage}`,
    note: hasOpenGraph
      ? 'Open Graph complete'
      : `Missing: ${[!hasOgTitle && 'og:title', !hasOgDesc && 'og:description', !hasOgImage && 'og:image'].filter(Boolean).join(', ')}`,
  });

  // ─── Twitter Card ─────────────────────────────────────────────────────────
  const hasTwitterCard = !!$('meta[name="twitter:card"]').attr('content');
  checks.push({
    id: 'twitter-card',
    title: 'Twitter Card',
    status: hasTwitterCard ? 'pass' : 'warn',
    severity: 'low',
    value: $('meta[name="twitter:card"]').attr('content') ?? null,
    note: hasTwitterCard ? 'Twitter Card present' : 'Add twitter:card meta tag for rich previews on X/Twitter',
  });

  // ─── Images missing alt ───────────────────────────────────────────────────
  const allImages = $('img').length;
  const imagesMissingAlt = $('img:not([alt])').length + $('img[alt=""]').length;
  checks.push({
    id: 'image-alt',
    title: 'Image Alt Text',
    status: imagesMissingAlt === 0 ? 'pass' : imagesMissingAlt > 3 ? 'fail' : 'warn',
    severity: imagesMissingAlt > 3 ? 'high' : 'medium',
    value: `${imagesMissingAlt}/${allImages} images missing alt`,
    note:
      imagesMissingAlt === 0
        ? 'All images have alt text'
        : `${imagesMissingAlt} image(s) missing alt text — impacts accessibility and image SEO`,
  });

  // ─── Word count ───────────────────────────────────────────────────────────
  const bodyText = $('main, article, .content, body').first().text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(' ').filter(Boolean).length;
  checks.push({
    id: 'word-count',
    title: 'Content Length',
    status: wordCount < 300 ? 'warn' : wordCount < 600 ? 'pass' : 'pass',
    severity: wordCount < 300 ? 'medium' : 'info',
    value: `${wordCount} words`,
    note:
      wordCount < 300
        ? `Only ${wordCount} words — thin content may rank poorly. Target 600+ for informational pages.`
        : `${wordCount} words — good content depth`,
  });

  // ─── Internal / external links ────────────────────────────────────────────
  const origin = new URL(url).origin;
  const internalLinks = $(`a[href^="/"], a[href^="${origin}"]`).length;
  const externalLinks = $('a[href^="http"]')
    .filter((_, el) => !$(el).attr('href')?.startsWith(origin))
    .length;

  checks.push({
    id: 'internal-links',
    title: 'Internal Links',
    status: internalLinks < 2 ? 'warn' : 'pass',
    severity: 'medium',
    value: `${internalLinks} internal, ${externalLinks} external`,
    note:
      internalLinks < 2
        ? 'Few internal links — add links to related pages to distribute authority'
        : 'Good internal linking',
  });

  // ─── Score ────────────────────────────────────────────────────────────────
  const passed = checks.filter((c) => c.status === 'pass').length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    checks,
    metaTitle,
    metaDescription: metaDesc,
    h1,
    h2s: h2s.slice(0, 10),
    canonicalUrl,
    robots: robotsMeta,
    hasOpenGraph,
    hasTwitterCard,
    wordCount,
    imagesMissingAlt,
    internalLinks,
    externalLinks,
  };
}
