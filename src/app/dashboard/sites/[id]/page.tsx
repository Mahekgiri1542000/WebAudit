import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getScoreColor } from '@/types/audit';
import AddKeywordButton from '@/components/dashboard/AddKeywordButton';

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const site = await db.monitoredSite.findUnique({
    where: { id },
    include: {
      keywords: {
        include: { rankingHistory: { orderBy: { checkedAt: 'desc' }, take: 7 } },
        orderBy: { createdAt: 'asc' },
      },
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, auditId: true, overallScore: true, createdAt: true, malwareStatus: true },
      },
    },
  });

  if (!site || site.userId !== session.user.id) notFound();

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/sites" className="text-slate-500 text-sm hover:text-slate-300">← Sites</Link>
          <div className="flex items-start justify-between mt-3 gap-4">
            <div>
              <h1 className="text-xl font-bold text-white truncate">{site.url}</h1>
              <p className="text-slate-500 text-xs mt-1">
                {site.scanFrequency.toLowerCase()} scans
                {site.nextScanAt && ` · next scan ${new Date(site.nextScanAt).toLocaleDateString()}`}
              </p>
            </div>
            <Link
              href={`/dashboard/audits/new?url=${encodeURIComponent(site.url)}`}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shrink-0"
            >
              Run Audit
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Audit History via snapshots */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-3">Audit History</h2>
            {site.snapshots.length === 0 ? (
              <p className="text-slate-500 text-sm">No audits yet</p>
            ) : (
              <div className="space-y-2">
                {site.snapshots.map((snap) => (
                  <Link key={snap.id} href={`/dashboard/audits/${snap.auditId}`} className="block">
                    <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition">
                      <span className={`text-lg font-bold ${getScoreColor(snap.overallScore ?? 0)}`}>
                        {snap.overallScore ?? '—'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">{new Date(snap.createdAt).toLocaleDateString()}</p>
                        {snap.malwareStatus && (
                          <p className={`text-xs ${snap.malwareStatus === 'clean' ? 'text-green-400' : 'text-red-400'}`}>
                            {snap.malwareStatus}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Keywords */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Keyword Rankings</h2>
              <AddKeywordButton siteId={id} />
            </div>

            {site.keywords.length === 0 ? (
              <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-slate-500 text-sm">No keywords tracked yet</p>
                <p className="text-slate-600 text-xs mt-1">Add keywords to track SERP positions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {site.keywords.map((kw) => {
                  const positions = kw.rankingHistory.map((s) => s.position).reverse();
                  return (
                    <div key={kw.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{kw.keyword}</p>
                          <p className="text-slate-600 text-xs">{kw.country.toUpperCase()} · {kw.device}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl font-bold ${kw.lastPosition ? 'text-blue-400' : 'text-slate-600'}`}>
                            {kw.lastPosition ? `#${kw.lastPosition}` : '—'}
                          </p>
                          <p className={`text-xs ${kw.trend === 'up' ? 'text-green-400' : kw.trend === 'down' ? 'text-red-400' : 'text-slate-600'}`}>
                            {kw.trend === 'up' ? '↑ Rising' : kw.trend === 'down' ? '↓ Falling' : '→ Stable'}
                          </p>
                        </div>
                      </div>

                      {/* Position sparkline */}
                      {positions.length > 1 && (
                        <div className="mt-3 flex items-end gap-1 h-8">
                          {positions.map((pos, i) => {
                            const height = pos === null ? 4 : Math.max(4, Math.min(32, Math.round(32 - (pos / 100) * 28)));
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-sm ${pos === null ? 'bg-slate-800' : 'bg-blue-500/60'}`}
                                style={{ height: `${height}px` }}
                                title={pos ? `#${pos}` : 'Not ranked'}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* SERP Features */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {kw.hasFeaturedSnippet && <span className="text-xs px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">Featured Snippet</span>}
                        {kw.inAIOverview && <span className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">AI Overview</span>}
                        {kw.inLocalPack && <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded">Local Pack</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
