import { auth } from '@/lib/auth';
import { getUsageSummary } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import { redirect } from 'next/navigation';
import CheckoutButton from '@/components/dashboard/CheckoutButton';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const usage = await getUsageSummary(session.user.id);

  const plans = [
    { ...PLAN_FEATURES.FREE },
    { ...PLAN_FEATURES.STARTER },
    { ...PLAN_FEATURES.PRO },
    { ...PLAN_FEATURES.AGENCY },
  ];

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Billing &amp; Plan</h1>
        <p className="text-slate-400 text-sm mb-8">
          Current plan: <span className="text-white font-medium">{usage.planName}</span>
          {' · '}
          {usage.isUnlimited ? 'Unlimited audits' : `${usage.auditsRemaining} audits remaining this month`}
        </p>

        {usage.planTier !== 'FREE' && (
          <div className="mb-8">
            <form action="/api/billing/portal" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg border border-slate-700 transition"
              >
                Manage subscription in Stripe →
              </button>
            </form>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.tier === usage.planTier;
            return (
              <div
                key={plan.tier}
                className={`p-5 rounded-xl border ${isCurrent ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  {isCurrent && <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Current</span>}
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {plan.priceMonthly === 0 ? 'Free' : `$${(plan.priceMonthly / 100).toFixed(0)}/mo`}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-4">
                  <li>{plan.auditsPerMonth === -1 ? 'Unlimited audits' : `${plan.auditsPerMonth} audits/mo`}</li>
                  <li>{plan.monitoredSites === -1 ? 'Unlimited sites' : `${plan.monitoredSites} monitored sites`}</li>
                  <li>{plan.keywordsPerSite} keywords/site</li>
                  <li>{plan.rankingTracker ? '✓' : '✗'} Ranking tracker</li>
                  <li>{plan.aiSuggestions ? '✓' : '✗'} AI suggestions</li>
                  <li>{plan.emailAlerts ? '✓' : '✗'} Email alerts</li>
                  <li>{plan.dualMalware ? '✓' : '✗'} Dual malware scan</li>
                </ul>

                {!isCurrent && plan.stripePriceId && (
                  <CheckoutButton priceId={plan.stripePriceId} planName={plan.name} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
