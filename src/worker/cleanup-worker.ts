import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

async function runCleanup() {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  console.log('[cleanup-worker] Starting cleanup...');

  // 1. Null out old report JSON (keep row for score history)
  const users = await db.user.findMany({ include: { subscription: { include: { plan: true } } } });
  for (const user of users) {
    const historyDays = user.subscription?.plan.historyDays ?? 7;
    const cutoff = new Date(now.getTime() - historyDays * 24 * 60 * 60 * 1000);
    await db.audit.updateMany({
      where: { userId: user.id, completedAt: { lt: cutoff } },
      data: { report: Prisma.DbNull, suggestions: Prisma.DbNull },
    });
  }

  // 2. Delete old AuditSnapshots (> 1 year)
  const { count: snapshotCount } = await db.auditSnapshot.deleteMany({
    where: { createdAt: { lt: oneYearAgo } },
  });

  // 3. Delete read notifications > 90 days
  const { count: notifCount } = await db.notification.deleteMany({
    where: { isRead: true, createdAt: { lt: ninetyDaysAgo } },
  });

  // 4. Delete SecurityLog > 90 days
  const { count: secLogCount } = await db.securityLog.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } },
  });

  // 5. Delete StripeEvent > 30 days (idempotency window)
  const { count: stripeEventCount } = await db.stripeEvent.deleteMany({
    where: { processedAt: { lt: thirtyDaysAgo } },
  });

  console.log('[cleanup-worker] Done:', {
    snapshotsDeleted: snapshotCount,
    notificationsDeleted: notifCount,
    securityLogsDeleted: secLogCount,
    stripeEventsDeleted: stripeEventCount,
  });
}

// Run at 3 AM UTC daily
function scheduleDaily() {
  const now = new Date();
  const next3am = new Date();
  next3am.setUTCHours(3, 0, 0, 0);
  if (next3am <= now) next3am.setDate(next3am.getDate() + 1);
  const delay = next3am.getTime() - now.getTime();
  setTimeout(() => {
    runCleanup().catch(console.error);
    setInterval(() => runCleanup().catch(console.error), 24 * 60 * 60 * 1000);
  }, delay);
  console.log(`[cleanup-worker] Scheduled for ${next3am.toISOString()}`);
}

scheduleDaily();
