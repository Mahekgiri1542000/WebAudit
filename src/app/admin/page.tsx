import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  const [totalUsers, totalAudits, recentAudits, recentUsers] = await Promise.all([
    db.user.count(),
    db.audit.count(),
    db.audit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, url: true, overallScore: true, status: true, createdAt: true,
        user: { select: { email: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, email: true, role: true, createdAt: true,
        subscription: { include: { plan: true } },
      },
    }),
  ]);

  const completedAudits = await db.audit.count({ where: { status: 'COMPLETED' } });
  const failedAudits = await db.audit.count({ where: { status: 'FAILED' } });

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Logged in as {session.user.role}</p>
          </div>
          {session.user.role === 'SUPER_ADMIN' && (
            <Link href="/admin/billing" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg border border-slate-700 transition">
              Billing Stats →
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: totalUsers },
            { label: 'Total Audits', value: totalAudits },
            { label: 'Completed', value: completedAudits },
            { label: 'Failed', value: failedAudits },
          ].map((stat) => (
            <div key={stat.label} className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
              <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Audits */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-3">Recent Audits</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">URL</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">User</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Score</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAudits.map((audit) => (
                    <tr key={audit.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/audits/${audit.id}`} className="text-blue-400 hover:text-blue-300 truncate block max-w-[200px]">
                          {audit.url}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[120px]">{audit.user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${audit.overallScore && audit.overallScore >= 70 ? 'text-green-400' : audit.overallScore && audit.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {audit.overallScore ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${audit.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : audit.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {audit.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">Recent Users</h2>
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div key={user.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <p className="text-white text-xs font-medium truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400' : user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      {user.role}
                    </span>
                    {user.subscription?.plan && (
                      <span className="text-xs text-slate-500">{user.subscription.plan.name}</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
