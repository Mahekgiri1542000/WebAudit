import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation — WebAudit',
  description: 'API reference, guides, and integration documentation for WebAudit.',
  openGraph: { title: 'WebAudit Docs', description: 'REST API reference, quickstart guides, and integration docs.' },
};

const SECTIONS = [
  {
    icon: '🚀',
    title: 'Quickstart',
    desc: 'Run your first audit in 2 minutes — via the dashboard or API.',
    links: [
      { label: 'Dashboard quickstart', href: '/docs/quickstart-dashboard' },
      { label: 'API quickstart', href: '/docs/quickstart-api' },
      { label: 'Audit your first URL', href: '/docs/first-audit' },
    ],
  },
  {
    icon: '🔑',
    title: 'Authentication',
    desc: 'API keys, OAuth scopes, and rate limits.',
    links: [
      { label: 'Getting an API key', href: '/docs/authentication' },
      { label: 'Rate limits', href: '/docs/rate-limits' },
      { label: 'OAuth for agencies', href: '/docs/oauth' },
    ],
  },
  {
    icon: '📋',
    title: 'REST API Reference',
    desc: 'Full endpoint reference with request/response examples.',
    links: [
      { label: 'POST /audits — run an audit', href: '/docs/api/audits-create' },
      { label: 'GET /audits/:id — retrieve results', href: '/docs/api/audits-get' },
      { label: 'GET /audits — list audits', href: '/docs/api/audits-list' },
      { label: 'Webhook events', href: '/docs/api/webhooks' },
    ],
  },
  {
    icon: '📊',
    title: 'Audit Data Schema',
    desc: 'Understanding scores, categories, and check results.',
    links: [
      { label: 'Score calculation', href: '/docs/scores' },
      { label: 'SEO checks reference', href: '/docs/checks/seo' },
      { label: 'GEO checks reference', href: '/docs/checks/geo' },
      { label: 'Security checks reference', href: '/docs/checks/security' },
    ],
  },
  {
    icon: '🔗',
    title: 'Integrations',
    desc: 'Connect WebAudit to your existing tools and workflows.',
    links: [
      { label: 'GitHub Actions CI/CD', href: '/docs/integrations/github-actions' },
      { label: 'Webhook integration guide', href: '/docs/integrations/webhooks' },
      { label: 'Zapier setup', href: '/docs/integrations/zapier' },
    ],
  },
  {
    icon: '🏷️',
    title: 'White-label & Agency',
    desc: 'Customise reports for clients on Agency and Enterprise plans.',
    links: [
      { label: 'White-label PDF setup', href: '/docs/white-label' },
      { label: 'Multi-site management', href: '/docs/multi-site' },
      { label: 'Client workspace guide', href: '/docs/workspaces' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Documentation</div>
          <h1 className="text-5xl font-bold text-white mb-4">WebAudit Docs</h1>
          <p className="text-slate-400 text-lg">API reference, integration guides, and everything you need to get the most out of WebAudit.</p>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {['API Reference', 'Quickstart', 'Authentication', 'Webhook Events', 'Score Schema', 'White-label'].map(l => (
            <Link key={l} href="#" className="px-4 py-2 rounded-xl border border-slate-700 hover:border-blue-500/40 text-slate-400 hover:text-white text-sm transition">
              {l}
            </Link>
          ))}
        </div>
      </section>

      {/* EXAMPLE */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick example — run an audit via API</div>
          <pre className="text-sm text-green-400 overflow-x-auto"><code>{`curl -X POST https://webaudit.app/api/audits \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'

# Response
{
  "id": "audit_abc123",
  "status": "pending",
  "url": "https://example.com"
}`}</code></pre>
        </div>
      </section>

      {/* SECTIONS GRID */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map(s => (
            <div key={s.title} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-slate-700 transition">
              <div className="text-3xl mb-4">{s.icon}</div>
              <h2 className="text-white font-bold text-lg mb-1">{s.title}</h2>
              <p className="text-slate-500 text-sm mb-5">{s.desc}</p>
              <ul className="space-y-2">
                {s.links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 transition">
                      <span className="text-slate-600">→</span> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Couldn&apos;t find what you need?</h2>
        <p className="text-slate-400 text-sm mb-6">Our support team answers technical questions within 4 hours on paid plans.</p>
        <Link href="/contact" className="inline-block px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
          Contact support →
        </Link>
      </section>
    </div>
  );
}
