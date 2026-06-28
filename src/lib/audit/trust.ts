import crypto from 'crypto';
import type { AuditReport, ConfidenceResult } from '@/types/audit';

export function computeConfidenceScore(report: Partial<AuditReport>, html: string): ConfidenceResult {
  const factors: ConfidenceResult['factors'] = [];
  let score = 100;

  // Deduct for missing audit modules (API errors / timeouts)
  if (!report.pagespeed?.mobile?.score) {
    factors.push({ name: 'PageSpeed unavailable', impact: -10, note: 'PSI API error or quota exceeded' });
    score -= 10;
  }
  if (!report.malware || report.malware.status === 'inconclusive') {
    factors.push({ name: 'Malware check inconclusive', impact: -5, note: 'Safe Browsing API not configured' });
    score -= 5;
  }

  // Deduct for JS-heavy SPAs (limited crawl coverage)
  const isSPA = html.length < 3000 && (html.includes('id="root"') || html.includes('id="app"'));
  if (isSPA) {
    factors.push({ name: 'Possible SPA (limited HTML crawl)', impact: -15, note: 'JS-rendered content may be missed — results based on server-rendered HTML only' });
    score -= 15;
  }

  // Deduct for redirect chains
  if (html.includes('http-equiv="refresh"')) {
    factors.push({ name: 'Meta refresh detected', impact: -5, note: 'Meta refresh redirects may indicate redirect chains' });
    score -= 5;
  }

  // Reward for high content depth
  const wordCount = html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  if (wordCount > 2000) {
    factors.push({ name: 'Rich content detected', impact: 5, note: 'High word count enables more comprehensive analysis' });
    score = Math.min(100, score + 5);
  }

  return {
    confidenceScore: Math.max(0, Math.min(100, score)),
    factors,
  };
}

export function computeOverallScore(report: Partial<AuditReport>): number {
  const weights = {
    onPageScore: 0.18,
    offPageScore: 0.12,
    geoScore: 0.15,
    aeoScore: 0.12,
    worldwideSeoScore: 0.08,
    pageSpeedScore: 0.18,
    securityScore: 0.12,
    aiConfidenceBonus: 0.05,
  };

  const onPage = report.onPageScore ?? 0;
  const offPage = report.offPageScore ?? 0;
  const geo = report.geoScore ?? 0;
  const aeo = report.aeoScore ?? 0;
  const worldwide = report.worldwideSeoScore ?? 0;
  const pageSpeed = report.pageSpeedScore ?? report.pagespeed?.mobile?.score ?? 0;
  const security = report.securityScore ?? 0;
  const aiBonus = report.confidence?.confidenceScore ?? 50;

  const raw =
    onPage * weights.onPageScore +
    offPage * weights.offPageScore +
    geo * weights.geoScore +
    aeo * weights.aeoScore +
    worldwide * weights.worldwideSeoScore +
    pageSpeed * weights.pageSpeedScore +
    security * weights.securityScore +
    aiBonus * weights.aiConfidenceBonus;

  return Math.round(raw);
}

export function generateVerificationHash(report: AuditReport): string {
  const normalized = JSON.stringify({
    url: report.url,
    crawledAt: report.crawledAt,
    overallScore: report.overallScore,
    onPageScore: report.onPageScore,
    offPageScore: report.offPageScore,
    geoScore: report.geoScore,
    aeoScore: report.aeoScore,
  });
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
