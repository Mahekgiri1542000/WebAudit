import type { Suggestion, AuditReport } from '@/types/audit';

let idCounter = 0;
function sid() { return `s${++idCounter}`; }

export function generateSuggestions(report: AuditReport, detectedCms: string | null): Suggestion[] {
  idCounter = 0;
  const suggestions: Suggestion[] = [];
  const cms = (detectedCms ?? 'generic').toLowerCase().split(' ')[0];

  const howToMeta = (field: string) => ({
    wordpress: `SEO plugin (Yoast/RankMath) → Edit page → ${field} field`,
    shopify: `Admin → Online Store → Pages → Edit → SEO section at bottom`,
    nextjs: `Edit metadata object in app/page.tsx: ${field.toLowerCase().replace(/ /g, '_')}: '...'`,
    ghl: `Page Settings → SEO → ${field}`,
    generic: `Add <meta name="${field.toLowerCase().replace(/ /g, '-')}" content="..."> inside <head>`,
  });

  // ─── On-Page SEO suggestions ──────────────────────────────────────────────
  const onPage = report.onPage;

  if (!onPage.metaTitle) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'critical', effortLevel: 'quick-win',
      title: 'Add a page title (title tag)',
      description: 'Your page has no title tag. This is one of the most important SEO elements — Google uses it as the clickable headline in search results.',
      currentValue: null, targetValue: '50–60 character descriptive title with primary keyword',
      howToFix: howToMeta('Meta Title'),
      estimatedImpact: 'Critical — pages without titles rarely rank',
      relatedCheck: 'meta-title',
    });
  } else if ((onPage.metaTitle?.length ?? 0) > 60) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'medium', effortLevel: 'quick-win',
      title: 'Shorten your page title',
      description: `Your title is ${onPage.metaTitle?.length} characters — Google truncates at 60.`,
      currentValue: onPage.metaTitle, targetValue: `Under 60 chars: "${onPage.metaTitle?.slice(0, 55)}..."`,
      howToFix: howToMeta('Meta Title'),
      estimatedImpact: '+3–5% click-through rate from improved display in search results',
      relatedCheck: 'meta-title',
    });
  }

  if (!onPage.metaDescription) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'high', effortLevel: 'quick-win',
      title: 'Add a meta description',
      description: 'No meta description found. Google auto-generates one from your content, often picking unflattering text. A crafted description drives 8–15% higher CTR.',
      currentValue: null, targetValue: '120–160 character description with value proposition + CTA',
      howToFix: howToMeta('Meta Description'),
      estimatedImpact: '+8–15% click-through rate from Google search results',
      relatedCheck: 'meta-description',
    });
  }

  if (!onPage.h1) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'high', effortLevel: 'quick-win',
      title: 'Add an H1 heading',
      description: 'No H1 tag found. Every page needs exactly one H1 — it tells Google and users what the page is about.',
      currentValue: null, targetValue: 'Clear H1 containing your primary keyword',
      howToFix: { wordpress: 'Edit page → set Page Title as H1', shopify: 'Edit page title in Online Store', nextjs: 'Add <h1> tag to your page component', generic: 'Add <h1>Your Page Title</h1> as the first heading' },
      estimatedImpact: '+5–10 on-page SEO score',
      relatedCheck: 'h1',
    });
  }

  if (!onPage.canonicalUrl) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'medium', effortLevel: 'quick-win',
      title: 'Add canonical URL tag',
      description: 'No canonical tag found. This prevents duplicate content penalties when your page is accessible at multiple URLs.',
      currentValue: null, targetValue: `<link rel="canonical" href="${report.url}">`,
      howToFix: { wordpress: 'Yoast/RankMath adds this automatically when configured', nextjs: 'Add canonical to metadata export: alternates: { canonical: url }', generic: `Add <link rel="canonical" href="${report.url}"> inside <head>` },
      estimatedImpact: 'Prevents duplicate content score dilution',
      relatedCheck: 'canonical',
    });
  }

  if (!onPage.hasOpenGraph) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'medium', effortLevel: 'quick-win',
      title: 'Add Open Graph tags for social sharing',
      description: 'Missing og:title, og:description, or og:image. Pages without OG tags show blank previews when shared on LinkedIn, Facebook, or Slack.',
      currentValue: 'No OG tags', targetValue: 'og:title, og:description, og:image all set',
      howToFix: { wordpress: 'Yoast/RankMath → Social tab → set OG title, description, image', nextjs: 'metadata.openGraph in app/page.tsx', generic: 'Add og: meta tags inside <head>' },
      estimatedImpact: 'Rich link previews on social media — increases click rate from shared links',
      relatedCheck: 'open-graph',
    });
  }

  if (onPage.imagesMissingAlt > 0) {
    suggestions.push({
      id: sid(), category: 'on-page', priority: 'medium', effortLevel: 'moderate',
      title: `Fix ${onPage.imagesMissingAlt} image(s) missing alt text`,
      description: 'Images without alt text are invisible to screen readers and miss image search traffic.',
      currentValue: `${onPage.imagesMissingAlt} images with no alt attribute`, targetValue: 'All images have descriptive alt text',
      howToFix: { wordpress: 'Media Library → Edit image → Alt Text field', shopify: 'Products/Files → click image → edit Alt text', generic: 'Add alt="descriptive text" to each <img> tag' },
      estimatedImpact: 'Accessibility compliance + image search visibility',
      relatedCheck: 'image-alt',
    });
  }

  // ─── GEO suggestions ──────────────────────────────────────────────────────
  const geo = report.geo;

  if (!geo.aiBotCrawlability.gpTBotAllowed) {
    suggestions.push({
      id: sid(), category: 'geo', priority: 'critical', effortLevel: 'quick-win',
      title: 'Unblock GPTBot in robots.txt — you are invisible to ChatGPT',
      description: 'GPTBot is blocked in your robots.txt. OpenAI cannot crawl your site, so your content cannot appear in ChatGPT responses or citations.',
      currentValue: 'GPTBot: Disallow: /', targetValue: 'Remove GPTBot block or add explicit Allow rule',
      howToFix: { generic: 'Edit robots.txt — remove "Disallow: /" under "User-agent: GPTBot" or add "Allow: /" after it' },
      estimatedImpact: 'Restores eligibility for ChatGPT citations — major GEO ranking factor',
      relatedCheck: 'gptbot-allowed',
    });
  }

  if (!geo.aiBotCrawlability.hasLlmsTxt) {
    suggestions.push({
      id: sid(), category: 'geo', priority: 'medium', effortLevel: 'quick-win',
      title: 'Create /llms.txt — give AI engines a structured site description',
      description: 'No llms.txt found. This file tells AI crawlers what your site is about, improving citation relevance.',
      currentValue: null, targetValue: 'Plain-text file at /llms.txt with site description, content sections, and contact',
      howToFix: { nextjs: 'Create public/llms.txt file', wordpress: 'Upload llms.txt to root via FTP or file manager', generic: 'Create /llms.txt at your site root' },
      estimatedImpact: 'Improved AI citation accuracy and relevance',
      relatedCheck: 'llms-txt',
    });
  }

  if (!report.offPage.socialProfiles.linkedin && !report.offPage.socialProfiles.twitter) {
    suggestions.push({
      id: sid(), category: 'geo', priority: 'medium', effortLevel: 'moderate',
      title: 'Add social profile links to your website',
      description: 'No LinkedIn or Twitter/X links found. Social profiles linked from your site are sameAs entity signals — AI engines use them to verify and identify your brand.',
      currentValue: 'No social profile links in footer/header', targetValue: 'LinkedIn, Twitter/X, and YouTube linked from footer',
      howToFix: { generic: 'Add links to your social profiles in the site footer' },
      estimatedImpact: 'Stronger entity recognition by AI engines — increases citation frequency',
      relatedCheck: 'social-profiles',
    });
  }

  // ─── AEO suggestions ──────────────────────────────────────────────────────
  const aeo = report.aeo;

  if (!aeo.hasFAQSchema && aeo.questionHeadingCount >= 2) {
    suggestions.push({
      id: sid(), category: 'aeo', priority: 'high', effortLevel: 'quick-win',
      title: 'Add FAQ schema — your Q&A content exists but has no markup',
      description: `We detected ${aeo.questionHeadingCount} question-format headings on your page but no FAQPage schema. Adding schema takes under 10 minutes and qualifies your page for rich results.`,
      currentValue: `${aeo.questionHeadingCount} question headings, 0 with schema`, targetValue: 'FAQPage JSON-LD wrapping all Q&A pairs',
      howToFix: { wordpress: 'RankMath Schema → FAQ Block → select existing FAQ sections', shopify: 'Paste JSON-LD into theme.liquid before </body>', nextjs: 'Add JSON-LD script tag in page component', generic: 'Add <script type="application/ld+json"> with FAQPage schema before </body>' },
      estimatedImpact: 'Eligible for featured snippet rich results + PAA inclusion',
      relatedCheck: 'faq-schema',
    });
  }

  if (aeo.questionHeadingCount < 2) {
    suggestions.push({
      id: sid(), category: 'aeo', priority: 'high', effortLevel: 'moderate',
      title: 'Restructure headings as questions to target People Also Ask',
      description: 'Only ' + aeo.questionHeadingCount + ' question-format headings found. Google\'s People Also Ask results pull from pages with H2/H3 headings phrased as questions followed by direct answers.',
      currentValue: `${aeo.questionHeadingCount} question headings`, targetValue: '3+ H2/H3 headings phrased as questions with 40–60 word answers',
      howToFix: { generic: 'Rename section headings to start with "What", "How", "Why", "When" and add a direct 2–3 sentence answer paragraph immediately below each one' },
      estimatedImpact: 'PAA inclusion + featured snippet eligibility',
      relatedCheck: 'question-headings',
    });
  }

  // ─── Security suggestions ─────────────────────────────────────────────────
  const ssl = report.ssl;

  if (!ssl.httpsEnabled) {
    suggestions.push({
      id: sid(), category: 'security', priority: 'critical', effortLevel: 'moderate',
      title: 'Enable HTTPS immediately',
      description: 'Your site is on HTTP. Google Chrome shows "Not Secure" to all visitors and Google ranks HTTPS sites higher.',
      currentValue: 'HTTP', targetValue: 'HTTPS with valid SSL certificate',
      howToFix: { generic: 'Contact your hosting provider to install a free Let\'s Encrypt SSL certificate, then set up HTTP → HTTPS redirect' },
      estimatedImpact: 'Critical — HTTPS is a confirmed Google ranking factor',
      relatedCheck: 'https',
    });
  }

  if (!ssl.headers.hsts) {
    suggestions.push({
      id: sid(), category: 'security', priority: 'medium', effortLevel: 'quick-win',
      title: 'Add Strict-Transport-Security (HSTS) header',
      description: 'HSTS tells browsers to always use HTTPS, preventing protocol downgrade attacks.',
      currentValue: null, targetValue: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
      howToFix: { nextjs: 'Add to headers() in next.config.ts', generic: 'Add to web server config (nginx/Apache) or CDN headers' },
      estimatedImpact: 'Security grade improvement: +1 grade level',
      relatedCheck: 'hsts',
    });
  }

  // ─── Worldwide SEO suggestions ────────────────────────────────────────────
  const worldwide = report.worldwideSeo;

  if (!worldwide.htmlLang) {
    suggestions.push({
      id: sid(), category: 'worldwide-seo', priority: 'high', effortLevel: 'quick-win',
      title: 'Add html[lang] attribute',
      description: 'Your <html> tag has no lang attribute. Screen readers and Google cannot determine your page language.',
      currentValue: '<html>', targetValue: '<html lang="en">',
      howToFix: { wordpress: 'Settings → Reading → Site Language sets this automatically', nextjs: 'Set lang in <html lang="en"> in app/layout.tsx', generic: 'Add lang="en" to your <html> tag' },
      estimatedImpact: 'Accessibility compliance + international SEO clarity',
      relatedCheck: 'html-lang',
    });
  }

  if (!worldwide.hasLocalBusiness) {
    suggestions.push({
      id: sid(), category: 'worldwide-seo', priority: 'high', effortLevel: 'moderate',
      title: 'Add LocalBusiness JSON-LD schema',
      description: 'No LocalBusiness schema found. This schema is essential for appearing in Google Maps and local pack results.',
      currentValue: null, targetValue: 'Organization or LocalBusiness JSON-LD with name, address, telephone, and openingHours',
      howToFix: { wordpress: 'RankMath or Schema Pro → Local SEO → fill in business details', generic: 'Add <script type="application/ld+json"> with LocalBusiness schema to your homepage' },
      estimatedImpact: 'Local pack eligibility + Google Maps visibility',
      relatedCheck: 'local-business-schema',
    });
  }

  // Sort: critical → high → medium → low, within same priority: quick-win first
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const effortOrder = { 'quick-win': 0, moderate: 1, major: 2 };

  suggestions.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return effortOrder[a.effortLevel] - effortOrder[b.effortLevel];
  });

  return suggestions;
}
