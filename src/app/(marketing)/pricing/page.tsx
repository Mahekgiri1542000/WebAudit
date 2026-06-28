'use client';
import Link from 'next/link';
import { useState } from 'react';
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
  { label: 'White label', key: 'whiteLabel' as const },
];

const PLANS = [
  PLAN_FEATURES.FREE,
  PLAN_FEATURES.STARTER,
  PLAN_FEATURES.PRO,
  PLAN_FEATURES.AGENCY,
] as const;

function MobileComparison() {
  const [active, setActive] = useState(0);
  const plan = PLANS[active];

  return (
    <div className="md:hidden">
      {/* Plan tabs */}
      <div className="flex rounded-xl border border-slate-800 overflow-hidden mb-4">
        {PLANS.map((p, i) => (
          <button
            key={p.tier}
            onClick={() => setActive(i)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              active === i
                ? p.tier === 'PRO' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-500'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Feature list for selected plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className={`px-5 py-4 border-b border-slate-800 ${plan.tier === 'PRO' ? 'bg-blue-500/10' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">{plan.name}</h3>
              <p className="text-slate-400 text-sm">
                {plan.priceMonthly === 0 ? 'Free forever' : `$${(plan.priceMonthly / 100).toFixed(0)}/month`}
              </p>
            </div>
            <Link
              href="/register"
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                plan.tier === 'PRO' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {plan.priceMonthly === 0 ? 'Start free' : 'Get started'}
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {FEATURES.map((feat) => {
            const val = plan[feat.key];
            return (
              <div key={feat.key} className="flex items-center justify-between px-5 py-3">
                <span className="text-slate-400 text-sm">{feat.label}</span>
                {typeof val === 'boolean' ? (
                  val
                    ? <span className="text-green-400 font-bold">✓</span>
                    : <span className="text-slate-700">—</span>
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {feat.format ? feat.format(val as number) : String(val)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020817] py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">← Home</Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">Simple, transparent pricing</h1>
          <p className="text-slate-400 text-base sm:text-lg">Start free. Upgrade when you need more.</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PLANS.map((plan) => {
            const isPro = plan.tier === 'PRO';
            return (
              <div
                key={plan.tier}
                className={`relative p-5 rounded-2xl border flex flex-col ${isPro ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900'}`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                  <p className="text-3xl font-black text-white">
                    {plan.priceMonthly === 0 ? 'Free' : `$${(plan.priceMonthly / 100).toFixed(0)}`}
                    {plan.priceMonthly > 0 && <span className="text-slate-500 text-base font-normal">/mo</span>}
                  </p>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-400 mb-6 flex-1">
                  <li className="font-semibold text-white">
                    {plan.auditsPerMonth === -1 ? 'Unlimited audits' : `${plan.auditsPerMonth} audits/mo`}
                  </li>
                  <li>{plan.monitoredSites === -1 ? 'Unlimited' : plan.monitoredSites} monitored sites</li>
                  <li>{plan.keywordsPerSite} keywords/site</li>
                  {plan.emailAlerts && <li className="text-green-400">✓ Email alerts</li>}
                  {plan.rankingTracker && <li className="text-green-400">✓ Ranking tracker</li>}
                  {plan.aiSuggestions && <li className="text-green-400">✓ AI suggestions</li>}
                  {plan.dualMalware && <li className="text-green-400">✓ Dual malware scan</li>}
                  {plan.shareableReport && <li className="text-green-400">✓ Shareable reports</li>}
                  {plan.whiteLabel && <li className="text-green-400">✓ White label</li>}
                </ul>
                {plan.priceMonthly === 0 ? (
                  <Link href="/register" className="block w-full py-2.5 text-center text-sm font-semibold rounded-xl transition bg-slate-800 hover:bg-slate-700 text-white">
                    Get started free
                  </Link>
                ) : (
                  <Link href="/register" className={`block w-full py-2.5 text-center text-sm font-semibold rounded-xl transition ${isPro ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                    Start {plan.name} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <h2 className="text-xl font-bold text-white mb-5 text-center">Full feature comparison</h2>

        {/* Mobile: tabbed plan view */}
        <MobileComparison />

        {/* Desktop: full table */}
        <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-4 text-left text-slate-400 font-medium w-1/3">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.tier} className={`px-4 py-4 text-center font-bold ${p.tier === 'PRO' ? 'text-blue-400' : 'text-white'}`}>
                    {p.name}
                    {p.tier === 'PRO' && <span className="block text-[10px] text-blue-500 font-normal">Popular</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, i) => (
                <tr key={feat.key} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${i % 2 === 1 ? 'bg-slate-900/40' : ''}`}>
                  <td className="px-5 py-3 text-slate-400">{feat.label}</td>
                  {PLANS.map((p) => {
                    const val = p[feat.key];
                    let display: React.ReactNode;
                    if (typeof val === 'boolean') {
                      display = val
                        ? <span className="text-green-400 text-lg">✓</span>
                        : <span className="text-slate-700 text-lg">—</span>;
                    } else {
                      display = <span className="text-white font-medium">{feat.format ? feat.format(val as number) : String(val)}</span>;
                    }
                    return <td key={p.tier} className="px-4 py-3 text-center">{display}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="mt-14 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Common questions</h2>
          <div className="space-y-3">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes — cancel from your billing dashboard, no questions asked. You keep access until the end of your billing period.' },
              { q: 'What counts as one audit?', a: 'One audit = one URL analyzed. Running the same URL again counts as a second audit. Your monthly count resets at the start of each billing cycle.' },
              { q: 'Do you offer refunds?', a: "We offer a full refund within 7 days if you're not satisfied. Contact support with your email address." },
              { q: 'What AI model powers the suggestions?', a: 'Claude Opus by Anthropic — one of the most capable models available. It reads your actual page content and generates site-specific fixes, not templates.' },
            ].map((item) => (
              <details key={item.q} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 group">
                <summary className="text-white font-medium cursor-pointer flex justify-between items-center gap-4 text-sm sm:text-base">
                  <span>{item.q}</span>
                  <span className="text-slate-500 group-open:rotate-45 transition-transform shrink-0 text-xl leading-none">+</span>
                </summary>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-slate-400 mb-4 text-sm">Still have questions?</p>
          <Link href="/register" className="inline-block px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm">
            Start for free — no credit card required
          </Link>
        </div>

      </div>
    </div>
  );
}
