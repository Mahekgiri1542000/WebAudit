import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SitesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const sites = await db.monitoredSite.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      keywords: { select: { id: true, keyword: true, lastPosition: true, trend: true } },
      _count: { select: { snapshots: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Monitored Sites</h1>
            <p className="text-slate-400 text-sm mt-1">{sites.length} site{sites.length !== 1 ? 's' : ''} being tracked</p>
          </div>
          <Link
            href="/dashboard/sites/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition"
          >
            + Add Site
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🌐</p>
            <p className="text-white font-semibold mb-2">No sites monitored yet</p>
            <p className="text-slate-400 text-sm mb-6">Add a site to automatically audit it on a schedule and track keyword rankings.</p>
            <Link href="/dashboard/sites/new" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition">
              Add Your First Site
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sites.map((site) => (
              <Link key={site.id} href={`/dashboard/sites/${site.id}`} className="block">
                <div className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{site.url}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {site.scanFrequency.toLowerCase()} scans · {site._count.snapshots} scan{site._count.snapshots !== 1 ? 's' : ''}
                        {site.nextScanAt && (
                          <span className="ml-2">· Next scan {new Date(site.nextScanAt).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 flex gap-2 flex-wrap justify-end">
                      {site.keywords.slice(0, 3).map((kw) => (
                        <span key={kw.id} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">
                          {kw.keyword}
                          {kw.lastPosition && (
                            <span className="ml-1 text-blue-400">#{kw.lastPosition}</span>
                          )}
                          {kw.trend === 'up' && <span className="ml-1 text-green-400">↑</span>}
                          {kw.trend === 'down' && <span className="ml-1 text-red-400">↓</span>}
                        </span>
                      ))}
                      {site.keywords.length > 3 && (
                        <span className="text-xs text-slate-600">+{site.keywords.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
