import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Enterprise — WebAudit for Teams & Agencies',
  description: 'Unlimited audits, team access, white-label reports, priority support, and a dedicated REST API for enterprise teams.',
  openGraph: { title: 'WebAudit Enterprise', description: 'Scale SEO & AI visibility auditing across your entire organisation.' },
};

const FEATURES = [
  { icon: '🚀', title: 'Unlimited audits', desc: 'Run as many audits as your team needs — no monthly caps, no overage fees.' },
  { icon: '👥', title: 'Team workspaces', desc: 'Shared dashboards, role-based access, and project folders for every client.' },
  { icon: '🏷️', title: 'White-label reports', desc: 'Send branded PDF/DOC reports to clients under your own domain and logo.' },
  { icon: '🔑', title: 'REST API access', desc: 'Integrate audit results into your own tools, dashboards, and CI/CD pipelines.' },
  { icon: '🤖', title: 'AI executive summaries', desc: 'Claude-powered narrative insights on every report — not just raw scores.' },
  { icon: '🛡️', title: 'Priority SLA', desc: '4-hour response SLA, dedicated Slack channel, and a named account manager.' },
  { icon: '📊', title: 'Custom dashboards', desc: 'Aggregate scores across all your sites in a single real-time portfolio view.' },
  { icon: '🔗', title: 'SSO / SAML', desc: 'Enterprise-grade identity management with Okta, Azure AD, and Google Workspace.' },
];

const SOCIAL_PROOF = [
  { quote: 'WebAudit cut our audit turnaround from 2 weeks to 2 minutes. Our clients love the white-label reports.', name: 'Priya M.', role: 'Head of SEO, Digital Agency' },
  { quote: 'The API integration lets us trigger audits on every deploy. Caught a critical title regression before it hit prod.', name: 'David K.', role: 'Lead Engineer, eCommerce' },
  { quote: 'GEO scoring has become our differentiator with clients. No other tool shows AI search visibility this clearly.', name: 'Sofia R.', role: 'SEO Director, Enterprise SaaS' },
];

const PLANS = [
  { name: 'PRO', price: '$49', per: '/mo', sites: '10 sites', audits: '500 audits/mo', reports: 'PDF + DOC', api: false, sla: '24h support', cta: 'Start PRO', href: '/register?plan=pro' },
  { name: 'Agency', price: '$149', per: '/mo', sites: '50 sites', audits: 'Unlimited', reports: 'White-label', api: true, sla: '4h SLA', cta: 'Start Agency', href: '/register?plan=agency', featured: true },
  { name: 'Enterprise', price: 'Custom', per: '', sites: 'Unlimited sites', audits: 'Unlimited', reports: 'White-label + custom', api: true, sla: 'Dedicated + Slack', cta: 'Contact sales', href: '/contact?type=enterprise' },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-widest mb-6">Enterprise & Agency</div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Scale your SEO<br />across every site
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed mb-10">
            Unlimited audits, team workspaces, white-label reports, and a full REST API — everything agencies and enterprise teams need to move fast.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact?type=enterprise" className="px-8 py-3.5 bg-[#f07b29] hover:bg-orange-500 text-white font-bold rounded-xl transition shadow-xl shadow-orange-600/20">
              Talk to sales →
            </Link>
            <Link href="/register?plan=agency" className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition">
              Start Agency free trial
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST LOGOS */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-center text-slate-600 text-xs font-semibold uppercase tracking-widest mb-6">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
          {['Acme Corp', 'Momentum', 'Clearbit Co', 'Digital Edge', 'WebScale', 'Rank Pro'].map(n => (
            <span key={n} className="text-slate-400 font-bold text-lg tracking-tight">{n}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Everything teams need</h2>
        <p className="text-slate-400 text-center mb-12">Built for agencies managing many clients and enterprises with complex audit workflows.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/30 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS COMPARISON */}
      <section id="agencies" className="max-w-5xl mx-auto px-6 py-16 scroll-mt-24">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Compare plans</h2>
        <p className="text-slate-400 text-center mb-12">Choose the right tier for your team size and audit volume.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`p-7 rounded-2xl border ${p.featured ? 'border-blue-500/50 bg-blue-600/10' : 'border-slate-800/60 bg-slate-900/40'} relative`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Most Popular</div>}
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{p.name}</div>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white">{p.price}</span>
                <span className="text-slate-400 text-sm pb-1">{p.per}</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {[p.sites, p.audits, p.reports, p.api ? 'REST API access' : 'No API', p.sla].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-green-400 text-xs">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`block text-center py-3 rounded-xl font-bold text-sm transition ${p.featured ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-slate-700 hover:border-slate-500 text-slate-300'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {SOCIAL_PROOF.map(t => (
            <div key={t.name} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
              <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <div className="text-white font-bold text-sm">{t.name}</div>
                <div className="text-slate-500 text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="p-10 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-[#020817]">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to scale your audit workflow?</h2>
          <p className="text-slate-400 mb-8">Custom pricing, custom SLA, and onboarding support included. No lock-in contracts.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact?type=enterprise" className="px-8 py-3.5 bg-[#f07b29] hover:bg-orange-500 text-white font-bold rounded-xl transition">
              Talk to sales →
            </Link>
            <Link href="/register?plan=agency" className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition">
              Try Agency plan free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
