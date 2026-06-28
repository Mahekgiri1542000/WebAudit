import * as cheerio from 'cheerio';
import type { GEOResult, CheckItem } from '@/types/audit';

function isDisallowed(robotsTxt: string, botName: string): boolean {
  const lines = robotsTxt.split('\n');
  let inBlock = false;
  const botLower = botName.toLowerCase();
  for (const line of lines) {
    const l = line.trim().toLowerCase();
    if (l.startsWith('user-agent:')) {
      const agent = l.replace('user-agent:', '').trim();
      inBlock = agent === botLower || agent === '*';
    }
    if (inBlock && l.startsWith('disallow: /') && !l.startsWith('disallow: /path-does-not-exist')) {
      if (l === 'disallow: /') return true;
    }
    if (l === '') inBlock = false;
  }
  return false;
}

async function safeGet(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'WebAuditBot/1.0' },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function runGEO(html: string, url: string): Promise<GEOResult> {
  const $ = cheerio.load(html);
  const origin = new URL(url).origin;
  const checks: CheckItem[] = [];
  const criticalBlockers: string[] = [];

  // ─── AI Bot Crawlability ──────────────────────────────────────────────────
  const robotsTxt = (await safeGet(`${origin}/robots.txt`)) ?? '';
  const gpTBotAllowed = !isDisallowed(robotsTxt, 'GPTBot');
  const claudeBotAllowed = !isDisallowed(robotsTxt, 'ClaudeBot');
  const perplexityAllowed = !isDisallowed(robotsTxt, 'PerplexityBot');
  const googleAIOAllowed = !isDisallowed(robotsTxt, 'Googlebot');
  const llmsTxtContent = await safeGet(`${origin}/llms.txt`);
  const hasLlmsTxt = !!llmsTxtContent;

  if (!gpTBotAllowed) criticalBlockers.push('GPTBot blocked in robots.txt — cannot appear in ChatGPT search');
  if (!claudeBotAllowed) criticalBlockers.push('ClaudeBot blocked — cannot be cited by Claude AI');
  if (!perplexityAllowed) criticalBlockers.push('PerplexityBot blocked — cannot appear in Perplexity AI');

  checks.push({
    id: 'gptbot-allowed',
    title: 'GPTBot Crawlability',
    status: gpTBotAllowed ? 'pass' : 'fail',
    severity: 'critical',
    value: gpTBotAllowed ? 'Allowed' : 'Blocked',
    note: gpTBotAllowed ? 'GPTBot can crawl — eligible for ChatGPT citations' : 'GPTBot blocked in robots.txt',
  });

  checks.push({
    id: 'claudebot-allowed',
    title: 'ClaudeBot Crawlability',
    status: claudeBotAllowed ? 'pass' : 'fail',
    severity: 'critical',
    value: claudeBotAllowed ? 'Allowed' : 'Blocked',
    note: claudeBotAllowed ? 'ClaudeBot can crawl' : 'ClaudeBot blocked — add "User-agent: ClaudeBot" allow rule',
  });

  checks.push({
    id: 'perplexitybot-allowed',
    title: 'PerplexityBot Crawlability',
    status: perplexityAllowed ? 'pass' : 'warn',
    severity: 'high',
    value: perplexityAllowed ? 'Allowed' : 'Blocked',
    note: perplexityAllowed ? 'PerplexityBot allowed' : 'PerplexityBot blocked — missing Perplexity AI citations',
  });

  checks.push({
    id: 'llms-txt',
    title: 'llms.txt File',
    status: hasLlmsTxt ? 'pass' : 'warn',
    severity: 'medium',
    value: hasLlmsTxt ? 'Present' : null,
    note: hasLlmsTxt
      ? 'llms.txt found — AI crawlers have a structured site description'
      : 'No llms.txt at /llms.txt — add one to give AI crawlers context about your site',
  });

  // ─── E-E-A-T signals ──────────────────────────────────────────────────────
  const authorEl = $('[rel="author"], .author, [itemprop="author"], meta[name="author"]');
  const hasAuthorByline = authorEl.length > 0;

  checks.push({
    id: 'author-byline',
    title: 'Author Bylines',
    status: hasAuthorByline ? 'pass' : 'warn',
    severity: 'medium',
    value: hasAuthorByline ? authorEl.first().text().trim() || 'Present' : null,
    note: hasAuthorByline
      ? 'Author bylines found — good E-E-A-T signal'
      : 'No author byline — AI engines prefer attributing expertise to a named person',
  });

  const aboutLinked = $('a[href*="/about"], a[href*="/about-us"], a[href*="/team"]').length > 0;
  checks.push({
    id: 'about-page',
    title: 'About / Team Page Linked',
    status: aboutLinked ? 'pass' : 'warn',
    severity: 'medium',
    value: aboutLinked ? 'Linked' : null,
    note: aboutLinked
      ? 'About/team page linked from navigation'
      : 'No About page link found — add About page to establish expertise',
  });

  // ─── Organization schema + entity signals ─────────────────────────────────
  const ldJsonBlocks = $('script[type="application/ld+json"]')
    .map((_, el) => { try { return JSON.parse($(el).html() ?? '{}'); } catch { return {}; } })
    .get() as Record<string, unknown>[];

  const orgSchema = ldJsonBlocks.find((b) => b['@type'] === 'Organization');
  const sameAsLinks = (orgSchema?.sameAs as string[] | undefined) ?? [];

  const hasWikipedia = sameAsLinks.some((l) => l.includes('wikipedia.org'));
  const hasWikidata = sameAsLinks.some((l) => l.includes('wikidata.org'));
  const hasLinkedInOrg = sameAsLinks.some((l) => l.includes('linkedin.com'));

  checks.push({
    id: 'org-schema',
    title: 'Organization Schema',
    status: orgSchema ? (sameAsLinks.length > 0 ? 'pass' : 'warn') : 'fail',
    severity: orgSchema ? 'medium' : 'high',
    value: orgSchema ? `sameAs: ${sameAsLinks.length} links` : null,
    note: !orgSchema
      ? 'No Organization schema — AI engines cannot identify your brand entity'
      : sameAsLinks.length === 0
        ? 'Organization schema found but no sameAs links — add Wikipedia/Wikidata/LinkedIn'
        : `Entity linked to ${sameAsLinks.length} external source(s)`,
  });

  checks.push({
    id: 'entity-wikidata',
    title: 'Wikidata / Wikipedia Entity',
    status: hasWikipedia || hasWikidata ? 'pass' : 'warn',
    severity: 'low',
    value: hasWikipedia ? 'Wikipedia' : hasWikidata ? 'Wikidata' : null,
    note:
      hasWikipedia || hasWikidata
        ? 'Wikipedia/Wikidata link in sameAs — strong entity authority signal'
        : 'No Wikipedia/Wikidata link — establishing a Wikipedia presence significantly boosts AI citation frequency',
  });

  // ─── Trust signals ────────────────────────────────────────────────────────
  const hasPrivacyPolicy = $('a[href*="privacy"]').length > 0;
  const hasContactPage = $('a[href*="contact"]').length > 0;

  checks.push({
    id: 'trust-pages',
    title: 'Privacy Policy + Contact Page',
    status: hasPrivacyPolicy && hasContactPage ? 'pass' : 'warn',
    severity: 'medium',
    value: `privacy:${hasPrivacyPolicy}, contact:${hasContactPage}`,
    note:
      hasPrivacyPolicy && hasContactPage
        ? 'Trust pages linked'
        : `Missing: ${[!hasPrivacyPolicy && 'Privacy Policy', !hasContactPage && 'Contact Page'].filter(Boolean).join(', ')}`,
  });

  // ─── Content quality ──────────────────────────────────────────────────────
  const mainContent = $('main, article, .content').first().text().replace(/\s+/g, ' ');
  const wordCount = mainContent.split(' ').filter(Boolean).length;
  const hasCitableStats = /\d+(\.\d+)?(%|times|x|billion|million|thousand|percent)/i.test(mainContent);
  const hasDataTables = $('table').length > 0;

  checks.push({
    id: 'content-depth',
    title: 'Content Depth for AI Citation',
    status: wordCount >= 1500 ? 'pass' : wordCount >= 600 ? 'warn' : 'fail',
    severity: wordCount < 600 ? 'high' : 'medium',
    value: `${wordCount} words`,
    note:
      wordCount >= 1500
        ? 'Comprehensive content — AI engines prefer citing thorough sources'
        : `${wordCount} words — target 1,500+ for better AI citation frequency`,
  });

  checks.push({
    id: 'citable-stats',
    title: 'Citable Statistics',
    status: hasCitableStats ? 'pass' : 'warn',
    severity: 'medium',
    value: hasCitableStats ? 'Found' : null,
    note: hasCitableStats
      ? 'Statistics and specific data found — makes content highly quotable by AI'
      : 'No statistics found — adding specific data points increases AI citation frequency',
  });

  checks.push({
    id: 'data-tables',
    title: 'Data Tables',
    status: hasDataTables ? 'pass' : 'warn',
    severity: 'low',
    value: hasDataTables ? `${$('table').length} table(s)` : null,
    note: hasDataTables ? 'Tables found — excellent for AI structured extraction' : 'No data tables — tables are frequently cited by AI in comparison answers',
  });

  // ─── HTTPS (hard requirement) ─────────────────────────────────────────────
  const isHttps = url.startsWith('https://');
  if (!isHttps) criticalBlockers.push('Not HTTPS — AI engines deprioritize insecure sites');

  // ─── Score computation ────────────────────────────────────────────────────
  const crawlabilityChecks = checks.filter((c) =>
    ['gptbot-allowed', 'claudebot-allowed', 'perplexitybot-allowed', 'llms-txt'].includes(c.id)
  );
  const eeaTChecks = checks.filter((c) =>
    ['author-byline', 'about-page', 'org-schema', 'entity-wikidata', 'trust-pages'].includes(c.id)
  );
  const contentChecks = checks.filter((c) =>
    ['content-depth', 'citable-stats', 'data-tables'].includes(c.id)
  );

  const crawlabilityScore = Math.round(
    (crawlabilityChecks.filter((c) => c.status === 'pass').length / crawlabilityChecks.length) * 100
  );
  const eeaTScore = Math.round(
    (eeaTChecks.filter((c) => c.status === 'pass').length / eeaTChecks.length) * 100
  );
  const contentQualityScore = Math.round(
    (contentChecks.filter((c) => c.status === 'pass').length / contentChecks.length) * 100
  );

  const entityScore = orgSchema ? Math.min(100, sameAsLinks.length * 20 + (hasWikipedia ? 40 : 0) + (hasLinkedInOrg ? 20 : 0)) : 0;

  const geoScore = Math.round(
    crawlabilityScore * 0.25 +
    eeaTScore * 0.30 +
    contentQualityScore * 0.25 +
    entityScore * 0.20
  );

  return {
    geoScore,
    eeaTScore,
    entityScore,
    crawlabilityScore,
    contentQualityScore,
    checks,
    criticalBlockers,
    aiBotCrawlability: {
      gpTBotAllowed,
      claudeBotAllowed,
      perplexityAllowed,
      googleAIOAllowed,
      hasLlmsTxt,
    },
  };
}
