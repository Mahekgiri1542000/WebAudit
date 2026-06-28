import { db } from '@/lib/db';
import { PlanTier } from '@prisma/client';

export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

export async function assertAuditAllowed(userId: string): Promise<void> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  const limit = sub?.plan.auditsPerMonth ?? 3;
  const used = sub?.auditsUsedThisPeriod ?? 0;

  if (limit !== -1 && used >= limit) {
    throw new PlanLimitError(
      `Audit limit reached (${used}/${limit} this month). Upgrade your plan to continue.`
    );
  }
}

export async function incrementAuditUsage(userId: string): Promise<void> {
  await db.subscription.updateMany({
    where: { userId },
    data: { auditsUsedThisPeriod: { increment: 1 } },
  });
}

export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  return sub?.plan.tier ?? 'FREE';
}

export async function getUsageSummary(userId: string) {
  const sub = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  const plan = sub?.plan;
  const used = sub?.auditsUsedThisPeriod ?? 0;
  const limit = plan?.auditsPerMonth ?? 3;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

  return {
    planName: plan?.name ?? 'Free',
    planTier: plan?.tier ?? ('FREE' as PlanTier),
    auditsUsed: used,
    auditsLimit: limit,
    auditsRemaining: remaining,
    isUnlimited: limit === -1,
    periodEnd: sub?.currentPeriodEnd ?? null,
    features: {
      emailAlerts: plan?.emailAlerts ?? false,
      rankingTracker: plan?.rankingTracker ?? false,
      aiSuggestions: plan?.aiSuggestions ?? false,
      shareableReport: plan?.shareableReport ?? false,
      dualMalware: plan?.dualMalware ?? false,
    },
  };
}

export async function resetMonthlyUsage(userId: string): Promise<void> {
  await db.subscription.updateMany({
    where: { userId },
    data: { auditsUsedThisPeriod: 0 },
  });
}
