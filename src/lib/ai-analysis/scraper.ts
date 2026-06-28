import * as cheerio from 'cheerio';

export interface ScrapedSite {
  url: string;
  finalUrl: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  h1: string[];
  h2: string[];
  h3: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  canonicalUrl: string;
  robots: string;
  schemaTypes: string[];
  navItems: string[];
  ctaTexts: string[];
  formCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  bodyText: string;
  themeColor: string;
  favicon: string;
  hasHttps: boolean;
  headers: Record<string, string>;
  lang: string;
  hasSearch: boolean;
  hasNewsletter: boolean;
  hasChatWidget: boolean;
  footerLinks: string[];
  socialLinks: string[];
  technologies: string[];
  loadTime?: number;
}

export async function scrapeWebsite(url: string): Promise<ScrapedSite> {
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  const start = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html = '';
  let finalUrl = normalized;
  let statusCode = 0;
  let responseHeaders: Record<string, string> = {};

  try {
    const res = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebAuditBot/3.0; +https://webaudit.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    statusCode = res.status;
    finalUrl = res.url || normalized;
    res.headers.forEach((v, k) => { responseHeaders[k.toLowerCase()] = v; });
    html = await res.text();
  } catch {
    clearTimeout(timeout);
    throw new Error(`Failed to fetch ${normalized}`);
  }

  const loadTime = Date.now() - start;
  const $ = cheerio.load(html);

  // Meta
  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') ?? '';
  const metaKeywords = $('meta[name="keywords"]').attr('content') ?? '';
  const lang = $('html').attr('lang') ?? '';
  const robots = $('meta[name="robots"]').attr('content') ?? '';
  const canonicalUrl = $('link[rel="canonical"]').attr('href') ?? '';
  const themeColor = $('meta[name="theme-color"]').attr('content') ?? '';
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').first().attr('href') ?? '';

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content') ?? '';
  const ogDescription = $('meta[property="og:description"]').attr('content') ?? '';
  const ogImage = $('meta[property="og:image"]').attr('content') ?? '';
  const ogType = $('meta[property="og:type"]').attr('content') ?? '';

  // Twitter
  const twitterCard = $('meta[name="twitter:card"]').attr('content') ?? '';
  const twitterTitle = $('meta[name="twitter:title"]').attr('content') ?? '';

  // Headings
  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];
  $('h1').each((_, el) => { const t = $(el).text().trim(); if (t) h1.push(t.slice(0, 120)); });
  $('h2').each((_, el) => { const t = $(el).text().trim(); if (t) h2.push(t.slice(0, 120)); });
  $('h3').each((_, el) => { const t = $(el).text().trim(); if (t) h3.push(t.slice(0, 100)); });

  // Navigation
  const navItems: string[] = [];
  $('nav a, header a').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 60) navItems.push(t);
  });

  // CTAs
  const ctaTexts: string[] = [];
  $('button, a[class*="btn"], a[class*="cta"], [class*="button"]').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 80) ctaTexts.push(t);
  });

  // Forms
  const formCount = $('form').length;

  // Images
  let imageCount = 0;
  let imagesWithoutAlt = 0;
  $('img').each((_, el) => {
    imageCount++;
    if (!$(el).attr('alt')) imagesWithoutAlt++;
  });

  // Links
  let internalLinks = 0;
  let externalLinks = 0;
  const urlHost = new URL(finalUrl).hostname;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (href.startsWith('http') && !href.includes(urlHost)) externalLinks++;
    else if (href.startsWith('/') || href.includes(urlHost)) internalLinks++;
  });

  // Footer links
  const footerLinks: string[] = [];
  $('footer a').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 60) footerLinks.push(t);
  });

  // Social links
  const socialLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (/twitter|x\.com|linkedin|facebook|instagram|youtube|github|tiktok/.test(href)) {
      socialLinks.push(href);
    }
  });

  // Schema
  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() ?? '{}');
      const type = json['@type'] ?? json.type;
      if (type) schemaTypes.push(Array.isArray(type) ? type.join(', ') : type);
    } catch { /* ignore */ }
  });

  // Body text
  $('script, style, nav, header, footer, noscript').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  // Features
  const htmlLower = html.toLowerCase();
  const hasSearch = htmlLower.includes('type="search"') || htmlLower.includes('name="q"') || htmlLower.includes('search') && $('input[type="search"], input[name="q"]').length > 0;
  const hasNewsletter = /newsletter|subscribe|email.*list|mailing/i.test(bodyText);
  const hasChatWidget = /intercom|drift|crisp|hubspot|livechat|tawk|zendesk/i.test(html);

  // Technologies detected from HTML
  const technologies: string[] = [];
  if (/react/i.test(html)) technologies.push('React');
  if (/next\.js|__next/i.test(html)) technologies.push('Next.js');
  if (/vue\.js|data-v-/i.test(html)) technologies.push('Vue.js');
  if (/angular/i.test(html)) technologies.push('Angular');
  if (/wordpress|wp-content|wp-json/i.test(html)) technologies.push('WordPress');
  if (/shopify/i.test(html)) technologies.push('Shopify');
  if (/tailwind/i.test(html)) technologies.push('Tailwind CSS');
  if (/framer/i.test(html)) technologies.push('Framer Motion');
  if (/gsap/i.test(html)) technologies.push('GSAP');

  return {
    url,
    finalUrl,
    statusCode,
    title,
    metaDescription,
    metaKeywords,
    h1: h1.slice(0, 5),
    h2: h2.slice(0, 10),
    h3: h3.slice(0, 15),
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    twitterTitle,
    canonicalUrl,
    robots,
    schemaTypes,
    navItems: [...new Set(navItems)].slice(0, 20),
    ctaTexts: [...new Set(ctaTexts)].slice(0, 15),
    formCount,
    imageCount,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    wordCount,
    bodyText,
    themeColor,
    favicon,
    hasHttps: normalUrl(normalized),
    headers: responseHeaders,
    lang,
    hasSearch,
    hasNewsletter,
    hasChatWidget,
    footerLinks: [...new Set(footerLinks)].slice(0, 20),
    socialLinks: [...new Set(socialLinks)].slice(0, 10),
    technologies,
    loadTime,
  };
}

function normalUrl(url: string): boolean {
  return url.startsWith('https://');
}
