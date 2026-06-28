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

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const activePlan = PLANS[activeTab];

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PLANS.map((plan) => {
            const isPro = plan.tier === 'PRO';
            return (
              <div key={plan.tier} className={`relative p-4 sm:p-5 rounded-2xl border flex flex-col ${isPro ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900'}`}>
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-white text-base sm:text-lg mb-1">{plan.name}</h3>
                <p className="text-2xl sm:text-3xl font-black text-white mb-3">
                  {plan.priceMonthly === 0 ? 'Free' : `$${(plan.priceMonthly / 100).toFixed(0)}`}
                  {plan.priceMonthly > 0 && <span className="text-slate-500 text-sm font-normal">/mo</span>}
                </p>
                <ul className="space-y-1 text-xs sm:text-sm text-slate-400 mb-5 flex-1">
                  <li className="font-semibold text-white">{plan.auditsPerMonth === -1 ? 'Unlimited' : plan.auditsPerMonth} audits/mo</li>
                  <li>{plan.monitoredSites === -1 ? 'Unlimited' : plan.monitoredSites} sites</li>
                  {plan.aiSuggestions && <li className="text-green-400">✓ AI analysis</li>}
                  {plan.whiteLabel && <li className="text-green-400">✓ White label</li>}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-2 text-center text-xs sm:text-sm font-semibold rounded-xl transition ${isPro ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                >
                  {plan.priceMonthly === 0 ? 'Start free' : 'Get started'}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature comparison — tabbed for all screen sizes */}
        <h2 className="text-xl font-bold text-white mb-5 text-center">Full feature comparison</h2>

        {/* Plan selector tabs */}
        <div className="flex rounded-xl border border-slate-800 overflow-hidden mb-4">
          {PLANS.map((p, i) => (
            <button
              key={p.tier}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === i
                  ? p.tier === 'PRO' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Active plan features */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Plan header */}
          <div className={`px-5 py-4 border-b border-slate-800 flex items-center justify-between ${activePlan.tier === 'PRO' ? 'bg-blue-500/10' : ''}`}>
            <div>
              <h3 className="text-white font-bold text-lg">{activePlan.name} Plan</h3>
              <p className="text-slate-400 text-sm">
                {activePlan.priceMonthly === 0 ? 'Free forever' : `$${(activePlan.priceMonthly / 100).toFixed(0)}/month`}
              </p>
            </div>
            <Link
              href="/register"
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activePlan.tier === 'PRO' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {activePlan.priceMonthly === 0 ? 'Start free' : 'Get started →'}
            </Link>
          </div>

          {/* Feature rows */}
          <div className="divide-y divide-slate-800/60">
            {FEATURES.map((feat) => {
              const val = activePlan[feat.key];
              return (
                <div key={feat.key} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-slate-400 text-sm">{feat.label}</span>
                  {typeof val === 'boolean' ? (
                    val
                      ? <span className="text-green-400 text-lg font-bold">✓</span>
                      : <span className="text-slate-700 text-lg">—</span>
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
