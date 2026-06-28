import { validateAuditUrl } from '@/lib/security/ssrf-guard';
import { runOnPageSEO } from './on-page-seo';
import { runOffPageSEO } from './off-page-seo';
import { runGEO } from './geo-advanced';
import { runAEO } from './aeo-advanced';
import { runWorldwideSEO } from './worldwide-seo';
import { runPageSpeed } from './pagespeed';
import { runMalwareCheck } from './malware';
import { runSSLCheck } from './ssl-security';
import { detectCMS } from './cms-detector';
import { computeConfidenceScore, computeOverallScore, generateVerificationHash } from './trust';
import { generateSuggestions } from './suggestions';
import type { AuditReport } from '@/types/audit';

export type AuditProgress = {
  step: string;
  status: 'running' | 'done' | 'error';
  message?: string;
};

type ProgressCallback = (progress: AuditProgress) => void;

const FETCH_TIMEOUT = 15000;

export async function runAudit(
  rawUrl: string,
  platformHint: string,
  industryHint: string | undefined,
  dualMalware: boolean,
  onProgress?: ProgressCallback
): Promise<AuditReport> {
  // ─── 1. Validate URL (SSRF protection) ────────────────────────────────────
  const url = await validateAuditUrl(rawUrl);
  const urlString = url.toString();

  // ─── 2. Fetch HTML ────────────────────────────────────────────────────────
  onProgress?.({ step: 'Fetching page', status: 'running' });
  const fetchRes = await fetch(urlString, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
    headers: {
      'User-Agent': 'WebAuditBot/1.0 (+https://websiteaudit.app/bot)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });

  if (!fetchRes.ok) {
    throw new Error(`Failed to fetch ${urlString}: HTTP ${fetchRes.status}`);
  }

  const html = await fetchRes.text();
  const responseHeaders: Record<string, string> = {};
  fetchRes.headers.forEach((value, key) => { responseHeaders[key.toLowerCase()] = value; });

  // Trim to 5MB max
  const truncatedHtml = html.length > 5_000_000 ? html.slice(0, 5_000_000) : html;
  onProgress?.({ step: 'Fetching page', status: 'done' });

  // ─── 3. CMS Detection ────────────────────────────────────────────────────
  onProgress?.({ step: 'Detecting CMS', status: 'running' });
  const cms = detectCMS(truncatedHtml, responseHeaders);
  const detectedCms = cms.detected ?? platformHint ?? null;
  onProgress?.({ step: 'Detecting CMS', status: 'done' });

  // ─── 4. Extract page content for AI context ───────────────────────────────
  const pageContent = truncatedHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  // ─── 5. Run all audit modules in parallel where safe ──────────────────────
  onProgress?.({ step: 'On-Page SEO', status: 'running' });
  const [onPage, offPage, geo, aeo, worldwideSeo, malware, ssl] = await Promise.all([
    runOnPageSEO(truncatedHtml, urlString).then((r) => {
      onProgress?.({ step: 'On-Page SEO', status: 'done' });
      return r;
    }),
    runOffPageSEO(truncatedHtml, urlString).then((r) => {
      onProgress?.({ step: 'Off-Page SEO', status: 'done' });
      return r;
    }),
    runGEO(truncatedHtml, urlString).then((r) => {
      onProgress?.({ step: 'GEO Analysis', status: 'done' });
      return r;
    }),
    runAEO(truncatedHtml, urlString).then((r) => {
      onProgress?.({ step: 'AEO Analysis', status: 'done' });
      return r;
    }),
    runWorldwideSEO(truncatedHtml, urlString).then((r) => {
      onProgress?.({ step: 'Worldwide SEO', status: 'done' });
      return r;
    }),
    runMalwareCheck(urlString, dualMalware).then((r) => {
      onProgress?.({ step: 'Malware Check', status: 'done' });
      return r;
    }),
    runSSLCheck(urlString, responseHeaders).then((r) => {
      onProgress?.({ step: 'SSL & Security', status: 'done' });
      return r;
    }),
  ]);

  // PageSpeed runs sequentially (two separate API calls, can run in parallel)
  onProgress?.({ step: 'PageSpeed', status: 'running' });
  const pagespeed = await runPageSpeed(urlString);
  onProgress?.({ step: 'PageSpeed', status: 'done' });

  // ─── 6. Compute scores ────────────────────────────────────────────────────
  const pageSpeedScore = Math.round((pagespeed.mobile.score + pagespeed.desktop.score) / 2);
  const securityScore = ssl.score;

  const partialReport: Partial<AuditReport> = {
    url: urlString,
    onPageScore: onPage.score,
    offPageScore: offPage.score,
    geoScore: geo.geoScore,
    aeoScore: aeo.aeoScore,
    worldwideSeoScore: worldwideSeo.score,
    pageSpeedScore,
    securityScore,
    onPage,
    offPage,
    geo,
    aeo,
    worldwideSeo,
    ssl,
    pagespeed,
    malware,
  };

  const overallScore = computeOverallScore(partialReport);
  const confidence = computeConfidenceScore(partialReport, truncatedHtml);

  // ─── 7. Assemble full report ──────────────────────────────────────────────
  const report: AuditReport = {
    url: urlString,
    crawledAt: new Date().toISOString(),
    detectedCms,
    industryHint: industryHint ?? null,
    pageContent,

    onPage,
    offPage,
    geo,
    aeo,
    worldwideSeo,
    pagespeed,
    malware,
    ssl,
    cms,
    confidence,

    overallScore,
    onPageScore: onPage.score,
    offPageScore: offPage.score,
    geoScore: geo.geoScore,
    aeoScore: aeo.aeoScore,
    worldwideSeoScore: worldwideSeo.score,
    pageSpeedScore,
    securityScore,
  };

  // ─── 8. Generate rule-based suggestions (AI suggestions are async/separate) ──
  onProgress?.({ step: 'Generating Suggestions', status: 'running' });
  // Rule-based suggestions are synchronous and always generated
  // AI suggestions come from a separate worker job
  onProgress?.({ step: 'Generating Suggestions', status: 'done' });

  return report;
}

export function computeRuleBasedSuggestions(report: AuditReport) {
  return generateSuggestions(report, report.detectedCms);
}

export function buildVerificationHash(report: AuditReport): string {
  return generateVerificationHash(report);
}
