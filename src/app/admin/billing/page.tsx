import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminBillingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const [subscriptions, planStats] = await Promise.all([
    db.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        plan: true,
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { currentPeriodEnd: 'asc' },
    }),
    db.subscription.groupBy({
      by: ['planId'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
    }),
  ]);

  const plans = await db.plan.findMany();
  const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

  const mrr = subscriptions.reduce((sum, s) => {
    return sum + (s.plan.priceMonthly ?? 0);
  }, 0);

  const planBreakdown = planStats.map((stat) => ({
    plan: planMap[stat.planId],
    count: stat._count.id,
    revenue: (planMap[stat.planId]?.priceMonthly ?? 0) * stat._count.id,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-slate-500 text-sm hover:text-slate-300">← Admin</Link>
          <h1 className="text-2xl font-bold text-white">Billing Statistics</h1>
        </div>

        {/* MRR */}
        <div className="p-6 bg-slate-900 border border-blue-500/30 rounded-xl mb-6">
          <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Monthly Recurring Revenue</p>
          <p className="text-5xl font-black text-white">${(mrr / 100).toFixed(2)}</p>
          <p className="text-slate-500 text-xs mt-2">{subscriptions.filter((s) => s.status === 'ACTIVE').length} active paid subscriptions</p>
        </div>

        {/* Plan breakdown */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {planBreakdown.map(({ plan, count, revenue }) => (
            <div key={plan?.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-white font-semibold">{plan?.name ?? 'Unknown'}</p>
              <p className="text-3xl font-bold text-white mt-2">{count}</p>
              <p className="text-slate-400 text-xs mt-1">subscribers</p>
              <p className="text-green-400 text-sm font-semibold mt-2">${(revenue / 100).toFixed(0)}/mo</p>
            </div>
          ))}
        </div>

        {/* Active subscriptions table */}
        <h2 className="text-sm font-semibold text-white mb-3">Active Subscriptions</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">User</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">MRR</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Renews</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions
                .filter((s) => s.plan.priceMonthly > 0)
                .map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-[180px]">{sub.user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">{sub.plan.name}</span>
                    </td>
                    <td className="px-4 py-3 text-green-400 text-xs font-semibold">
                      ${(sub.plan.priceMonthly / 100).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
