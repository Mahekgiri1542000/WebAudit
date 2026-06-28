import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import type { AuditReport, Suggestion, CheckItem } from '@/types/audit';
import { getUserPlanTier } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import PrintTrigger from './PrintTrigger';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(n: number | null): string {
  if (n === null) return '#94a3b8';
  if (n >= 80) return '#16a34a';
  if (n >= 50) return '#d97706';
  return '#dc2626';
}

function scoreBg(n: number | null): string {
  if (n === null) return '#f1f5f9';
  if (n >= 80) return '#f0fdf4';
  if (n >= 50) return '#fffbeb';
  return '#fef2f2';
}

function scoreLabel(n: number | null): string {
  if (n === null) return 'N/A';
  if (n >= 90) return 'Excellent';
  if (n >= 75) return 'Good';
  if (n >= 60) return 'Average';
  if (n >= 40) return 'Below Average';
  return 'Poor';
}

function ScoreGauge({ score, label, size = 'md' }: { score: number | null; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  const radius = size === 'lg' ? 38 : size === 'md' ? 28 : 20;
  const stroke = size === 'lg' ? 6 : 4;
  const cx = radius + stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const svgSize = (radius + stroke) * 2;
  const fontSize = size === 'lg' ? '22px' : size === 'md' ? '16px' : '12px';
  const labelSize = size === 'lg' ? '11px' : '9px';

  return (
    <div style={{ textAlign: 'center', padding: size === 'lg' ? '12px' : '8px', background: bg, borderRadius: '10px', border: `1px solid ${color}22` }}>
      <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
        <text
          x={cx} y={cx + (size === 'lg' ? 8 : 5)}
          textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cx}px`, fill: color, fontWeight: 800, fontSize }}
        >
          {score ?? 'N/A'}
        </text>
      </svg>
      <div style={{ fontSize: labelSize, color: '#64748b', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    </div>
  );
}

function CheckRow({ check }: { check: CheckItem }) {
  const statusIcon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : check.status === 'warn' ? '⚠' : '–';
  const statusColor = check.status === 'pass' ? '#16a34a' : check.status === 'fail' ? '#dc2626' : check.status === 'warn' ? '#d97706' : '#94a3b8';
  const sevBg = check.severity === 'critical' ? '#fef2f2' : check.severity === 'high' ? '#fff7ed' : check.severity === 'medium' ? '#fffbeb' : '#f8fafc';
  const sevColor = check.severity === 'critical' ? '#dc2626' : check.severity === 'high' ? '#ea580c' : check.severity === 'medium' ? '#d97706' : '#64748b';

  return (
    <tr>
      <td style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 500, borderBottom: '1px solid #f1f5f9', maxWidth: '180px' }}>{check.title}</td>
      <td style={{ padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontWeight: 700, color: statusColor, fontSize: '13px' }}>{statusIcon}</span>
      </td>
      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', background: sevBg, color: sevColor, textTransform: 'uppercase' }}>{check.severity}</span>
      </td>
      <td style={{ padding: '6px 10px', fontSize: '11px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{check.note}</td>
    </tr>
  );
}

function SuggestionRow({ s }: { s: Suggestion }) {
  const priColor = s.priority === 'critical' ? '#dc2626' : s.priority === 'high' ? '#ea580c' : s.priority === 'medium' ? '#d97706' : '#16a34a';
  const priBg = s.priority === 'critical' ? '#fef2f2' : s.priority === 'high' ? '#fff7ed' : s.priority === 'medium' ? '#fffbeb' : '#f0fdf4';
  return (
    <tr>
      <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: priBg, color: priColor, textTransform: 'uppercase' }}>{s.priority}</span>
      </td>
      <td style={{ padding: '8px 10px', fontSize: '11px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{s.title}</div>
        <div style={{ color: '#64748b', fontSize: '10px' }}>{s.description}</div>
        {s.currentValue && <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '2px' }}>Now: {s.currentValue}</div>}
        {s.targetValue && <div style={{ color: '#16a34a', fontSize: '10px' }}>Goal: {s.targetValue}</div>}
      </td>
      <td style={{ padding: '8px 10px', fontSize: '10px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{s.effortLevel}</span>
      </td>
      <td style={{ padding: '8px 10px', fontSize: '10px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{s.estimatedImpact}</td>
    </tr>
  );
}

// ─── AI Executive Summary (Claude) ─────────────────────────────────────────────

async function generateAISummary(
  url: string,
  overallScore: number | null,
  onPageScore: number | null,
  pageSpeedScore: number | null,
  securityScore: number | null,
  geoScore: number | null,
  suggestions: Suggestion[],
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-ant-REPLACE')) return null;

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const criticalCount = suggestions.filter(s => s.priority === 'critical').length;
    const highCount = suggestions.filter(s => s.priority === 'high').length;
    const quickWins = suggestions.filter(s => s.effortLevel === 'quick-win').slice(0, 3).map(s => s.title).join(', ');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a 3-paragraph executive summary for a website SEO audit report. Be concise, specific, and actionable. No markdown, plain text only.

Website: ${url}
Overall Score: ${overallScore}/100
On-Page SEO: ${onPageScore}/100 | PageSpeed: ${pageSpeedScore}/100 | Security: ${securityScore}/100 | GEO/AI Visibility: ${geoScore}/100
Critical Issues: ${criticalCount} | High Priority: ${highCount}
Quick Wins Available: ${quickWins || 'None identified'}

Paragraph 1: Overall health assessment (2-3 sentences).
Paragraph 2: Top 2-3 specific concerns found.
Paragraph 3: Recommended immediate actions.`,
      }],
    });

    const text = message.content[0];
    return text.type === 'text' ? text.text : null;
  } catch {
    return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PrintReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const audit = await db.audit.findUnique({ where: { id } });
  if (!audit || audit.status !== 'COMPLETED') notFound();
  if (audit.userId !== session.user.id && session.user.role === 'CUSTOMER') notFound();

  const planTier = await getUserPlanTier(session.user.id);
  const features = PLAN_FEATURES[planTier];

  if (!features.pdfExport) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '48px', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>PDF Export — PRO Feature</h1>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Upgrade to PRO to export professional PDF reports with AI executive summaries.</p>
          <a href="/dashboard/settings/billing" style={{ display: 'inline-block', padding: '12px 24px', background: '#f07b29', color: '#fff', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>Upgrade to PRO →</a>
        </div>
      </div>
    );
  }

  const report = audit.report as unknown as AuditReport | null;
  const suggestions = (audit.suggestions as unknown as Suggestion[] | null) ?? [];

  const aiSummary = features.aiReport
    ? await generateAISummary(audit.url, audit.overallScore, audit.onPageScore, audit.pageSpeedScore, audit.securityScore, audit.geoScore, suggestions)
    : null;

  const hostname = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
  const criticals = suggestions.filter(s => s.priority === 'critical');
  const highs = suggestions.filter(s => s.priority === 'high');
  const quickWins = suggestions.filter(s => s.effortLevel === 'quick-win');

  const scoreRows = [
    { label: 'Overall Score', val: audit.overallScore },
    { label: 'On-Page SEO', val: audit.onPageScore },
    { label: 'Off-Page SEO', val: audit.offPageScore },
    { label: 'GEO / AI Search', val: audit.geoScore },
    { label: 'AEO / Voice', val: audit.aeoScore },
    { label: 'Worldwide SEO', val: audit.worldwideSeoScore },
    { label: 'PageSpeed', val: audit.pageSpeedScore },
    { label: 'Security', val: audit.securityScore },
  ];

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Audit Report — {hostname}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fff; color: #1e293b; font-size: 12px; }
          @page { size: A4; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
          .cover { background: linear-gradient(135deg, #1a1f6e 0%, #0f1240 100%); color: #fff; padding: 60px 50px; min-height: 100vh; position: relative; }
          .cover-logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 80px; }
          .cover-logo span { color: #f07b29; }
          .cover-title { font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
          .cover-url { font-size: 16px; color: #93c5fd; margin-bottom: 6px; }
          .cover-meta { font-size: 13px; color: #94a3b8; margin-bottom: 60px; }
          .cover-scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 40px; }
          .cover-score-box { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; text-align: center; backdrop-filter: blur(10px); }
          .cover-score-val { font-size: 36px; font-weight: 900; line-height: 1; }
          .cover-score-lbl { font-size: 10px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .cover-footer { position: absolute; bottom: 40px; left: 50px; right: 50px; display: flex; justify-content: space-between; color: #475569; font-size: 11px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
          .section { padding: 40px 50px; }
          .section-alt { padding: 40px 50px; background: #f8fafc; }
          .section-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
          .section-subtitle { font-size: 12px; color: #64748b; margin-bottom: 24px; margin-top: 4px; }
          .summary-text { font-size: 13px; line-height: 1.7; color: #374151; background: #eff6ff; border-left: 3px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 8px; }
          .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .score-box { border-radius: 10px; padding: 14px; text-align: center; }
          .score-val { font-size: 28px; font-weight: 900; line-height: 1; }
          .score-lbl { font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; }
          .score-rating { font-size: 10px; font-weight: 600; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #eff6ff; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #475569; padding: 8px 10px; text-align: left; border-bottom: 2px solid #bfdbfe; }
          .tag-critical { background: #fef2f2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
          .tag-high { background: #fff7ed; color: #ea580c; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
          .tag-medium { background: #fffbeb; color: #d97706; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
          .tag-low { background: #f0fdf4; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
          .alert-box { padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 10px; }
          .alert-critical { background: #fef2f2; border: 1px solid #fecaca; }
          .alert-high { background: #fff7ed; border: 1px solid #fed7aa; }
          .alert-icon { font-size: 16px; flex-shrink: 0; }
          .alert-title { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
          .alert-desc { font-size: 11px; color: #64748b; }
          .divider { border: none; border-top: 1px solid #e2e8f0; margin: 0; }
          .page-header { padding: 16px 50px; background: #1a1f6e; color: #fff; display: flex; justify-content: space-between; align-items: center; }
          .page-header-logo { font-size: 14px; font-weight: 800; }
          .page-header-logo span { color: #f07b29; }
          .page-footer { padding: 12px 50px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
          .metric-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .metric-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
          .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px; }
          .metric-value { font-size: 20px; font-weight: 800; color: #1e293b; }
          .metric-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }
          .print-btn { position: fixed; top: 24px; right: 24px; z-index: 9999; background: #f07b29; color: #fff; border: none; border-radius: 10px; padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px rgba(240,123,41,0.4); display: flex; align-items: center; gap-8px; }
        `}</style>
      </head>
      <body>
        <PrintTrigger />

        {/* ── Print button (hidden on print) ──────────────── */}
        <div className="no-print" style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', gap: '10px' }}>
          <a href={`/dashboard/audits/${audit.id}`} style={{ padding: '10px 16px', background: '#1e293b', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>← Back</a>
          <button onClick={() => typeof window !== 'undefined' && window.print()} style={{ padding: '10px 20px', background: '#f07b29', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>🖨 Print / Save PDF</button>
        </div>

        {/* ── PAGE 1: Cover ─────────────────────────────── */}
        <div className="cover">
          <div className="cover-logo"><span>Web</span>Audit</div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ background: 'rgba(240,123,41,0.2)', color: '#fdba74', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              SEO Audit Report
            </span>
          </div>
          <div className="cover-title">Website Performance<br />& SEO Analysis</div>
          <div className="cover-url">{hostname}</div>
          <div className="cover-meta">Generated on {new Date(audit.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Plan: {features.name}</div>

          {/* Overall score hero */}
          <div style={{ marginTop: '40px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '80px', fontWeight: 900, lineHeight: 1, color: scoreColor(audit.overallScore) }}>{audit.overallScore ?? 'N/A'}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Score</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: scoreColor(audit.overallScore), marginTop: '4px' }}>{scoreLabel(audit.overallScore)}</div>
            </div>
            <div style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Summary</div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Critical Issues', val: criticals.length, color: '#dc2626' },
                  { label: 'High Priority', val: highs.length, color: '#ea580c' },
                  { label: 'Quick Wins', val: quickWins.length, color: '#16a34a' },
                  { label: 'Total Checks', val: (report?.onPage.checks.length ?? 0) + (report?.offPage.checks.length ?? 0) + (report?.ssl.checks.length ?? 0), color: '#60a5fa' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: item.color }}>{item.val}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score grid */}
          <div className="cover-scores">
            {[
              { label: 'On-Page SEO', val: audit.onPageScore },
              { label: 'PageSpeed', val: audit.pageSpeedScore },
              { label: 'Security', val: audit.securityScore },
              { label: 'GEO / AI', val: audit.geoScore },
            ].map(s => (
              <div key={s.label} className="cover-score-box">
                <div className="cover-score-val" style={{ color: scoreColor(s.val) }}>{s.val ?? 'N/A'}</div>
                <div className="cover-score-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="cover-footer">
            <span>Confidential — prepared by WebAudit</span>
            <span>{audit.url}</span>
          </div>
        </div>

        {/* ── PAGE 2: Executive Summary + Scores ─────────── */}
        <div className="page-break">
          <div className="page-header">
            <div className="page-header-logo"><span>Web</span>Audit</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{hostname} · {new Date(audit.createdAt).toLocaleDateString()}</div>
          </div>

          {/* Executive summary */}
          <div className="section">
            <div className="section-title">
              <span>📋</span> Executive Summary
              {features.aiReport && aiSummary && <span style={{ fontSize: '10px', background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>✨ AI Generated</span>}
            </div>
            <div className="section-subtitle">Overall assessment of website health and SEO performance</div>

            {aiSummary ? (
              <div>
                {aiSummary.split('\n\n').filter(p => p.trim()).map((para, i) => (
                  <div key={i} className="summary-text" style={{ borderLeftColor: i === 0 ? '#3b82f6' : i === 1 ? '#f07b29' : '#16a34a' }}>
                    {para.trim()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="summary-text">
                {audit.url} achieved an overall score of {audit.overallScore}/100, placing it in the &ldquo;{scoreLabel(audit.overallScore)}&rdquo; category.
                The audit identified {criticals.length} critical and {highs.length} high-priority issues that require immediate attention.
                {quickWins.length > 0 && ` There are ${quickWins.length} quick-win opportunities that can improve scores with minimal effort.`}
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Full score breakdown */}
          <div className="section-alt">
            <div className="section-title"><span>📊</span> Score Breakdown</div>
            <div className="section-subtitle">Performance across all audited categories</div>
            <div className="score-grid">
              {scoreRows.map(row => (
                <div key={row.label} className="score-box" style={{ background: scoreBg(row.val), border: `1px solid ${scoreColor(row.val)}22` }}>
                  <div className="score-val" style={{ color: scoreColor(row.val) }}>{row.val ?? 'N/A'}</div>
                  <div className="score-lbl">{row.label}</div>
                  <div className="score-rating" style={{ color: scoreColor(row.val) }}>{scoreLabel(row.val)}</div>
                </div>
              ))}
            </div>

            {report && (
              <table>
                <thead>
                  <tr>
                    <th>Category</th><th>Score</th><th>Rating</th><th>Checks Passed</th><th>Issues Found</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: 'On-Page SEO', val: audit.onPageScore, checks: report.onPage.checks },
                    { cat: 'Off-Page SEO', val: audit.offPageScore, checks: report.offPage.checks },
                    { cat: 'GEO / AI Search', val: audit.geoScore, checks: report.geo.checks },
                    { cat: 'AEO / Voice', val: audit.aeoScore, checks: report.aeo.checks },
                    { cat: 'PageSpeed', val: audit.pageSpeedScore, checks: [] },
                    { cat: 'Security', val: audit.securityScore, checks: [...report.ssl.checks, ...report.malware.checks] },
                  ].map(row => {
                    const passed = row.checks.filter(c => c.status === 'pass').length;
                    const failed = row.checks.filter(c => c.status === 'fail').length;
                    return (
                      <tr key={row.cat}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{row.cat}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 800, color: scoreColor(row.val), fontSize: '14px', borderBottom: '1px solid #f1f5f9' }}>{row.val ?? 'N/A'}</td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}><span style={{ color: scoreColor(row.val), fontWeight: 600, fontSize: '11px' }}>{scoreLabel(row.val)}</span></td>
                        <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{row.checks.length ? `${passed}/${row.checks.length}` : '—'}</td>
                        <td style={{ padding: '8px 10px', color: failed > 0 ? '#dc2626' : '#16a34a', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{row.checks.length ? failed : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="page-footer">
            <span>WebAudit — Confidential</span>
            <span>Page 2</span>
          </div>
        </div>

        {/* ── PAGE 3: Critical Issues + Action Plan ──────── */}
        <div className="page-break">
          <div className="page-header">
            <div className="page-header-logo"><span>Web</span>Audit</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{hostname} · Issues & Action Plan</div>
          </div>

          <div className="section">
            <div className="section-title"><span>🚨</span> Critical & High Priority Issues</div>
            <div className="section-subtitle">Issues requiring immediate attention to protect rankings and performance</div>

            {criticals.length === 0 && highs.length === 0 ? (
              <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '10px', color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>
                ✓ No critical or high priority issues found. Great job!
              </div>
            ) : (
              <div>
                {criticals.map(s => (
                  <div key={s.id} className="alert-box alert-critical">
                    <span className="alert-icon">🔴</span>
                    <div>
                      <div className="alert-title">{s.title}</div>
                      <div className="alert-desc">{s.description}</div>
                      {s.currentValue && <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '4px' }}>Current: {s.currentValue}</div>}
                    </div>
                  </div>
                ))}
                {highs.map(s => (
                  <div key={s.id} className="alert-box alert-high">
                    <span className="alert-icon">🟠</span>
                    <div>
                      <div className="alert-title">{s.title}</div>
                      <div className="alert-desc">{s.description}</div>
                      {s.currentValue && <div style={{ fontSize: '10px', color: '#ea580c', marginTop: '4px' }}>Current: {s.currentValue}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="divider" />

          <div className="section-alt">
            <div className="section-title"><span>⚡</span> Complete Action Plan</div>
            <div className="section-subtitle">All recommendations prioritised by impact and effort</div>
            {suggestions.length > 0 ? (
              <table>
                <thead>
                  <tr><th>Priority</th><th>Issue & Description</th><th>Effort</th><th>Impact</th></tr>
                </thead>
                <tbody>
                  {suggestions.map(s => <SuggestionRow key={s.id} s={s} />)}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#64748b', fontSize: '13px' }}>No suggestions available for this audit.</p>
            )}
          </div>

          <div className="page-footer">
            <span>WebAudit — Confidential</span>
            <span>Page 3</span>
          </div>
        </div>

        {/* ── PAGE 4: Technical Details ──────────────────── */}
        {report && (
          <div className="page-break">
            <div className="page-header">
              <div className="page-header-logo"><span>Web</span>Audit</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{hostname} · Technical Details</div>
            </div>

            <div className="section">
              <div className="section-title"><span>📄</span> Page Details</div>
              <div className="section-subtitle">On-page SEO elements and content analysis</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Meta Title', value: report.onPage.metaTitle ?? 'Missing', warn: !report.onPage.metaTitle },
                  { label: 'Meta Description', value: report.onPage.metaDescription ?? 'Missing', warn: !report.onPage.metaDescription },
                  { label: 'H1 Heading', value: report.onPage.h1 ?? 'Missing', warn: !report.onPage.h1 },
                  { label: 'Canonical URL', value: report.onPage.canonicalUrl ?? 'Not set', warn: !report.onPage.canonicalUrl },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: item.warn ? '#dc2626' : '#1e293b', wordBreak: 'break-word' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="metric-row">
                {[
                  { label: 'Word Count', val: report.onPage.wordCount, sub: 'target: 300+' },
                  { label: 'Internal Links', val: report.onPage.internalLinks, sub: 'links on page' },
                  { label: 'External Links', val: report.onPage.externalLinks, sub: 'outbound' },
                  { label: 'Images w/o Alt', val: report.onPage.imagesMissingAlt, sub: 'accessibility' },
                ].map(m => (
                  <div key={m.label} className="metric-card">
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value" style={{ color: m.label === 'Images w/o Alt' && m.val > 0 ? '#dc2626' : '#1e293b' }}>{m.val}</div>
                    <div className="metric-sub">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="divider" />

            <div className="section-alt">
              <div className="section-title"><span>⚡</span> PageSpeed — Core Web Vitals</div>
              <table>
                <thead><tr><th>Metric</th><th>Mobile</th><th>Desktop</th><th>Threshold</th></tr></thead>
                <tbody>
                  {[
                    { metric: 'Score', mob: `${report.pagespeed.mobile.score}/100`, desk: `${report.pagespeed.desktop.score}/100`, threshold: '90+ = Good' },
                    { metric: 'LCP (Largest Contentful Paint)', mob: report.pagespeed.mobile.lcp ? `${report.pagespeed.mobile.lcp}ms` : 'N/A', desk: report.pagespeed.desktop.lcp ? `${report.pagespeed.desktop.lcp}ms` : 'N/A', threshold: '< 2500ms = Good' },
                    { metric: 'CLS (Cumulative Layout Shift)', mob: String(report.pagespeed.mobile.cls ?? 'N/A'), desk: String(report.pagespeed.desktop.cls ?? 'N/A'), threshold: '< 0.1 = Good' },
                    { metric: 'TBT (Total Blocking Time)', mob: report.pagespeed.mobile.tbt ? `${report.pagespeed.mobile.tbt}ms` : 'N/A', desk: report.pagespeed.desktop.tbt ? `${report.pagespeed.desktop.tbt}ms` : 'N/A', threshold: '< 200ms = Good' },
                    { metric: 'FCP (First Contentful Paint)', mob: report.pagespeed.mobile.fcp ? `${report.pagespeed.mobile.fcp}ms` : 'N/A', desk: report.pagespeed.desktop.fcp ? `${report.pagespeed.desktop.fcp}ms` : 'N/A', threshold: '< 1800ms = Good' },
                  ].map(row => (
                    <tr key={row.metric}>
                      <td style={{ padding: '7px 10px', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>{row.metric}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>{row.mob}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>{row.desk}</td>
                      <td style={{ padding: '7px 10px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{row.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="page-footer">
              <span>WebAudit — Confidential</span>
              <span>Page 4</span>
            </div>
          </div>
        )}

        {/* ── PAGE 5: Security + GEO + All Checks ────────── */}
        {report && (
          <div className="page-break">
            <div className="page-header">
              <div className="page-header-logo"><span>Web</span>Audit</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{hostname} · Security & AI Visibility</div>
            </div>

            <div className="section">
              <div className="section-title"><span>🔒</span> Security Audit</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'HTTPS Enabled', val: report.ssl.httpsEnabled, isBoolean: true },
                  { label: 'SSL Certificate Valid', val: report.ssl.certValid, isBoolean: true },
                  { label: 'SSL Grade', val: report.ssl.grade, isBoolean: false },
                  { label: 'Days Until Expiry', val: report.ssl.daysUntilExpiry !== null ? `${report.ssl.daysUntilExpiry} days` : 'Unknown', isBoolean: false },
                  { label: 'Malware Status', val: report.malware.status.toUpperCase(), isBoolean: false },
                  { label: 'Safe Browsing', val: report.malware.safeBrowsing === null ? 'N/A' : report.malware.safeBrowsing ? 'CLEAN' : 'FLAGGED', isBoolean: false },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                    {item.isBoolean ? (
                      <span style={{ fontWeight: 700, color: item.val ? '#16a34a' : '#dc2626', fontSize: '12px' }}>
                        {item.val ? '✓ Yes' : '✗ No'}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '12px' }}>{String(item.val)}</span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Security Headers</div>
              <table>
                <thead><tr><th>Header</th><th>Status</th><th>Impact</th></tr></thead>
                <tbody>
                  {Object.entries(report.ssl.headers).map(([header, present]) => (
                    <tr key={header}>
                      <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: '10px', borderBottom: '1px solid #f1f5f9' }}>{header}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontWeight: 700, color: present ? '#16a34a' : '#dc2626' }}>{present ? '✓ Present' : '✗ Missing'}</span>
                      </td>
                      <td style={{ padding: '6px 10px', color: '#64748b', fontSize: '10px', borderBottom: '1px solid #f1f5f9' }}>{present ? 'Protected' : 'Vulnerability exposed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="divider" />

            <div className="section-alt">
              <div className="section-title"><span>🤖</span> AI Crawlability (GEO / Generative Engine Optimisation)</div>
              <div className="section-subtitle">How visible your site is to AI search engines like ChatGPT, Perplexity, and Google AI Overview</div>
              <table>
                <thead><tr><th>AI Bot / Crawler</th><th>Access</th><th>What This Means</th></tr></thead>
                <tbody>
                  {[
                    { bot: 'GPTBot (ChatGPT / OpenAI)', allowed: report.geo.aiBotCrawlability.gpTBotAllowed, note: 'ChatGPT uses your content for responses' },
                    { bot: 'ClaudeBot (Anthropic)', allowed: report.geo.aiBotCrawlability.claudeBotAllowed, note: 'Claude AI can reference your content' },
                    { bot: 'PerplexityBot', allowed: report.geo.aiBotCrawlability.perplexityAllowed, note: 'Perplexity AI search can discover you' },
                    { bot: 'Google AIO Bot', allowed: report.geo.aiBotCrawlability.googleAIOAllowed, note: 'Appears in Google AI Overview' },
                  ].map(row => (
                    <tr key={row.bot}>
                      <td style={{ padding: '7px 10px', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>{row.bot}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, color: row.allowed ? '#16a34a' : '#dc2626', borderBottom: '1px solid #f1f5f9' }}>
                        {row.allowed ? '✓ Allowed' : '✗ Blocked'}
                      </td>
                      <td style={{ padding: '7px 10px', fontSize: '10px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{row.note}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: '7px 10px', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>llms.txt File</td>
                    <td style={{ padding: '7px 10px', fontWeight: 700, color: report.geo.aiBotCrawlability.hasLlmsTxt ? '#16a34a' : '#d97706', borderBottom: '1px solid #f1f5f9' }}>
                      {report.geo.aiBotCrawlability.hasLlmsTxt ? '✓ Present' : '⚠ Missing'}
                    </td>
                    <td style={{ padding: '7px 10px', fontSize: '10px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>Guides AI bots on what content to index</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="page-footer">
              <span>WebAudit — Confidential</span>
              <span>Page 5</span>
            </div>
          </div>
        )}

        {/* ── PAGE 6: Detailed Check Results ─────────────── */}
        {report && (
          <div className="page-break">
            <div className="page-header">
              <div className="page-header-logo"><span>Web</span>Audit</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{hostname} · Detailed Check Results</div>
            </div>

            {[
              { title: '🔍 On-Page SEO Checks', checks: report.onPage.checks },
              { title: '🌍 Off-Page SEO Checks', checks: report.offPage.checks },
              { title: '🤖 GEO / AI Search Checks', checks: report.geo.checks },
              { title: '🔒 Security Checks', checks: report.ssl.checks },
            ].map(section => (
              <div key={section.title} className="section" style={{ paddingBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>{section.title}</div>
                <table>
                  <thead><tr><th style={{ width: '35%' }}>Check</th><th style={{ width: '8%' }}>Status</th><th style={{ width: '12%' }}>Severity</th><th>Notes</th></tr></thead>
                  <tbody>
                    {section.checks.map(c => <CheckRow key={c.id} check={c} />)}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="page-footer">
              <span>WebAudit — Confidential</span>
              <span>Page 6 — Generated {new Date().toLocaleString()}</span>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
