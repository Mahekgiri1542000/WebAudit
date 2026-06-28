import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertAuditAllowed, incrementAuditUsage, getUserPlanTier } from '@/lib/billing/usage';
import { PlanLimitError } from '@/lib/billing/usage';
import { enqueueAudit, enqueueAISuggestions, REDIS_AVAILABLE } from '@/lib/queue';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import { runAudit, computeRuleBasedSuggestions, buildVerificationHash } from '@/lib/audit/orchestrator';
import { z } from 'zod';
import crypto from 'crypto';
import { auditRatelimit, applyRateLimit } from '@/lib/security/rate-limit';
import { sendAuditCompleteEmail } from '@/lib/notifications/send-email';

const CreateAuditSchema = z.object({
  url: z.string().url().max(2048),
  platformHint: z.string().optional(),
  industryHint: z.string().max(100).optional(),
});

// Run audit inline (used when Redis worker is not available)
async function runAuditInline(auditId: string, userId: string, url: string, platformHint: string, industryHint?: string) {
  await db.audit.update({ where: { id: auditId }, data: { status: 'RUNNING', startedAt: new Date() } });

  try {
    const planTier = await getUserPlanTier(userId);
    const features = PLAN_FEATURES[planTier];

    const report = await runAudit(url, platformHint, industryHint, features.dualMalware);
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

    // Link to monitored site snapshot if applicable
    const monitoredSite = await db.monitoredSite.findFirst({ where: { userId, url, isActive: true } });
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
      await db.monitoredSite.update({ where: { id: monitoredSite.id }, data: { lastAuditId: auditId } });
    }

    console.log(`[audit-inline] Completed ${auditId} — score: ${report.overallScore}`);

    // Send audit complete email (non-blocking)
    const userRecord = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (userRecord?.email) {
      sendAuditCompleteEmail(
        userRecord.email,
        url,
        report.overallScore ?? 0,
        { seo: report.onPageScore ?? null, speed: report.pageSpeedScore ?? null, security: report.securityScore ?? null, geo: report.geoScore ?? null },
        auditId,
      ).catch(() => {});
    }
  } catch (err) {
    console.error(`[audit-inline] Failed ${auditId}:`, err);
    await db.audit.update({
      where: { id: auditId },
      data: { status: 'FAILED', errorMessage: err instanceof Error ? err.message : 'Unknown error' },
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limited = await applyRateLimit(req, auditRatelimit, session.user.id);
  if (limited) return limited;

  const body = await req.json();
  const parsed = CreateAuditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { url, platformHint = 'AUTO', industryHint } = parsed.data;
  const userId = session.user.id;

  // Server-side plan limit enforcement
  try {
    await assertAuditAllowed(userId);
  } catch (err) {
    if (err instanceof PlanLimitError) {
      return NextResponse.json({ error: err.message, code: 'PLAN_LIMIT' }, { status: 402 });
    }
    throw err;
  }

  // Verify email — always re-check DB, not the stale JWT value
  const freshUser = await db.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
  if (!freshUser?.emailVerified) {
    return NextResponse.json(
      { error: 'Please verify your email before running an audit', code: 'EMAIL_UNVERIFIED' },
      { status: 403 }
    );
  }

  // Create audit record
  const audit = await db.audit.create({
    data: {
      userId,
      url,
      platformHint: platformHint as Parameters<typeof db.audit.create>[0]['data']['platformHint'],
      industryHint,
      status: 'PENDING',
      certificateId: crypto.randomUUID(),
      shareToken: crypto.randomUUID(),
    },
  });

  // Increment usage counter
  await incrementAuditUsage(userId);

  if (REDIS_AVAILABLE) {
    // Enqueue to BullMQ worker
    try {
      await enqueueAudit({ auditId: audit.id, userId, url, platformHint, industryHint });
      const planTier = await getUserPlanTier(userId);
      if (PLAN_FEATURES[planTier].aiSuggestions) {
        await enqueueAISuggestions({ auditId: audit.id, userId });
      }
    } catch (err) {
      console.warn('[audits] Redis enqueue failed:', err instanceof Error ? err.message : err);
      // Fall through to inline execution below
      after(() => runAuditInline(audit.id, userId, url, platformHint, industryHint));
    }
  } else {
    // No Redis — run audit inline after response is sent
    after(() => runAuditInline(audit.id, userId, url, platformHint, industryHint));
  }

  return NextResponse.json(
    { auditId: audit.id, status: 'PENDING' },
    { status: 202 }
  );
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = 10;

  const where = session.user.role === 'CUSTOMER'
    ? { userId: session.user.id }
    : {}; // admins see all

  const [audits, total] = await Promise.all([
    db.audit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: page * limit,
      select: {
        id: true,
        url: true,
        status: true,
        overallScore: true,
        onPageScore: true,
        geoScore: true,
        aeoScore: true,
        detectedCms: true,
        createdAt: true,
        completedAt: true,
        aiSuggestionsStatus: true,
      },
    }),
    db.audit.count({ where }),
  ]);

  return NextResponse.json({ audits, total, page, pages: Math.ceil(total / limit) });
}
