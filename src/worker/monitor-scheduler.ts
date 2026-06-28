import { db } from '@/lib/db';
import { enqueueAudit } from '@/lib/queue';
import { getUserPlanTier } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import crypto from 'crypto';

async function runScheduler() {
  console.log('[monitor-scheduler] Checking for due sites...');

  const dueSites = await db.monitoredSite.findMany({
    where: {
      isActive: true,
      nextScanAt: { lte: new Date() },
    },
    include: {
      user: { select: { id: true, email: true } },
      keywords: true,
    },
  });

  console.log(`[monitor-scheduler] Found ${dueSites.length} sites due for scan`);

  for (const site of dueSites) {
    try {
      const planTier = await getUserPlanTier(site.userId);
      const features = PLAN_FEATURES[planTier];

      // Create new audit record
      const audit = await db.audit.create({
        data: {
          userId: site.userId,
          url: site.url,
          platformHint: site.platformHint,
          status: 'PENDING',
          certificateId: crypto.randomUUID(),
          shareToken: crypto.randomUUID(),
        },
      });

      await enqueueAudit({
        auditId: audit.id,
        userId: site.userId,
        url: site.url,
        platformHint: site.platformHint,
      });

      // Calculate next scan time
      const nextScanOffset = {
        DAILY: 24 * 60 * 60 * 1000,
        WEEKLY: 7 * 24 * 60 * 60 * 1000,
        MONTHLY: 30 * 24 * 60 * 60 * 1000,
      };

      const offset = nextScanOffset[site.scanFrequency] ?? nextScanOffset.WEEKLY;

      await db.monitoredSite.update({
        where: { id: site.id },
        data: { nextScanAt: new Date(Date.now() + offset) },
      });

      console.log(`[monitor-scheduler] Enqueued audit for ${site.url}, next scan in ${site.scanFrequency}`);

      // Rank keywords if plan allows
      if (features.rankingTracker && site.keywords.length > 0) {
        const { checkRanking, computeVolatility } = await import('@/lib/audit/ranking-advanced');

        for (const keyword of site.keywords) {
          try {
            const result = await checkRanking(
              keyword.keyword,
              new URL(site.url).hostname,
              keyword.country,
              keyword.language,
              keyword.device as 'desktop' | 'mobile'
            );

            // Save snapshot
            await db.keywordSnapshot.create({
              data: {
                keywordId: keyword.id,
                position: result.position,
                serpFeatures: result.serpFeatures as unknown as Parameters<typeof db.keywordSnapshot.create>[0]['data']['serpFeatures'],
                checkedAt: result.checkedAt,
              },
            });

            // Get history for volatility calculation
            const history = await db.keywordSnapshot.findMany({
              where: { keywordId: keyword.id },
              orderBy: { checkedAt: 'desc' },
              take: 7,
              select: { position: true },
            });

            const positions = history.map((h) => h.position);
            const { volatility, trend, avg } = computeVolatility(positions);

            await db.keyword.update({
              where: { id: keyword.id },
              data: {
                previousPosition: keyword.lastPosition,
                lastPosition: result.position,
                hasFeaturedSnippet: result.serpFeatures.featuredSnippet.present,
                ownsFeaturedSnippet: result.serpFeatures.featuredSnippet.ownedBySite,
                inAIOverview: result.serpFeatures.aiOverview.ownedBySite,
                inLocalPack: result.serpFeatures.localPack.businessListed,
                serpFeatures: result.serpFeatures as unknown as Parameters<typeof db.keyword.update>[0]['data']['serpFeatures'],
                volatility,
                trend,
                avgPosition: avg,
                lastCheckedAt: result.checkedAt,
              },
            });
          } catch (err) {
            console.error(`[monitor-scheduler] Failed to check keyword "${keyword.keyword}":`, err);
          }
        }
      }
    } catch (err) {
      console.error(`[monitor-scheduler] Failed to process site ${site.url}:`, err);
    }
  }

  console.log('[monitor-scheduler] Scheduler run complete');
}

// Run immediately, then every 30 minutes
runScheduler().catch(console.error);
setInterval(() => runScheduler().catch(console.error), 30 * 60 * 1000);
