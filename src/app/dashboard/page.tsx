import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUsageSummary } from '@/lib/billing/usage';
import { getScoreColor } from '@/types/audit';
import Link from 'next/link';
import { redirect } from 'next/navigation';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0d1526] border border-slate-800/70 rounded-2xl p-5">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [audits, sites, usage] = await Promise.all([
    db.audit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, url: true, status: true, overallScore: true,
        onPageScore: true, geoScore: true, aeoScore: true,
        detectedCms: true, createdAt: true, aiSuggestionsStatus: true,
        completedAt: true,
      },
    }),
    db.monitoredSite.count({ where: { userId: session.user.id, isActive: true } }),
    getUsageSummary(session.user.id),
  ]);

  const completed = audits.filter((a) => a.status === 'COMPLETED');
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / completed.length)
    : null;

  const firstName = session.user.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {firstName} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening with your websites.</p>
        </div>
        <Link
          href="/dashboard/audits/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path d="M12 4v16m8-8H4" />
          </svg>
          New Audit
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Audits"
          value={audits.length}
          sub={`${completed.length} completed`}
        />
        <StatCard
          label="Avg Score"
          value={avgScore ?? '—'}
          sub="across all completed audits"
          color={avgScore !== null ? getScoreColor(avgScore) : 'text-slate-500'}
        />
        <StatCard
          label="Sites Monitored"
          value={sites}
          sub={sites === 0 ? 'Add a site to track' : 'actively tracked'}
        />
        <StatCard
          label="Audits Remaining"
          value={usage.isUnlimited ? '∞' : usage.auditsRemaining}
          sub={usage.isUnlimited ? 'Unlimited plan' : `${usage.auditsUsed} used this month`}
          color={!usage.isUnlimited && usage.auditsRemaining === 0 ? 'text-red-400' : undefined}
        />
      </div>

      {/* Plan progress bar */}
      {!usage.isUnlimited && (
        <div className="bg-[#0d1526] border border-slate-800/70 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-medium text-sm">{usage.planName} Plan</span>
              <span className="text-slate-500 text-sm ml-2">— {usage.auditsUsed}/{usage.auditsLimit} audits used this month</span>
            </div>
            {usage.planTier === 'FREE' && (
              <Link href="/dashboard/billing" className="text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg transition font-medium">
                Upgrade Plan →
              </Link>
            )}
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (usage.auditsUsed / usage.auditsLimit) >= 0.9 ? 'bg-red-500' :
                (usage.auditsUsed / usage.auditsLimit) >= 0.7 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.round((usage.auditsUsed / usage.auditsLimit) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Audits list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Audits</h2>
        <Link href="/dashboard/audits" className="text-blue-400 text-sm hover:text-blue-300 transition">
          View all →
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="bg-[#0d1526] border border-dashed border-slate-700 rounded-2xl py-16 text-center">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-2">Run your first audit</p>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Get a full SEO, AI visibility, PageSpeed, and security report in ~60 seconds.
          </p>
          <Link
            href="/dashboard/audits/new"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition"
          >
            Run Free Audit →
          </Link>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-slate-800/70 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/70">
                <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-5 py-3">Website</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden sm:table-cell">Score</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden md:table-cell">SEO</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden lg:table-cell">GEO</th>
                <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden md:table-cell">Status</th>
                <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden lg:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-800/20 transition group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">
                        {(() => { try { return new URL(audit.url).hostname[0].toUpperCase(); } catch { return '?'; } })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[200px]">
                          {(() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })()}
                        </p>
                        {audit.detectedCms && (
                          <span className="text-blue-400 text-xs">{audit.detectedCms}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center hidden sm:table-cell">
                    {audit.overallScore !== null ? (
                      <span className={`text-lg font-bold ${getScoreColor(audit.overallScore)}`}>{audit.overallScore}</span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center hidden md:table-cell">
                    {audit.onPageScore !== null ? (
                      <span className={`text-sm font-semibold ${getScoreColor(audit.onPageScore)}`}>{audit.onPageScore}</span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center hidden lg:table-cell">
                    {audit.geoScore !== null ? (
                      <span className={`text-sm font-semibold ${getScoreColor(audit.geoScore)}`}>{audit.geoScore}</span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-3 py-4 hidden md:table-cell">
                    {audit.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Done
                      </span>
                    )}
                    {(audit.status === 'PENDING' || audit.status === 'RUNNING') && (
                      <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />Running
                      </span>
                    )}
                    {audit.status === 'FAILED' && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Failed
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 hidden lg:table-cell">
                    <span className="text-slate-500 text-xs">{new Date(audit.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/dashboard/audits/${audit.id}`}
                      className="text-xs text-slate-500 group-hover:text-blue-400 transition font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions */}
      {audits.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { href: '/dashboard/audits/new', icon: '🔍', title: 'New Audit', desc: 'Audit any website in 60s' },
            { href: '/dashboard/sites/new', icon: '🌐', title: 'Monitor a Site', desc: 'Auto-scan on a schedule' },
            { href: '/dashboard/billing', icon: '⚡', title: 'Upgrade Plan', desc: 'More audits + AI suggestions' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 bg-[#0d1526] border border-slate-800/70 hover:border-blue-500/40 rounded-xl transition group">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-white text-sm font-medium group-hover:text-blue-400 transition">{item.title}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
