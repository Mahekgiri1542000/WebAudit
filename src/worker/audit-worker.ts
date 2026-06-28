import { Worker } from 'bullmq';
import { connection, AUDIT_QUEUE, type AuditJobPayload } from '@/lib/queue';
import { db } from '@/lib/db';
import { runAudit, computeRuleBasedSuggestions, buildVerificationHash } from '@/lib/audit/orchestrator';
import { getUserPlanTier } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';

const worker = new Worker<AuditJobPayload>(
  AUDIT_QUEUE,
  async (job) => {
    const { auditId, userId, url, platformHint, industryHint } = job.data;

    console.log(`[audit-worker] Starting audit ${auditId} for ${url}`);

    // Mark as running
    await db.audit.update({
      where: { id: auditId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      // Check if user has dual malware enabled
      const planTier = await getUserPlanTier(userId);
      const features = PLAN_FEATURES[planTier];

      // Progress updates via job progress (visible in BullMQ dashboard)
      const onProgress = (p: { step: string; status: string }) => {
        console.log(`[audit-worker] ${auditId}: ${p.step} — ${p.status}`);
        job.updateProgress({ step: p.step, status: p.status });
      };

      const report = await runAudit(url, platformHint, industryHint, features.dualMalware, onProgress);

      // Generate rule-based suggestions
      const suggestions = computeRuleBasedSuggestions(report);

      // Build verification hash for certificate
      const verificationHash = buildVerificationHash(report);

      // Save completed audit
      await db.audit.update({
        where: { id: auditId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          report: report as unknown as Parameters<typeof db.audit.update>[0]['data']['report'],
          suggestions: suggestions as unknown as Parameters<typeof db.audit.update>[0]['data']['suggestions'],
          detectedCms: report.detectedCms,
          overallScore: report.overallScore,
          onPageScore: report.onPageScore,
          offPageScore: report.offPageScore,
          geoScore: report.geoScore,
          aeoScore: report.aeoScore,
          worldwideSeoScore: report.worldwideSeoScore,
          pageSpeedScore: report.pageSpeedScore,
          securityScore: report.securityScore,
          confidenceScore: report.confidence.confidenceScore,
          verificationHash,
          aiSuggestionsStatus: features.aiSuggestions ? 'pending' : 'skipped',
        },
      });

      // If this is from a monitored site, create an AuditSnapshot
      const monitoredSite = await db.monitoredSite.findFirst({
        where: { userId, url, isActive: true },
      });

      if (monitoredSite) {
        await db.auditSnapshot.create({
          data: {
            monitoredSiteId: monitoredSite.id,
            auditId,
            onPageScore: report.onPageScore,
            offPageScore: report.offPageScore,
            geoScore: report.geoScore,
            aeoScore: report.aeoScore,
            worldwideSeoScore: report.worldwideSeoScore,
            overallScore: report.overallScore,
            pageSpeedMobile: report.pagespeed?.mobile?.score,
            malwareStatus: report.malware?.status,
          },
        });

        await db.monitoredSite.update({
          where: { id: monitoredSite.id },
          data: { lastAuditId: auditId },
        });
      }

      console.log(`[audit-worker] Completed audit ${auditId} — score: ${report.overallScore}`);
    } catch (err) {
      console.error(`[audit-worker] Failed audit ${auditId}:`, err);

      await db.audit.update({
        where: { id: auditId },
        data: {
          status: 'FAILED',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      });

      throw err; // BullMQ will retry
    }
  },
  {
    connection: connection!,
    concurrency: 3,
  }
);

worker.on('completed', (job) => {
  console.log(`[audit-worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[audit-worker] Job ${job?.id} failed:`, err.message);
});

console.log('[audit-worker] Worker started, listening for audit jobs...');
