import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security — WebAudit',
  description: 'How WebAudit protects your data — encryption, infrastructure security, responsible disclosure, and compliance.',
  openGraph: { title: 'WebAudit Security', description: 'Our commitment to protecting your data and platform security.' },
};

const MEASURES = [
  { icon: '🔐', title: 'TLS 1.3 Encryption', desc: 'All data in transit is encrypted with TLS 1.3. Older protocol versions are rejected.' },
  { icon: '🗄️', title: 'AES-256 at Rest', desc: 'Database contents are encrypted at rest using AES-256. Backups use the same standard.' },
  { icon: '🔑', title: 'Hashed Passwords', desc: 'Passwords are hashed with bcrypt (cost factor 12). We never store plaintext passwords.' },
  { icon: '🛡️', title: 'HSTS Enforced', desc: 'Strict-Transport-Security with a 1-year max-age and includeSubDomains is set on all production domains.' },
  { icon: '🔒', title: 'CSP Headers', desc: 'Content Security Policy headers restrict script sources and prevent XSS attacks.' },
  { icon: '🏠', title: 'Infrastructure Isolation', desc: 'Database and application layers run in isolated network segments. Direct database access requires VPN.' },
  { icon: '📋', title: 'Dependency Scanning', desc: 'Automated dependency vulnerability scanning runs on every pull request via GitHub Dependabot.' },
  { icon: '🔍', title: 'Annual Penetration Testing', desc: 'We commission an independent penetration test annually. Findings are remediated with priority SLAs.' },
];

const COMPLIANCE = [
  { label: 'GDPR', desc: 'Data processing agreements available on request. EU data residency options available on enterprise plans.' },
  { label: 'UK GDPR', desc: 'Compliant with UK data protection requirements post-Brexit.' },
  { label: 'SOC 2 Type II', desc: 'In progress — target completion Q4 2026.' },
  { label: 'CCPA', desc: 'California Consumer Privacy Act — data deletion and opt-out requests honoured.' },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-green-600/10 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-widest mb-6">Security</div>
          <h1 className="text-5xl font-bold text-white mb-4">Your data is safe with us</h1>
          <p className="text-slate-400 text-xl">Security is built into every layer of WebAudit — from encryption to infrastructure to independent auditing.</p>
        </div>
      </section>

      {/* MEASURES */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MEASURES.map(m => (
            <div key={m.title} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-green-500/20 transition">
              <div className="text-3xl mb-4">{m.icon}</div>
              <h3 className="text-white font-bold mb-2">{m.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Compliance & certifications</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {COMPLIANCE.map(c => (
            <div key={c.label} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
              <div className="text-white font-bold mb-1">{c.label}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLOSURE */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="p-8 rounded-3xl border border-orange-500/20 bg-orange-500/5">
          <h2 className="text-2xl font-bold text-white mb-3">Responsible disclosure</h2>
          <p className="text-slate-400 leading-relaxed mb-5">
            If you discover a security vulnerability in WebAudit, please report it responsibly. We commit to acknowledging reports within 48 hours, provide updates as we investigate, and credit researchers in our changelog if they wish.
          </p>
          <a href="mailto:security@webaudit.app" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition text-sm">
            Report a vulnerability →
          </a>
        </div>
      </section>

      {/* STATUS */}
      <section className="max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 font-semibold">All systems operational</span>
        </div>
        <p className="text-slate-500 text-sm">
          Questions? Email <a href="mailto:security@webaudit.app" className="text-blue-400 hover:text-blue-300">security@webaudit.app</a> or see our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
        </p>
      </section>
    </div>
  );
}
