import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Integrations — WebAudit',
  description: 'Connect WebAudit with your existing tools — Slack, GitHub, Google Search Console, Zapier, and more.',
  openGraph: { title: 'WebAudit Integrations', description: 'Connect WebAudit with Slack, GitHub, GSC, Zapier, and more.' },
};

const INTEGRATIONS = [
  { icon: '🔔', name: 'Slack', category: 'Notifications', desc: 'Get score drop and critical issue alerts straight into your team Slack channel.', status: 'Coming soon' },
  { icon: '🐙', name: 'GitHub Actions', category: 'CI/CD', desc: 'Trigger audits on every push or PR merge. Fail builds on score regression.', status: 'Coming soon' },
  { icon: '📊', name: 'Google Search Console', category: 'Analytics', desc: 'Import GSC keyword data alongside your WebAudit scores for combined insight.', status: 'Coming soon' },
  { icon: '⚡', name: 'Zapier', category: 'Automation', desc: 'Connect WebAudit to 5,000+ apps — trigger audits from any Zap workflow.', status: 'Coming soon' },
  { icon: '🔗', name: 'Webhook', category: 'Developer', desc: 'POST audit results to any endpoint in real time — build your own integrations.', status: 'Available' },
  { icon: '📋', name: 'REST API', category: 'Developer', desc: 'Full programmatic access to audits, scores, and issue data via authenticated API.', status: 'Available' },
  { icon: '🎯', name: 'Google Analytics 4', category: 'Analytics', desc: 'Correlate your audit scores with organic traffic trends in GA4.', status: 'Coming soon' },
  { icon: '📧', name: 'Email', category: 'Notifications', desc: 'Automated email reports and score alerts — configurable frequency and recipients.', status: 'Available' },
  { icon: '🔐', name: 'Okta / Azure AD', category: 'Auth', desc: 'SAML SSO for enterprise teams — single sign-on with your existing identity provider.', status: 'Enterprise' },
  { icon: '🗂️', name: 'Notion', category: 'Productivity', desc: 'Export audit results to Notion databases for team tracking and planning.', status: 'Coming soon' },
  { icon: '📈', name: 'Ahrefs', category: 'SEO Tools', desc: 'Combine Ahrefs backlink data with WebAudit technical scores for full-picture SEO.', status: 'Coming soon' },
  { icon: '🌐', name: 'Cloudflare', category: 'Infrastructure', desc: 'Trigger audits after Cloudflare cache purges or deploy hooks.', status: 'Coming soon' },
];

const statusBadge: Record<string, string> = {
  Available: 'text-green-400 bg-green-500/10 border-green-500/20',
  'Coming soon': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Enterprise: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Integrations</div>
          <h1 className="text-5xl font-bold text-white mb-4">Connect your whole stack</h1>
          <p className="text-slate-400 text-xl">Audit results, alerts, and reports — exactly where your team already works.</p>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INTEGRATIONS.map(i => (
            <div key={i.name} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-slate-700 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{i.icon}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[i.status]}`}>{i.status}</span>
              </div>
              <h3 className="text-white font-bold mb-1">{i.name}</h3>
              <div className="text-xs text-slate-500 mb-3">{i.category}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="p-10 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-[#020817] grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Build your own integration</h2>
            <p className="text-slate-400 leading-relaxed">The WebAudit REST API gives you full programmatic access to run audits, retrieve scores, and build custom dashboards — no UI required.</p>
          </div>
          <div className="space-y-3">
            <Link href="/docs" className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 hover:border-blue-500/40 bg-slate-900/60 transition group">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-blue-400 transition">Read the API docs</div>
                <div className="text-slate-500 text-xs">REST reference, authentication, examples</div>
              </div>
            </Link>
            <Link href="/dashboard/settings/api-keys" className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 hover:border-blue-500/40 bg-slate-900/60 transition group">
              <span className="text-2xl">🔑</span>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-blue-400 transition">Get your API key</div>
                <div className="text-slate-500 text-xs">Free to start — no credit card needed</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* REQUEST */}
      <section className="max-w-2xl mx-auto px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Need an integration we don&apos;t have?</h2>
        <p className="text-slate-400 text-sm mb-5">Vote for or request integrations — we ship the most-requested ones each quarter.</p>
        <Link href="/contact" className="inline-block px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition text-sm">
          Request an integration →
        </Link>
      </section>
    </div>
  );
}
