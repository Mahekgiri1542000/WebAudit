import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUserPlanTier } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import type { AuditReport, Suggestion, CheckItem } from '@/types/audit';

type Format = 'csv' | 'json' | 'txt' | 'doc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function csvEsc(v: unknown): string {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(...cols: unknown[]): string { return cols.map(csvEsc).join(','); }

const scoreLabel = (n: number | null) => !n ? 'N/A' : n >= 90 ? 'Excellent' : n >= 75 ? 'Good' : n >= 60 ? 'Average' : n >= 40 ? 'Below Average' : 'Poor';
const scoreColor = (n: number | null) => !n ? '#94a3b8' : n >= 80 ? '#16a34a' : n >= 50 ? '#d97706' : '#dc2626';
const scoreBg = (n: number | null) => !n ? '#f8fafc' : n >= 80 ? '#f0fdf4' : n >= 50 ? '#fffbeb' : '#fef2f2';

// ─── CSV ──────────────────────────────────────────────────────────────────────

function toCSV(audit: AuditData, report: AuditReport | null, suggestions: Suggestion[]): string {
  const lines: string[] = [];
  lines.push('SECTION,FIELD,VALUE');
  lines.push(row('Summary', 'URL', audit.url));
  lines.push(row('Summary', 'Audit Date', new Date(audit.createdAt).toISOString()));
  lines.push(row('Summary', 'CMS Detected', audit.detectedCms ?? 'Unknown'));
  lines.push(row('Summary', 'Overall Score', audit.overallScore ?? ''));
  lines.push(row('Summary', 'On-Page SEO Score', audit.onPageScore ?? ''));
  lines.push(row('Summary', 'Off-Page SEO Score', audit.offPageScore ?? ''));
  lines.push(row('Summary', 'GEO Score', audit.geoScore ?? ''));
  lines.push(row('Summary', 'AEO Score', audit.aeoScore ?? ''));
  lines.push(row('Summary', 'Worldwide SEO Score', audit.worldwideSeoScore ?? ''));
  lines.push(row('Summary', 'PageSpeed Score', audit.pageSpeedScore ?? ''));
  lines.push(row('Summary', 'Security Score', audit.securityScore ?? ''));

  if (report) {
    lines.push(row('Summary', 'Confidence Score', report.confidence.confidenceScore));
    lines.push(row('On-Page', 'Meta Title', report.onPage.metaTitle ?? ''));
    lines.push(row('On-Page', 'Meta Description', report.onPage.metaDescription ?? ''));
    lines.push(row('On-Page', 'H1', report.onPage.h1 ?? ''));
    lines.push(row('On-Page', 'Word Count', report.onPage.wordCount));
    lines.push(row('On-Page', 'Images Missing Alt', report.onPage.imagesMissingAlt));
    lines.push(row('On-Page', 'Internal Links', report.onPage.internalLinks));
    lines.push(row('On-Page', 'Has Open Graph', report.onPage.hasOpenGraph));
    lines.push(row('PageSpeed', 'Mobile LCP (ms)', report.pagespeed.mobile.lcp ?? ''));
    lines.push(row('PageSpeed', 'Mobile CLS', report.pagespeed.mobile.cls ?? ''));
    lines.push(row('PageSpeed', 'Mobile TBT (ms)', report.pagespeed.mobile.tbt ?? ''));
    lines.push(row('PageSpeed', 'Mobile FCP (ms)', report.pagespeed.mobile.fcp ?? ''));
    lines.push(row('Security', 'HTTPS Enabled', report.ssl.httpsEnabled));
    lines.push(row('Security', 'SSL Grade', report.ssl.grade));
    lines.push(row('Security', 'Cert Valid', report.ssl.certValid));
    lines.push(row('Security', 'Days Until Expiry', report.ssl.daysUntilExpiry ?? ''));
    lines.push(row('Security', 'Malware Status', report.malware.status));
    lines.push(row('GEO', 'GPTBot Allowed', report.geo.aiBotCrawlability.gpTBotAllowed));
    lines.push(row('GEO', 'ClaudeBot Allowed', report.geo.aiBotCrawlability.claudeBotAllowed));
    lines.push(row('GEO', 'Has llms.txt', report.geo.aiBotCrawlability.hasLlmsTxt));
    lines.push('');
    lines.push('CHECKS');
    lines.push(row('Category', 'Check ID', 'Title', 'Status', 'Severity', 'Value', 'Note'));
    const addChecks = (cat: string, checks: CheckItem[]) => {
      for (const c of checks) lines.push(row(cat, c.id, c.title, c.status, c.severity, c.value ?? '', c.note));
    };
    addChecks('On-Page SEO', report.onPage.checks);
    addChecks('Off-Page SEO', report.offPage.checks);
    addChecks('GEO', report.geo.checks);
    addChecks('AEO', report.aeo.checks);
    addChecks('Worldwide SEO', report.worldwideSeo.checks);
    addChecks('Security', report.ssl.checks);
    addChecks('Malware', report.malware.checks);
  }

  lines.push('');
  lines.push('SUGGESTIONS');
  lines.push(row('Priority', 'Category', 'Effort', 'Title', 'Description', 'Current Value', 'Target Value', 'Estimated Impact'));
  for (const s of suggestions) lines.push(row(s.priority, s.category, s.effortLevel, s.title, s.description, s.currentValue ?? '', s.targetValue ?? '', s.estimatedImpact));

  return lines.join('\n');
}

// ─── TXT ──────────────────────────────────────────────────────────────────────

function toTXT(audit: AuditData, report: AuditReport | null, suggestions: Suggestion[]): string {
  const lines: string[] = [];
  const hr = '═'.repeat(60);
  const hr2 = '─'.repeat(60);
  const sc = (n: number | null) => n !== null ? `${n}/100 (${scoreLabel(n)})` : 'N/A';

  lines.push('');
  lines.push('  ██╗    ██╗███████╗██████╗  █████╗ ██╗   ██╗██████╗ ██╗████████╗');
  lines.push('  ██║    ██║██╔════╝██╔══██╗██╔══██╗██║   ██║██╔══██╗██║╚══██╔══╝');
  lines.push('  ██║ █╗ ██║█████╗  ██████╔╝███████║██║   ██║██║  ██║██║   ██║   ');
  lines.push('  ██║███╗██║██╔══╝  ██╔══██╗██╔══██║██║   ██║██║  ██║██║   ██║   ');
  lines.push('  ╚███╔███╔╝███████╗██████╔╝██║  ██║╚██████╔╝██████╔╝██║   ██║   ');
  lines.push('   ╚══╝╚══╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝   ╚═╝   ');
  lines.push('');
  lines.push('  Website SEO & Performance Audit Report');
  lines.push(hr);
  lines.push('');
  lines.push(`  URL:          ${audit.url}`);
  lines.push(`  Date:         ${new Date(audit.createdAt).toLocaleString()}`);
  lines.push(`  CMS:          ${audit.detectedCms ?? 'Unknown'}`);
  lines.push('');
  lines.push(hr);
  lines.push('  SCORE SUMMARY');
  lines.push(hr);
  lines.push('');

  const bar = (n: number | null, width = 30) => {
    if (n === null) return '[N/A]';
    const filled = Math.round((n / 100) * width);
    return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${n}/100`;
  };

  lines.push(`  Overall Score:      ${bar(audit.overallScore)}`);
  lines.push(`  On-Page SEO:        ${bar(audit.onPageScore)}`);
  lines.push(`  Off-Page SEO:       ${bar(audit.offPageScore)}`);
  lines.push(`  GEO (AI Search):    ${bar(audit.geoScore)}`);
  lines.push(`  AEO (Voice/Feat.):  ${bar(audit.aeoScore)}`);
  lines.push(`  Worldwide SEO:      ${bar(audit.worldwideSeoScore)}`);
  lines.push(`  PageSpeed:          ${bar(audit.pageSpeedScore)}`);
  lines.push(`  Security:           ${bar(audit.securityScore)}`);
  lines.push('');

  if (report) {
    lines.push(hr);
    lines.push('  PAGE DETAILS');
    lines.push(hr);
    lines.push('');
    lines.push(`  Meta Title:      ${report.onPage.metaTitle ?? '⚠ MISSING'}`);
    lines.push(`  Meta Desc:       ${report.onPage.metaDescription ?? '⚠ MISSING'}`);
    lines.push(`  H1 Heading:      ${report.onPage.h1 ?? '⚠ MISSING'}`);
    lines.push(`  Word Count:      ${report.onPage.wordCount}`);
    lines.push(`  Internal Links:  ${report.onPage.internalLinks}`);
    lines.push(`  External Links:  ${report.onPage.externalLinks}`);
    lines.push(`  Images w/o Alt:  ${report.onPage.imagesMissingAlt}`);
    lines.push(`  Open Graph:      ${report.onPage.hasOpenGraph ? '✓ Yes' : '✗ No'}`);
    lines.push(`  Twitter Card:    ${report.onPage.hasTwitterCard ? '✓ Yes' : '✗ No'}`);
    lines.push('');
    lines.push(hr);
    lines.push('  PAGESPEED — CORE WEB VITALS');
    lines.push(hr);
    lines.push('');
    lines.push(`  Mobile Score:    ${sc(report.pagespeed.mobile.score)}`);
    lines.push(`  Desktop Score:   ${sc(report.pagespeed.desktop.score)}`);
    lines.push(`  LCP Mobile:      ${report.pagespeed.mobile.lcp ? `${report.pagespeed.mobile.lcp}ms` : 'N/A'}  (target: < 2500ms)`);
    lines.push(`  CLS Mobile:      ${report.pagespeed.mobile.cls ?? 'N/A'}  (target: < 0.1)`);
    lines.push(`  TBT Mobile:      ${report.pagespeed.mobile.tbt ? `${report.pagespeed.mobile.tbt}ms` : 'N/A'}  (target: < 200ms)`);
    lines.push(`  FCP Mobile:      ${report.pagespeed.mobile.fcp ? `${report.pagespeed.mobile.fcp}ms` : 'N/A'}  (target: < 1800ms)`);
    lines.push('');
    lines.push(hr);
    lines.push('  SECURITY');
    lines.push(hr);
    lines.push('');
    lines.push(`  HTTPS:           ${report.ssl.httpsEnabled ? '✓ Enabled' : '✗ NOT enabled'}`);
    lines.push(`  SSL Grade:       ${report.ssl.grade}`);
    lines.push(`  Cert Valid:      ${report.ssl.certValid ? '✓ Valid' : '✗ Invalid'}`);
    lines.push(`  Cert Expires:    ${report.ssl.daysUntilExpiry != null ? `${report.ssl.daysUntilExpiry} days` : 'Unknown'}`);
    lines.push(`  Malware:         ${report.malware.status.toUpperCase()}`);
    lines.push('');
    lines.push('  Security Headers:');
    for (const [h, v] of Object.entries(report.ssl.headers)) {
      lines.push(`    ${v ? '✓' : '✗'} ${h}`);
    }
    lines.push('');
    lines.push(hr);
    lines.push('  AI CRAWLABILITY (GEO)');
    lines.push(hr);
    lines.push('');
    lines.push(`  GPTBot:          ${report.geo.aiBotCrawlability.gpTBotAllowed ? '✓ Allowed' : '✗ Blocked'}`);
    lines.push(`  ClaudeBot:       ${report.geo.aiBotCrawlability.claudeBotAllowed ? '✓ Allowed' : '✗ Blocked'}`);
    lines.push(`  PerplexityBot:   ${report.geo.aiBotCrawlability.perplexityAllowed ? '✓ Allowed' : '✗ Blocked'}`);
    lines.push(`  Google AIO:      ${report.geo.aiBotCrawlability.googleAIOAllowed ? '✓ Allowed' : '✗ Blocked'}`);
    lines.push(`  llms.txt:        ${report.geo.aiBotCrawlability.hasLlmsTxt ? '✓ Present' : '⚠ Missing (recommended)'}`);

    const critical = [
      ...report.onPage.checks,
      ...report.offPage.checks,
      ...report.geo.checks,
      ...report.ssl.checks,
    ].filter(c => c.status === 'fail' && (c.severity === 'critical' || c.severity === 'high'));

    if (critical.length > 0) {
      lines.push('');
      lines.push(hr);
      lines.push('  CRITICAL & HIGH PRIORITY ISSUES');
      lines.push(hr);
      lines.push('');
      for (const c of critical) {
        lines.push(`  [${c.severity.toUpperCase()}] ${c.title}`);
        lines.push(`         ${c.note}`);
        lines.push('');
      }
    }
  }

  if (suggestions.length > 0) {
    lines.push(hr);
    lines.push('  ACTION PLAN');
    lines.push(hr);
    lines.push('');
    const byP: Record<string, Suggestion[]> = { critical: [], high: [], medium: [], low: [] };
    for (const s of suggestions) byP[s.priority]?.push(s);
    for (const [p, items] of Object.entries(byP)) {
      if (!items.length) continue;
      lines.push(`  ${p.toUpperCase()} PRIORITY  (${items.length} items)`);
      lines.push(hr2);
      for (const s of items) {
        lines.push(`  • [${s.effortLevel.toUpperCase()}] ${s.title}`);
        lines.push(`    ${s.description}`);
        if (s.currentValue) lines.push(`    Current: ${s.currentValue}`);
        if (s.targetValue) lines.push(`    Target:  ${s.targetValue}`);
        lines.push(`    Impact:  ${s.estimatedImpact}`);
        lines.push('');
      }
    }
  }

  lines.push(hr);
  lines.push(`  Generated by WebAudit on ${new Date().toISOString()}`);
  lines.push(`  ${audit.url}`);
  lines.push('');

  return lines.join('\n');
}

// ─── DOC (Professional Word-compatible HTML) ──────────────────────────────────

function toDOC(audit: AuditData, report: AuditReport | null, suggestions: Suggestion[]): string {
  const sc = (n: number | null) => n !== null ? `${n}/100` : 'N/A';
  const bool = (v: boolean) => v ? '✓&nbsp;Yes' : '✗&nbsp;No';
  const boolColor = (v: boolean) => v ? '#16a34a' : '#dc2626';

  const checksTable = (checks: CheckItem[]) => {
    if (!checks.length) return '<p style="color:#94a3b8;font-style:italic;font-size:10pt">No checks available.</p>';
    return `
      <table style="width:100%;border-collapse:collapse;font-size:9.5pt;margin-bottom:8pt">
        <thead>
          <tr style="background:#eff6ff">
            <th style="padding:6pt 8pt;border:1pt solid #bfdbfe;font-weight:700;color:#1e40af;text-align:left;width:35%">Check</th>
            <th style="padding:6pt 8pt;border:1pt solid #bfdbfe;font-weight:700;color:#1e40af;text-align:center;width:10%">Status</th>
            <th style="padding:6pt 8pt;border:1pt solid #bfdbfe;font-weight:700;color:#1e40af;text-align:center;width:12%">Severity</th>
            <th style="padding:6pt 8pt;border:1pt solid #bfdbfe;font-weight:700;color:#1e40af;text-align:left">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${checks.map((c, i) => {
            const statusColor = c.status === 'pass' ? '#16a34a' : c.status === 'fail' ? '#dc2626' : '#d97706';
            const statusIcon = c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '⚠';
            const sevColor = c.severity === 'critical' ? '#dc2626' : c.severity === 'high' ? '#ea580c' : c.severity === 'medium' ? '#d97706' : '#64748b';
            const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
            return `<tr style="background:${rowBg}">
              <td style="padding:5pt 8pt;border:1pt solid #e2e8f0;font-size:9pt">${c.title}</td>
              <td style="padding:5pt 8pt;border:1pt solid #e2e8f0;text-align:center;color:${statusColor};font-weight:700;font-size:11pt">${statusIcon}</td>
              <td style="padding:5pt 8pt;border:1pt solid #e2e8f0;text-align:center">
                <span style="color:${sevColor};font-weight:700;font-size:8pt;text-transform:uppercase">${c.severity}</span>
              </td>
              <td style="padding:5pt 8pt;border:1pt solid #e2e8f0;font-size:9pt;color:#475569">${c.note}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  };

  const scoreBox = (label: string, n: number | null) => `
    <td style="padding:10pt;text-align:center;background:${scoreBg(n)};border:1.5pt solid ${scoreColor(n)}33;border-radius:6pt;vertical-align:middle">
      <div style="font-size:24pt;font-weight:900;color:${scoreColor(n)};line-height:1">${sc(n)}</div>
      <div style="font-size:8pt;color:#64748b;margin-top:3pt;text-transform:uppercase;letter-spacing:0.5pt;font-weight:600">${label}</div>
      <div style="font-size:9pt;font-weight:700;color:${scoreColor(n)};margin-top:2pt">${scoreLabel(n)}</div>
    </td>`;

  const hostname = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();

  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="UTF-8">
  <title>WebAudit Report — ${audit.url}</title>
  <!--[if gte mso 9]>
  <xml><w:WordDocument>
    <w:View>Print</w:View><w:Zoom>90</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument></xml><![endif]-->
  <style>
    @page { size: A4; margin: 2.5cm 2cm; }
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; margin: 0; padding: 0; }
    h1 { font-size: 26pt; font-weight: 900; color: #1e3a8a; margin: 0 0 6pt; letter-spacing: -0.5pt; page-break-after: avoid; }
    h2 { font-size: 15pt; font-weight: 800; color: #1e40af; margin: 24pt 0 4pt; border-bottom: 2pt solid #bfdbfe; padding-bottom: 4pt; page-break-after: avoid; }
    h3 { font-size: 11pt; font-weight: 700; color: #374151; margin: 14pt 0 4pt; page-break-after: avoid; }
    p { margin: 4pt 0 8pt; font-size: 10.5pt; color: #374151; }
    table { border-collapse: collapse; width: 100%; margin: 6pt 0 12pt; }
    .cover { background: linear-gradient(135deg, #1a1f6e, #0f1240); color: white; padding: 48pt 40pt; page-break-after: always; }
    .cover-logo { font-size: 26pt; font-weight: 900; color: white; margin-bottom: 48pt; }
    .cover-logo-accent { color: #f07b29; }
    .cover-badge { display: inline-block; background: rgba(240,123,41,0.3); color: #fdba74; padding: 3pt 12pt; border-radius: 20pt; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1pt; margin-bottom: 12pt; }
    .cover-title { font-size: 32pt; font-weight: 900; color: white; line-height: 1.2; margin-bottom: 12pt; }
    .cover-url { font-size: 14pt; color: #93c5fd; margin-bottom: 4pt; }
    .cover-date { font-size: 11pt; color: #94a3b8; margin-bottom: 48pt; }
    .cover-score { font-size: 72pt; font-weight: 900; line-height: 1; }
    .section-label { font-size: 10pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1pt; margin-bottom: 8pt; margin-top: 4pt; }
    .alert-critical { background: #fef2f2; border-left: 3pt solid #dc2626; padding: 8pt 12pt; margin-bottom: 8pt; border-radius: 0 4pt 4pt 0; }
    .alert-high { background: #fff7ed; border-left: 3pt solid #ea580c; padding: 8pt 12pt; margin-bottom: 8pt; border-radius: 0 4pt 4pt 0; }
    .alert-title { font-size: 11pt; font-weight: 700; color: #1e293b; margin: 0 0 3pt; }
    .alert-desc { font-size: 10pt; color: #64748b; margin: 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; margin: 8pt 0; }
    .info-box { background: #f8fafc; border: 1pt solid #e2e8f0; border-radius: 4pt; padding: 8pt 12pt; }
    .info-label { font-size: 8.5pt; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5pt; }
    .info-value { font-size: 12pt; font-weight: 700; color: #1e293b; margin-top: 2pt; }
    .footer { color: #94a3b8; font-size: 9pt; border-top: 1pt solid #e2e8f0; padding-top: 8pt; margin-top: 20pt; }
    .ai-badge { display: inline-block; background: #f3e8ff; color: #7c3aed; padding: 2pt 8pt; border-radius: 20pt; font-size: 8.5pt; font-weight: 700; }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════ COVER PAGE -->
<div class="cover">
  <div class="cover-logo"><span class="cover-logo-accent">Web</span>Audit</div>
  <div class="cover-badge">SEO Audit Report</div>
  <div class="cover-title">Website Performance<br>&amp; SEO Analysis</div>
  <div class="cover-url">${hostname}</div>
  <div class="cover-date">Generated: ${new Date(audit.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>

  <table style="border:none;width:100%;margin:0">
    <tr>
      <td style="border:none;vertical-align:top;width:40%">
        <div style="color:#94a3b8;font-size:10pt;margin-bottom:8pt;text-transform:uppercase;letter-spacing:1pt">Overall Score</div>
        <div class="cover-score" style="color:${scoreColor(audit.overallScore)}">${audit.overallScore ?? 'N/A'}</div>
        <div style="font-size:16pt;font-weight:700;color:${scoreColor(audit.overallScore)};margin-top:4pt">${scoreLabel(audit.overallScore)}</div>
      </td>
      <td style="border:none;vertical-align:top;padding-left:32pt">
        <div style="background:rgba(255,255,255,0.08);border:1pt solid rgba(255,255,255,0.15);border-radius:8pt;padding:16pt">
          <table style="border:none;margin:0">
            <tr>
              ${[
                { l: 'On-Page SEO', v: audit.onPageScore },
                { l: 'PageSpeed', v: audit.pageSpeedScore },
              ].map(s => `<td style="border:none;text-align:center;padding:0 16pt 0 0"><div style="font-size:22pt;font-weight:900;color:${scoreColor(s.v)}">${s.v ?? 'N/A'}</div><div style="font-size:8pt;color:#94a3b8;text-transform:uppercase">${s.l}</div></td>`).join('')}
            </tr>
            <tr>
              ${[
                { l: 'Security', v: audit.securityScore },
                { l: 'GEO / AI', v: audit.geoScore },
              ].map(s => `<td style="border:none;text-align:center;padding:12pt 16pt 0 0"><div style="font-size:22pt;font-weight:900;color:${scoreColor(s.v)}">${s.v ?? 'N/A'}</div><div style="font-size:8pt;color:#94a3b8;text-transform:uppercase">${s.l}</div></td>`).join('')}
            </tr>
          </table>
        </div>
        <div style="margin-top:12pt;color:#94a3b8;font-size:9.5pt">
          CMS: <strong style="color:#e2e8f0">${audit.detectedCms ?? 'Unknown'}</strong> &nbsp;|&nbsp;
          ${report ? `Confidence: <strong style="color:#e2e8f0">${report.confidence.confidenceScore}%</strong>` : ''}
        </div>
      </td>
    </tr>
  </table>
</div>

<!-- ══════════════════════════════════════════════════════════ SCORE BREAKDOWN -->
<h2>📊 Score Breakdown</h2>
<p style="color:#64748b;font-size:10pt">Performance across all audited categories</p>

<table style="margin-bottom:16pt">
  <tr>
    ${scoreBox('On-Page SEO', audit.onPageScore)}
    ${scoreBox('Off-Page SEO', audit.offPageScore)}
    ${scoreBox('GEO / AI', audit.geoScore)}
    ${scoreBox('AEO / Voice', audit.aeoScore)}
  </tr>
  <tr style="border-top:8pt solid transparent">
    ${scoreBox('Worldwide SEO', audit.worldwideSeoScore)}
    ${scoreBox('PageSpeed', audit.pageSpeedScore)}
    ${scoreBox('Security', audit.securityScore)}
    ${scoreBox('Overall', audit.overallScore)}
  </tr>
</table>

<table>
  <thead>
    <tr style="background:#eff6ff">
      <th style="padding:7pt 10pt;border:1pt solid #bfdbfe;text-align:left;font-size:9pt;color:#1e40af;text-transform:uppercase">Category</th>
      <th style="padding:7pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af;text-transform:uppercase">Score</th>
      <th style="padding:7pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af;text-transform:uppercase">Rating</th>
      ${report ? `<th style="padding:7pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af;text-transform:uppercase">Checks</th>
      <th style="padding:7pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af;text-transform:uppercase">Issues</th>` : ''}
    </tr>
  </thead>
  <tbody>
    ${report ? [
      { cat: 'On-Page SEO', val: audit.onPageScore, checks: report.onPage.checks },
      { cat: 'Off-Page SEO', val: audit.offPageScore, checks: report.offPage.checks },
      { cat: 'GEO / AI Search', val: audit.geoScore, checks: report.geo.checks },
      { cat: 'AEO / Voice Search', val: audit.aeoScore, checks: report.aeo.checks },
      { cat: 'Worldwide SEO', val: audit.worldwideSeoScore, checks: report.worldwideSeo.checks },
      { cat: 'PageSpeed', val: audit.pageSpeedScore, checks: [] },
      { cat: 'Security', val: audit.securityScore, checks: [...report.ssl.checks, ...report.malware.checks] },
    ].map((row, i) => {
      const passed = row.checks.filter(c => c.status === 'pass').length;
      const failed = row.checks.filter(c => c.status === 'fail').length;
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;font-weight:600">${row.cat}</td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:900;font-size:13pt;color:${scoreColor(row.val)}">${sc(row.val)}</td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${scoreColor(row.val)}">${scoreLabel(row.val)}</td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;color:#16a34a;font-weight:600">${row.checks.length ? `${passed}/${row.checks.length}` : '—'}</td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;color:${failed > 0 ? '#dc2626' : '#16a34a'};font-weight:600">${row.checks.length ? failed : '—'}</td>
      </tr>`;
    }).join('') : [
      ['Overall Score', audit.overallScore],
      ['On-Page SEO', audit.onPageScore],
      ['Off-Page SEO', audit.offPageScore],
      ['GEO (AI Search)', audit.geoScore],
      ['AEO (Answer Engine)', audit.aeoScore],
      ['Worldwide SEO', audit.worldwideSeoScore],
      ['PageSpeed', audit.pageSpeedScore],
      ['Security', audit.securityScore],
    ].map(([l, v], i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;font-weight:600">${l}</td>
      <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:900;font-size:13pt;color:${scoreColor(v as number | null)}">${sc(v as number | null)}</td>
      <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${scoreColor(v as number | null)}">${scoreLabel(v as number | null)}</td>
    </tr>`).join('')}
  </tbody>
</table>

${report ? `
<!-- ═════════════════════════════════════════════════════════════ PAGE DETAILS -->
<h2>📄 Page Details</h2>
<table>
  <thead><tr style="background:#eff6ff">
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:left;font-size:9pt;color:#1e40af">Field</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:left;font-size:9pt;color:#1e40af">Value</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af">Status</th>
  </tr></thead>
  <tbody>
    ${[
      { field: 'Meta Title', val: report.onPage.metaTitle, ok: !!report.onPage.metaTitle },
      { field: 'Meta Description', val: report.onPage.metaDescription, ok: !!report.onPage.metaDescription },
      { field: 'H1 Heading', val: report.onPage.h1, ok: !!report.onPage.h1 },
      { field: 'Canonical URL', val: report.onPage.canonicalUrl, ok: !!report.onPage.canonicalUrl },
      { field: 'Word Count', val: String(report.onPage.wordCount), ok: report.onPage.wordCount >= 300 },
      { field: 'Internal Links', val: String(report.onPage.internalLinks), ok: true },
      { field: 'Images Missing Alt', val: String(report.onPage.imagesMissingAlt), ok: report.onPage.imagesMissingAlt === 0 },
      { field: 'Open Graph Tags', val: report.onPage.hasOpenGraph ? 'Present' : 'Missing', ok: report.onPage.hasOpenGraph },
      { field: 'Twitter Card', val: report.onPage.hasTwitterCard ? 'Present' : 'Missing', ok: report.onPage.hasTwitterCard },
    ].map((r, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600;font-size:10pt">${r.field}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:10pt;color:${r.ok ? '#1e293b' : '#dc2626'};max-width:300pt;word-break:break-word">${r.val ?? '<em style="color:#dc2626">Missing</em>'}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;color:${r.ok ? '#16a34a' : '#dc2626'};font-weight:700;font-size:12pt">${r.ok ? '✓' : '✗'}</td>
    </tr>`).join('')}
  </tbody>
</table>

<!-- ════════════════════════════════════════════════════════════════ PAGESPEED -->
<h2>⚡ PageSpeed — Core Web Vitals</h2>
<table>
  <thead><tr style="background:#eff6ff">
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af">Metric</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af">Mobile</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af">Desktop</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af">Good Threshold</th>
  </tr></thead>
  <tbody>
    ${[
      { m: 'Performance Score', mob: `${report.pagespeed.mobile.score}/100`, desk: `${report.pagespeed.desktop.score}/100`, thr: '90+ = Good' },
      { m: 'LCP (Largest Contentful Paint)', mob: report.pagespeed.mobile.lcp ? `${report.pagespeed.mobile.lcp} ms` : 'N/A', desk: report.pagespeed.desktop.lcp ? `${report.pagespeed.desktop.lcp} ms` : 'N/A', thr: '< 2,500 ms' },
      { m: 'CLS (Cumulative Layout Shift)', mob: String(report.pagespeed.mobile.cls ?? 'N/A'), desk: String(report.pagespeed.desktop.cls ?? 'N/A'), thr: '< 0.1' },
      { m: 'TBT (Total Blocking Time)', mob: report.pagespeed.mobile.tbt ? `${report.pagespeed.mobile.tbt} ms` : 'N/A', desk: report.pagespeed.desktop.tbt ? `${report.pagespeed.desktop.tbt} ms` : 'N/A', thr: '< 200 ms' },
      { m: 'FCP (First Contentful Paint)', mob: report.pagespeed.mobile.fcp ? `${report.pagespeed.mobile.fcp} ms` : 'N/A', desk: report.pagespeed.desktop.fcp ? `${report.pagespeed.desktop.fcp} ms` : 'N/A', thr: '< 1,800 ms' },
    ].map((r, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600;font-size:10pt">${r.m}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700">${r.mob}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700">${r.desk}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;color:#16a34a;font-size:9.5pt">${r.thr}</td>
    </tr>`).join('')}
  </tbody>
</table>

<!-- ══════════════════════════════════════════════════════════════ SECURITY -->
<h2>🔒 Security Audit</h2>
<table>
  <thead><tr style="background:#eff6ff">
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af">Check</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af">Result</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af">Details</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600">HTTPS Enabled</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${boolColor(report.ssl.httpsEnabled)}">${bool(report.ssl.httpsEnabled)}</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#64748b">Secure connection to your site</td></tr>
    <tr style="background:#f8fafc"><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600">SSL Grade</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:900;font-size:14pt;color:${report.ssl.grade === 'A' ? '#16a34a' : '#d97706'}">${report.ssl.grade}</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#64748b">A or A+ = excellent SSL config</td></tr>
    <tr><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600">Certificate Valid</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${boolColor(report.ssl.certValid)}">${bool(report.ssl.certValid)}</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#64748b">${report.ssl.daysUntilExpiry != null ? `Expires in ${report.ssl.daysUntilExpiry} days` : ''}</td></tr>
    <tr style="background:#f8fafc"><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600">Malware Status</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${report.malware.status === 'clean' ? '#16a34a' : '#dc2626'}">${report.malware.status.toUpperCase()}</td><td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#64748b">Malware scan result</td></tr>
    ${Object.entries(report.ssl.headers).map(([h, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:5pt 10pt;border:1pt solid #e2e8f0;font-family:Courier New,monospace;font-size:9pt">${h}</td>
      <td style="padding:5pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${boolColor(v)}">${bool(v)}</td>
      <td style="padding:5pt 10pt;border:1pt solid #e2e8f0;font-size:9pt;color:${v ? '#16a34a' : '#dc2626'}">${v ? 'Header present — protected' : 'Missing — potential vulnerability'}</td>
    </tr>`).join('')}
  </tbody>
</table>

<!-- ══════════════════════════════════════════════════════════════════ GEO -->
<h2>🤖 AI Crawlability — GEO (Generative Engine Optimisation)</h2>
<p style="color:#64748b;font-size:10pt">How visible your site is to AI search engines like ChatGPT, Perplexity, and Google AI Overview</p>
<table>
  <thead><tr style="background:#eff6ff">
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af">AI Bot / Crawler</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;text-align:center;font-size:9pt;color:#1e40af">Access</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af">What This Means</th>
  </tr></thead>
  <tbody>
    ${[
      { bot: 'GPTBot (ChatGPT / OpenAI)', allowed: report.geo.aiBotCrawlability.gpTBotAllowed, desc: 'ChatGPT can index and use your content in responses' },
      { bot: 'ClaudeBot (Anthropic)', allowed: report.geo.aiBotCrawlability.claudeBotAllowed, desc: 'Claude AI can reference your content' },
      { bot: 'PerplexityBot', allowed: report.geo.aiBotCrawlability.perplexityAllowed, desc: 'Perplexity AI search engine can discover your pages' },
      { bot: 'Google AIO Bot', allowed: report.geo.aiBotCrawlability.googleAIOAllowed, desc: 'Eligible to appear in Google AI Overviews' },
      { bot: 'llms.txt Guidance File', allowed: report.geo.aiBotCrawlability.hasLlmsTxt, desc: 'Guides AI crawlers on what content to prioritise' },
    ].map((r, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-weight:600;font-size:10pt">${r.bot}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;text-align:center;font-weight:700;color:${r.allowed ? '#16a34a' : '#dc2626'}">${r.allowed ? '✓ Allowed' : '✗ Blocked'}</td>
      <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#64748b">${r.desc}</td>
    </tr>`).join('')}
  </tbody>
</table>

<!-- ══════════════════════════════════════════════════════════ ON-PAGE CHECKS -->
<h2>🔍 On-Page SEO — Detailed Checks</h2>
${checksTable(report.onPage.checks)}

<h2>🌍 Off-Page SEO — Detailed Checks</h2>
${checksTable(report.offPage.checks)}

<h2>🤖 GEO — Detailed Checks</h2>
${checksTable(report.geo.checks)}

<h2>🔒 Security — Detailed Checks</h2>
${checksTable(report.ssl.checks)}
` : ''}

<!-- ══════════════════════════════════════════════════════════════ SUGGESTIONS -->
${suggestions.length > 0 ? `
<h2>⚡ Action Plan — All Recommendations</h2>
<p style="color:#64748b;font-size:10pt">Prioritised by business impact and implementation effort</p>
<table>
  <thead><tr style="background:#eff6ff">
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af;width:10%">Priority</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af;width:30%">Issue</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af">Description &amp; Fix</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af;width:12%">Effort</th>
    <th style="padding:6pt 10pt;border:1pt solid #bfdbfe;font-size:9pt;color:#1e40af;width:18%">Impact</th>
  </tr></thead>
  <tbody>
    ${suggestions.map((s, i) => {
      const priColor = s.priority === 'critical' ? '#dc2626' : s.priority === 'high' ? '#ea580c' : s.priority === 'medium' ? '#d97706' : '#16a34a';
      const priBg = s.priority === 'critical' ? '#fef2f2' : s.priority === 'high' ? '#fff7ed' : s.priority === 'medium' ? '#fffbeb' : '#f0fdf4';
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;vertical-align:top">
          <span style="background:${priBg};color:${priColor};font-weight:700;font-size:8.5pt;padding:2pt 6pt;border-radius:3pt;text-transform:uppercase">${s.priority}</span>
        </td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;font-weight:700;font-size:10pt;vertical-align:top;color:#1e293b">${s.title}<br><span style="font-weight:400;color:#94a3b8;font-size:8.5pt">${s.category}</span></td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#374151;vertical-align:top">
          ${s.description}
          ${s.currentValue ? `<br><span style="color:#dc2626;font-size:9pt">Now: ${s.currentValue}</span>` : ''}
          ${s.targetValue ? `<br><span style="color:#16a34a;font-size:9pt">Goal: ${s.targetValue}</span>` : ''}
        </td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;text-align:center;vertical-align:top">
          <span style="background:#f1f5f9;color:#475569;font-weight:600;font-size:8.5pt;padding:2pt 6pt;border-radius:3pt">${s.effortLevel}</span>
        </td>
        <td style="padding:7pt 10pt;border:1pt solid #e2e8f0;font-size:9.5pt;color:#64748b;vertical-align:top">${s.estimatedImpact}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>
` : ''}

<div class="footer">
  Generated by <strong>WebAudit</strong> on ${new Date().toLocaleString()} &nbsp;|&nbsp; ${audit.url} &nbsp;|&nbsp; Confidential
</div>

</body>
</html>`;
}

// ─── Data type alias ──────────────────────────────────────────────────────────

type AuditData = {
  url: string;
  createdAt: Date;
  overallScore: number | null;
  onPageScore: number | null;
  offPageScore: number | null;
  geoScore: number | null;
  aeoScore: number | null;
  worldwideSeoScore: number | null;
  pageSpeedScore: number | null;
  securityScore: number | null;
  detectedCms: string | null;
};

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const format = (req.nextUrl.searchParams.get('format') ?? 'csv') as Format;

  const audit = await db.audit.findUnique({ where: { id } });
  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (audit.userId !== session.user.id && session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (audit.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Audit not completed yet' }, { status: 400 });
  }

  // Plan gating
  const planTier = await getUserPlanTier(session.user.id);
  const features = PLAN_FEATURES[planTier];

  if (format === 'doc' && !features.docExport) {
    return NextResponse.json(
      { error: 'DOC export requires Starter plan or higher. Upgrade at /dashboard/settings/billing', code: 'PLAN_LIMIT', requiredPlan: 'STARTER' },
      { status: 402 }
    );
  }

  const report = audit.report as unknown as AuditReport | null;
  const suggestions = (audit.suggestions as unknown as Suggestion[] | null) ?? [];

  const slug = (() => { try { return new URL(audit.url).hostname.replace(/\./g, '-'); } catch { return 'audit'; } })();
  const date = new Date(audit.createdAt).toISOString().split('T')[0];
  const filename = `webaudit-${slug}-${date}`;

  type FormatOutput = { content: string; mime: string; ext: string };

  const FORMATS: Record<Format, FormatOutput> = {
    csv: {
      content: toCSV(audit, report, suggestions),
      mime: 'text/csv;charset=utf-8',
      ext: 'csv',
    },
    json: {
      content: JSON.stringify({
        audit: {
          url: audit.url,
          createdAt: audit.createdAt,
          detectedCms: audit.detectedCms,
          scores: {
            overall: audit.overallScore,
            onPage: audit.onPageScore,
            offPage: audit.offPageScore,
            geo: audit.geoScore,
            aeo: audit.aeoScore,
            worldwideSeo: audit.worldwideSeoScore,
            pageSpeed: audit.pageSpeedScore,
            security: audit.securityScore,
          },
        },
        report,
        suggestions,
      }, null, 2),
      mime: 'application/json',
      ext: 'json',
    },
    txt: {
      content: toTXT(audit, report, suggestions),
      mime: 'text/plain;charset=utf-8',
      ext: 'txt',
    },
    doc: {
      content: toDOC(audit, report, suggestions),
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ext: 'doc',
    },
  };

  const { content, mime, ext } = FORMATS[format] ?? FORMATS.csv;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${filename}.${ext}"`,
      'Cache-Control': 'no-store',
    },
  });
}
