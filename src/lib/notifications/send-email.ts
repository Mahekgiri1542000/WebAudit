import { Resend } from 'resend';

const RESEND_KEY = process.env.RESEND_API_KEY ?? '';
const resend = RESEND_KEY && RESEND_KEY !== 're_REPLACE_ME' ? new Resend(RESEND_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

async function send(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    console.log(`[email-skip] Resend not configured. Would send "${opts.subject}" to ${opts.to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, ...opts });
  } catch (err) {
    console.error('[email-error]', err);
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const css = `
  body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)}
  .header{background:#1a1f6e;padding:32px 40px;text-align:center}
  .header-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px}
  .header-logo span{color:#f07b29}
  .body{padding:40px}
  .title{font-size:22px;font-weight:700;color:#111;margin:0 0 8px}
  .sub{font-size:15px;color:#555;margin:0 0 24px;line-height:1.6}
  .btn{display:inline-block;padding:14px 28px;background:#f07b29;color:#fff!important;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px}
  .stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:24px 0}
  .stat-box{background:#f8f9fa;border-radius:10px;padding:16px;text-align:center}
  .stat-val{font-size:28px;font-weight:800;color:#111}
  .stat-lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
  .check-row{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0}
  .check-row:last-child{border:none}
  .check-icon{font-size:18px;flex-shrink:0;width:24px;text-align:center}
  .check-label{font-size:14px;font-weight:600;color:#111}
  .check-desc{font-size:13px;color:#888;margin-top:2px}
  .footer{padding:20px 40px;background:#f8f9fa;border-top:1px solid #eee;text-align:center}
  .footer p{font-size:12px;color:#aaa;margin:0}
  .footer a{color:#f07b29;text-decoration:none}
`;

function layout(title: string, content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
  <div class="wrap">
    <div class="header">
      <div class="header-logo"><span>Web</span>Audit</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} WebAudit · <a href="${BASE_URL}/dashboard/settings/notifications">Manage notifications</a> · <a href="${BASE_URL}">Visit site</a></p>
    </div>
  </div>
</body></html>`;
}

// ─── Welcome email (new user) ─────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name?: string | null): Promise<void> {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Welcome aboard!';
  await send({
    to,
    subject: 'Welcome to WebAudit — your free SEO audit is ready 🎉',
    html: layout('Welcome', `
      <p class="title">${greeting} Welcome to WebAudit!</p>
      <p class="sub">You now have access to the most powerful free SEO audit tool. Here's what you can do right now:</p>

      <div class="stat-grid">
        <div class="stat-box"><div class="stat-val">60+</div><div class="stat-lbl">SEO Checks</div></div>
        <div class="stat-box"><div class="stat-val">~60s</div><div class="stat-lbl">Audit Speed</div></div>
        <div class="stat-box"><div class="stat-val">Free</div><div class="stat-lbl">3 audits/month</div></div>
        <div class="stat-box"><div class="stat-val">AI</div><div class="stat-lbl">GEO & AEO Analysis</div></div>
      </div>

      <div style="margin:24px 0">
        <div class="check-row"><span class="check-icon">🔍</span><div><div class="check-label">On-Page SEO</div><div class="check-desc">Meta tags, headings, content quality, schema markup</div></div></div>
        <div class="check-row"><span class="check-icon">⚡</span><div><div class="check-label">PageSpeed & Core Web Vitals</div><div class="check-desc">LCP, CLS, FID for mobile and desktop</div></div></div>
        <div class="check-row"><span class="check-icon">🔒</span><div><div class="check-label">Security Audit</div><div class="check-desc">SSL, malware, blacklist status, security headers</div></div></div>
        <div class="check-row"><span class="check-icon">🤖</span><div><div class="check-label">AI Visibility (GEO & AEO)</div><div class="check-desc">How well your site ranks in ChatGPT, Perplexity & voice</div></div></div>
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${BASE_URL}/dashboard/audits/new" class="btn">Run your first free audit →</a>
      </div>
      <p style="font-size:13px;color:#888;text-align:center">Takes 60 seconds. No credit card needed.</p>
    `),
  });
}

// ─── Audit complete email ─────────────────────────────────────────────────────
export async function sendAuditCompleteEmail(
  to: string,
  siteUrl: string,
  overallScore: number,
  scores: { seo: number | null; speed: number | null; security: number | null; geo: number | null },
  auditId: string,
): Promise<void> {
  const scoreColor = overallScore >= 80 ? '#16a34a' : overallScore >= 50 ? '#d97706' : '#dc2626';
  const scoreLabel = overallScore >= 80 ? '🟢 Excellent' : overallScore >= 50 ? '🟡 Needs Work' : '🔴 Critical Issues';

  const scoreRow = (label: string, val: number | null) => {
    if (val === null) return '';
    const c = val >= 80 ? '#16a34a' : val >= 50 ? '#d97706' : '#dc2626';
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px">
      <span style="color:#555">${label}</span>
      <span style="font-weight:700;color:${c}">${val}/100</span>
    </div>`;
  };

  const hostname = (() => { try { return new URL(siteUrl).hostname; } catch { return siteUrl; } })();

  await send({
    to,
    subject: `Audit complete: ${hostname} scored ${overallScore}/100`,
    html: layout('Audit Complete', `
      <p class="title">Your audit is ready! 🎉</p>
      <p class="sub">We finished analysing <strong>${siteUrl}</strong>. Here's your report summary:</p>

      <div style="text-align:center;padding:24px;background:#f8f9fa;border-radius:12px;margin:20px 0">
        <div style="font-size:64px;font-weight:900;color:${scoreColor};line-height:1">${overallScore}</div>
        <div style="font-size:13px;color:#888;margin-top:4px">Overall Score</div>
        <div style="font-size:14px;font-weight:600;margin-top:8px">${scoreLabel}</div>
      </div>

      <div style="margin:20px 0">
        ${scoreRow('On-Page SEO', scores.seo)}
        ${scoreRow('PageSpeed', scores.speed)}
        ${scoreRow('Security', scores.security)}
        ${scoreRow('GEO / AI Visibility', scores.geo)}
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${BASE_URL}/dashboard/audits/${auditId}" class="btn">View full report →</a>
      </div>
    `),
  });
}

// ─── Score drop alert ─────────────────────────────────────────────────────────
export async function sendScoreDropEmail(
  to: string,
  siteName: string,
  oldScore: number,
  newScore: number,
  reportUrl: string,
): Promise<void> {
  const drop = oldScore - newScore;
  await send({
    to,
    subject: `⚠️ Score dropped ${drop} points — ${siteName}`,
    html: layout('Score Alert', `
      <p class="title">⚠️ Your score dropped</p>
      <p class="sub"><strong>${siteName}</strong> dropped <strong>${drop} points</strong> since the last scan.</p>

      <div class="stat-grid">
        <div class="stat-box"><div class="stat-val" style="color:#16a34a">${oldScore}</div><div class="stat-lbl">Previous</div></div>
        <div class="stat-box"><div class="stat-val" style="color:#dc2626">${newScore}</div><div class="stat-lbl">Current</div></div>
      </div>

      <p style="font-size:14px;color:#555">This drop might be caused by a recent site change, Google algorithm update, or new technical issue. Check the full report for details.</p>

      <div style="text-align:center;margin:32px 0">
        <a href="${reportUrl}" class="btn">Investigate now →</a>
      </div>
    `),
  });
}

// ─── Security alert ────────────────────────────────────────────────────────────
export async function sendSecurityAlertEmail(
  to: string,
  siteName: string,
  issues: string[],
  reportUrl: string,
): Promise<void> {
  const issueList = issues.map((i) => `<div class="check-row"><span class="check-icon">🚨</span><div class="check-label">${i}</div></div>`).join('');
  await send({
    to,
    subject: `🚨 Security issue detected — ${siteName}`,
    html: layout('Security Alert', `
      <p class="title">🚨 Security Alert</p>
      <p class="sub">We detected <strong>${issues.length} security issue${issues.length > 1 ? 's' : ''}</strong> on <strong>${siteName}</strong> that need your attention:</p>
      <div style="margin:20px 0">${issueList}</div>
      <div style="text-align:center;margin:32px 0">
        <a href="${reportUrl}" class="btn">Fix these now →</a>
      </div>
    `),
  });
}

// ─── Audit alert (legacy compat) ──────────────────────────────────────────────
export async function sendAuditAlertEmail(
  to: string,
  siteName: string,
  summary: string,
  reportUrl: string,
): Promise<void> {
  await send({
    to,
    subject: `Site alert: ${siteName}`,
    html: layout('Site Alert', `
      <p class="title">Site Update: ${siteName}</p>
      <p class="sub">${summary}</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${reportUrl}" class="btn">View Full Report →</a>
      </div>
    `),
  });
}

// ─── Weekly digest ────────────────────────────────────────────────────────────
export async function sendDigestEmail(
  to: string,
  items: Array<{ site: string; summary: string; url: string }>,
): Promise<void> {
  const rows = items.map((i) => `
    <div style="padding:16px 0;border-bottom:1px solid #f0f0f0">
      <div style="font-weight:700;font-size:14px;color:#111">${i.site}</div>
      <div style="font-size:13px;color:#555;margin:4px 0">${i.summary}</div>
      <a href="${i.url}" style="font-size:13px;color:#f07b29;font-weight:600">View report →</a>
    </div>`).join('');

  await send({
    to,
    subject: 'Your weekly WebAudit digest',
    html: layout('Weekly Digest', `
      <p class="title">Your Weekly Digest</p>
      <p class="sub">Here's a summary of all your monitored sites this week:</p>
      <div style="margin:20px 0">${rows}</div>
      <div style="text-align:center;margin:32px 0">
        <a href="${BASE_URL}/dashboard" class="btn">Go to dashboard →</a>
      </div>
    `),
  });
}

// ─── Email verification ────────────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  await send({
    to,
    subject: 'Verify your WebAudit email address',
    html: layout('Verify Email', `
      <p class="title">Verify your email</p>
      <p class="sub">Click below to verify your email address and activate your WebAudit account.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${verifyUrl}" class="btn">Verify my email →</a>
      </div>
      <p style="font-size:13px;color:#aaa;text-align:center">This link expires in 24 hours.</p>
    `),
  });
}
