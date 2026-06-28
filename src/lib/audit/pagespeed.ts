import type { PageSpeedResult } from '@/types/audit';

type PSIResponse = {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } };
    audits?: Record<string, {
      displayValue?: string;
      numericValue?: number;
      details?: { items?: Array<{ description: string; displayValue?: string }> };
    }>;
  };
};

async function callPSI(url: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    return { score: 0, lcp: null, cls: null, tbt: null, fcp: null, speedIndex: null, opportunities: [] };
  }

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`PSI returned ${res.status}`);
    const data = (await res.json()) as PSIResponse;

    const lr = data.lighthouseResult;
    const audits = lr?.audits ?? {};

    const score = Math.round((lr?.categories?.performance?.score ?? 0) * 100);
    const lcp = audits['largest-contentful-paint']?.numericValue ?? null;
    const cls = audits['cumulative-layout-shift']?.numericValue ?? null;
    const tbt = audits['total-blocking-time']?.numericValue ?? null;
    const fcp = audits['first-contentful-paint']?.numericValue ?? null;
    const speedIndex = audits['speed-index']?.numericValue ?? null;

    const opportunityKeys = [
      'render-blocking-resources',
      'uses-optimized-images',
      'uses-webp-images',
      'unused-javascript',
      'unused-css-rules',
      'uses-text-compression',
    ];

    const opportunities = opportunityKeys
      .filter((k) => audits[k]?.displayValue)
      .map((k) => ({
        title: k.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        savings: audits[k].displayValue!,
      }));

    return { score, lcp, cls, tbt, fcp, speedIndex, opportunities };
  } catch (err) {
    console.error('PSI error:', err);
    return { score: 0, lcp: null, cls: null, tbt: null, fcp: null, speedIndex: null, opportunities: [] };
  }
}

export async function runPageSpeed(url: string): Promise<{ mobile: PageSpeedResult; desktop: PageSpeedResult }> {
  const [mobile, desktop] = await Promise.all([
    callPSI(url, 'mobile'),
    callPSI(url, 'desktop'),
  ]);
  return { mobile, desktop };
}
