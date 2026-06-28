import type { SSLResult, CheckItem } from '@/types/audit';

export async function runSSLCheck(url: string, responseHeaders: Record<string, string>): Promise<SSLResult> {
  const checks: CheckItem[] = [];
  const isHttps = url.startsWith('https://');

  // ─── HTTPS ────────────────────────────────────────────────────────────────
  checks.push({
    id: 'https',
    title: 'HTTPS Enabled',
    status: isHttps ? 'pass' : 'fail',
    severity: 'critical',
    value: isHttps ? 'Yes' : 'No',
    note: isHttps ? 'Site uses HTTPS' : 'Site is not HTTPS — Google penalizes insecure sites and browsers show "Not Secure" warning',
  });

  // ─── Security headers ─────────────────────────────────────────────────────
  const hsts = !!responseHeaders['strict-transport-security'];
  const xfo = !!responseHeaders['x-frame-options'];
  const xcto = !!responseHeaders['x-content-type-options'];
  const csp = !!responseHeaders['content-security-policy'];
  const rp = !!responseHeaders['referrer-policy'];
  const pp = !!responseHeaders['permissions-policy'];

  const headerChecks = [
    { key: 'hsts', header: 'strict-transport-security', present: hsts, severity: 'high' as const, note: 'Prevents protocol downgrade attacks' },
    { key: 'x-frame-options', header: 'x-frame-options', present: xfo, severity: 'high' as const, note: 'Prevents clickjacking attacks' },
    { key: 'x-content-type', header: 'x-content-type-options', present: xcto, severity: 'medium' as const, note: 'Prevents MIME-type sniffing' },
    { key: 'csp', header: 'content-security-policy', present: csp, severity: 'high' as const, note: 'Prevents XSS and injection attacks' },
    { key: 'referrer-policy', header: 'referrer-policy', present: rp, severity: 'low' as const, note: 'Controls referrer information sent with requests' },
    { key: 'permissions-policy', header: 'permissions-policy', present: pp, severity: 'low' as const, note: 'Controls browser feature access' },
  ];

  for (const hc of headerChecks) {
    checks.push({
      id: hc.key,
      title: hc.header.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      status: hc.present ? 'pass' : 'warn',
      severity: hc.present ? 'info' : hc.severity,
      value: hc.present ? responseHeaders[hc.header] ?? 'Present' : null,
      note: hc.present ? `${hc.header} header is set` : `Missing ${hc.header} — ${hc.note}`,
    });
  }

  // ─── Grade ────────────────────────────────────────────────────────────────
  const securityHeaders = { hsts, xfo, xcto, csp };
  const headerCount = Object.values(securityHeaders).filter(Boolean).length;

  const grade: SSLResult['grade'] =
    !isHttps ? 'F' :
    headerCount === 4 ? 'A' :
    headerCount === 3 ? 'B' :
    headerCount === 2 ? 'C' :
    headerCount === 1 ? 'D' : 'D';

  // ─── Score ────────────────────────────────────────────────────────────────
  const passed = checks.filter((c) => c.status === 'pass').length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    grade,
    httpsEnabled: isHttps,
    certValid: isHttps,
    certExpiresAt: null,
    daysUntilExpiry: null,
    headers: { hsts, xfo, xcto, csp, rp, pp },
    checks,
  };
}
