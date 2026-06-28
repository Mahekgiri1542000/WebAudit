import { auth } from '@/lib/auth';
import { getUsageSummary } from '@/lib/billing/usage';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const usage = await getUsageSummary(session.user.id);

  const invoices = [
    { id: 'INV-001', date: '2026-06-01', amount: '$49.00', status: 'Paid', plan: 'PRO Monthly' },
    { id: 'INV-002', date: '2026-05-01', amount: '$49.00', status: 'Paid', plan: 'PRO Monthly' },
    { id: 'INV-003', date: '2026-04-01', amount: '$49.00', status: 'Paid', plan: 'PRO Monthly' },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-1">Billing</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your subscription, payment method, and invoices.</p>

      {/* Current plan */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Current plan</h2>
          <Link href="/dashboard/billing" className="text-blue-400 hover:text-blue-300 text-sm transition">
            Change plan →
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
            <div className="text-white font-black text-xl">{usage.planName}</div>
            <div className="text-slate-400 text-xs mt-0.5">
              {usage.isUnlimited ? 'Unlimited audits' : `${usage.auditsUsed} / ${usage.auditsUsed + usage.auditsRemaining} audits used`}
            </div>
          </div>
          {usage.planTier !== 'FREE' && (
            <form action="/api/billing/portal" method="POST">
              <button type="submit" className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 text-sm font-semibold rounded-xl transition">
                Manage in Stripe →
              </button>
            </form>
          )}
        </div>

        {usage.planTier === 'FREE' && (
          <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <p className="text-orange-300 text-sm font-semibold mb-1">Upgrade to unlock more</p>
            <p className="text-slate-400 text-xs">PRO from $49/mo — PDF reports, AI summaries, unlimited history.</p>
            <Link href="/dashboard/billing" className="inline-block mt-3 px-4 py-2 bg-[#f07b29] hover:bg-orange-500 text-white font-bold rounded-xl transition text-xs">
              View plans →
            </Link>
          </div>
        )}
      </div>

      {/* Invoices */}
      {usage.planTier !== 'FREE' && (
        <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
          <h2 className="text-white font-bold mb-5">Invoice history</h2>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-semibold">{inv.plan}</p>
                  <p className="text-slate-500 text-xs">{inv.id} · {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-sm">{inv.amount}</span>
                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-4">Full invoice history available in your Stripe customer portal.</p>
        </div>
      )}
    </div>
  );
}
