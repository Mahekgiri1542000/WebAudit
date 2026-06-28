import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getScoreColor } from '@/types/audit';
import Link from 'next/link';

export default async function AuditsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const audits = await db.audit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, url: true, status: true, overallScore: true,
      onPageScore: true, geoScore: true, pageSpeedScore: true, securityScore: true,
      detectedCms: true, createdAt: true, completedAt: true, aiSuggestionsStatus: true,
    },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Audits</h1>
          <p className="text-slate-400 text-sm mt-1">{audits.length} audit{audits.length !== 1 ? 's' : ''} total</p>
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

      {audits.length === 0 ? (
        <div className="bg-[#0d1526] border border-dashed border-slate-700 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-white font-semibold mb-2">No audits yet</p>
          <p className="text-slate-400 text-sm mb-6">Run your first audit to get started.</p>
          <Link href="/dashboard/audits/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition inline-block">
            Run Free Audit →
          </Link>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-slate-800/70 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/70">
                <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-5 py-3">Website</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3">Score</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden sm:table-cell">SEO</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden md:table-cell">Speed</th>
                <th className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden md:table-cell">Security</th>
                <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-3 py-3 hidden lg:table-cell">Status</th>
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
                        <p className="text-white text-sm font-medium truncate max-w-[220px]">
                          {(() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })()}
                        </p>
                        {audit.detectedCms && <span className="text-blue-400 text-xs">{audit.detectedCms}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    {audit.overallScore !== null
                      ? <span className={`text-lg font-bold ${getScoreColor(audit.overallScore)}`}>{audit.overallScore}</span>
                      : <span className="text-slate-600 text-sm">—</span>
                    }
                  </td>
                  <td className="px-3 py-4 text-center hidden sm:table-cell">
                    {audit.onPageScore !== null
                      ? <span className={`text-sm font-semibold ${getScoreColor(audit.onPageScore)}`}>{audit.onPageScore}</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                  <td className="px-3 py-4 text-center hidden md:table-cell">
                    {audit.pageSpeedScore !== null
                      ? <span className={`text-sm font-semibold ${getScoreColor(audit.pageSpeedScore)}`}>{audit.pageSpeedScore}</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                  <td className="px-3 py-4 text-center hidden md:table-cell">
                    {audit.securityScore !== null
                      ? <span className={`text-sm font-semibold ${getScoreColor(audit.securityScore)}`}>{audit.securityScore}</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                  <td className="px-3 py-4 hidden lg:table-cell">
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
                      className="text-xs text-slate-500 group-hover:text-blue-400 transition font-medium whitespace-nowrap"
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
    </div>
  );
}
