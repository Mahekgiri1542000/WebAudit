import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUserPlanTier } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import { runAudit, computeRuleBasedSuggestions, buildVerificationHash } from '@/lib/audit/orchestrator';

async function runAuditInline(auditId: string, userId: string, url: string, platformHint: string, industryHint?: string | null) {
  await db.audit.update({ where: { id: auditId }, data: { status: 'RUNNING', startedAt: new Date() } });

  try {
    const planTier = await getUserPlanTier(userId);
    const features = PLAN_FEATURES[planTier];
    const report = await runAudit(url, platformHint, industryHint ?? undefined, features.dualMalware);
    const suggestions = computeRuleBasedSuggestions(report);
    const verificationHash = buildVerificationHash(report);

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
        aiSuggestionsStatus: 'skipped',
      },
    });
    console.log(`[audit-retry] Completed ${auditId} — score: ${report.overallScore}`);
  } catch (err) {
    console.error(`[audit-retry] Failed ${auditId}:`, err);
    await db.audit.update({
      where: { id: auditId },
      data: { status: 'FAILED', errorMessage: err instanceof Error ? err.message : 'Unknown error' },
    });
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const audit = await db.audit.findUnique({ where: { id } });

  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (audit.userId !== session.user.id && session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Only retry if stuck in PENDING/FAILED
  if (audit.status === 'RUNNING') {
    return NextResponse.json({ message: 'Already running' }, { status: 200 });
  }
  if (audit.status === 'COMPLETED') {
    return NextResponse.json({ message: 'Already completed' }, { status: 200 });
  }

  // Reset to PENDING and schedule inline run
  await db.audit.update({ where: { id }, data: { status: 'PENDING', errorMessage: null } });

  after(() => runAuditInline(id, audit.userId, audit.url, String(audit.platformHint), audit.industryHint));

  return NextResponse.json({ message: 'Retrying' }, { status: 202 });
}
