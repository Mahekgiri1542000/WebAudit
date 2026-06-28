import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const TYPE_ICONS: Record<string, string> = {
  SCORE_DROP: '📉',
  MALWARE_DETECTED: '🦠',
  AUDIT_COMPLETE: '✅',
  RANKING_CHANGE: '📊',
  DIGEST: '📋',
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

  // Mark all as read server-side
  if (unreadIds.length > 0) {
    await db.notification.updateMany({
      where: { id: { in: unreadIds } },
      data: { isRead: true },
    });
  }

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 text-sm mt-1">{notifications.length} total</p>
          </div>
          <Link href="/dashboard/settings/notifications" className="text-xs text-slate-400 hover:text-slate-300">
            ⚙ Settings
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔔</p>
            <p className="text-white font-semibold mb-2">No notifications yet</p>
            <p className="text-slate-400 text-sm">Alerts will appear here when audits complete, scores drop, or malware is detected.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl border ${unreadIds.includes(n.id) ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800 bg-slate-900'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                    <p className="text-slate-600 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
