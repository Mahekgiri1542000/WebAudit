import Link from 'next/link';
import { PLAN_FEATURES } from '@/lib/billing/plans';

const FEATURES = [
  { label: 'Audits per month', key: 'auditsPerMonth' as const, format: (v: number) => v === -1 ? 'Unlimited' : String(v) },
  { label: 'Monitored sites', key: 'monitoredSites' as const, format: (v: number) => v === -1 ? 'Unlimited' : String(v) },
  { label: 'Keywords per site', key: 'keywordsPerSite' as const, format: (v: number) => String(v) },
  { label: 'Report history', key: 'historyDays' as const, format: (v: number) => `${v} days` },
  { label: 'Email alerts', key: 'emailAlerts' as const },
  { label: 'Ranking tracker', key: 'rankingTracker' as const },
  { label: 'AI suggestions', key: 'aiSuggestions' as const },
  { label: 'Dual malware scan', key: 'dualMalware' as const },
  { label: 'Shareable reports', key: 'shareableReport' as const },
];

const PLANS = [
  PLAN_FEATURES.FREE,
  PLAN_FEATURES.STARTER,
  PLAN_FEATURES.PRO,
  PLAN_FEATURES.AGENCY,
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020817] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-300">← Home</Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-4">Simple, transparent pricing</h1>
          <p className="text-slate-400 text-lg">Start free. Upgrade when you need more.</p>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLANS.map((plan) => {
            const isPro = plan.tier === 'PRO';
            return (
              <div
                key={plan.tier}
                className={`relative p-6 rounded-2xl border ${isPro ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900'}`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                <p className="text-3xl font-black text-white mb-1">
                  {plan.priceMonthly === 0 ? 'Free' : `$${(plan.priceMonthly / 100).toFixed(0)}`}
                  {plan.priceMonthly > 0 && <span className="text-slate-500 text-base font-normal">/mo</span>}
                </p>

                <ul className="space-y-2 text-sm text-slate-400 mb-6 mt-4">
                  <li className="font-medium text-white">
                    {plan.auditsPerMonth === -1 ? 'Unlimited audits' : `${plan.auditsPerMonth} audits/month`}
                  </li>
                  <li>{plan.monitoredSites === -1 ? 'Unlimited' : plan.monitoredSites} monitored sites</li>
                  <li>{plan.keywordsPerSite} keywords/site</li>
                  {plan.emailAlerts && <li className="text-green-400">✓ Email alerts</li>}
                  {plan.rankingTracker && <li className="text-green-400">✓ Ranking tracker</li>}
                  {plan.aiSuggestions && <li className="text-green-400">✓ AI suggestions (Claude)</li>}
                  {plan.dualMalware && <li className="text-green-400">✓ Dual malware scan</li>}
                  {plan.shareableReport && <li className="text-green-400">✓ Shareable reports</li>}
                </ul>

                {plan.priceMonthly === 0 ? (
                  <Link
                    href="/register"
                    className={`block w-full py-2.5 text-center text-sm font-semibold rounded-lg transition bg-slate-800 hover:bg-slate-700 text-white`}
                  >
                    Get started free
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className={`block w-full py-2.5 text-center text-sm font-semibold rounded-lg transition ${isPro ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                  >
                    Start {plan.name} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <h2 className="text-xl font-bold text-white mb-6 text-center">Full feature comparison</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-4 text-left text-slate-400 font-medium w-1/3">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.tier} className={`px-4 py-4 text-center font-bold ${p.tier === 'PRO' ? 'text-blue-400' : 'text-white'}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat) => (
                <tr key={feat.key} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="px-5 py-3 text-slate-400">{feat.label}</td>
                  {PLANS.map((p) => {
                    const val = p[feat.key];
                    let display: React.ReactNode;
                    if (typeof val === 'boolean') {
                      display = val
                        ? <span className="text-green-400 text-lg">✓</span>
                        : <span className="text-slate-700 text-lg">—</span>;
                    } else {
                      display = <span className="text-white">{feat.format ? feat.format(val as number) : String(val)}</span>;
                    }
                    return (
                      <td key={p.tier} className="px-4 py-3 text-center">{display}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes — cancel from your billing dashboard, no questions asked. You keep access until the end of your billing period.',
              },
              {
                q: 'What counts as one audit?',
                a: 'One audit = one URL analyzed. Running the same URL again counts as a second audit. Your monthly count resets at the start of each billing cycle.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a full refund within 7 days if you\'re not satisfied. Contact support with your email address.',
              },
              {
                q: 'What AI model powers the suggestions?',
                a: 'Claude claude-opus-4-8 by Anthropic — one of the most capable models available. It reads your actual page content and generates site-specific fixes, not templates.',
              },
            ].map((item) => (
              <details key={item.q} className="bg-slate-900 border border-slate-800 rounded-xl p-5 group">
                <summary className="text-white font-medium cursor-pointer flex justify-between items-center">
                  {item.q}
                  <span className="text-slate-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-slate-400 text-sm mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <Link href="/register" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm">
            Start for free — no credit card required
          </Link>
        </div>
      </div>
    </div>
  );
}
