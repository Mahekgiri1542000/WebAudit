import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUsageSummary } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import { z } from 'zod';

const CreateSiteSchema = z.object({
  url: z.string().url().max(2048),
  name: z.string().max(100).optional(),
  platformHint: z.string().optional(),
  scanFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sites = await db.monitoredSite.findMany({
    where: { userId: session.user.id, isActive: true },
    include: { keywords: { take: 5 } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSiteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // Check plan site limit
  const usage = await getUsageSummary(session.user.id);
  const planFeatures = PLAN_FEATURES[usage.planTier];
  const currentCount = await db.monitoredSite.count({
    where: { userId: session.user.id, isActive: true },
  });

  if (planFeatures.monitoredSites !== -1 && currentCount >= planFeatures.monitoredSites) {
    return NextResponse.json(
      { error: `Plan limit reached: ${planFeatures.monitoredSites} monitored sites max. Upgrade to add more.`, code: 'PLAN_LIMIT' },
      { status: 402 }
    );
  }

  const site = await db.monitoredSite.create({
    data: {
      userId: session.user.id,
      url: parsed.data.url,
      name: parsed.data.name,
      platformHint: (parsed.data.platformHint ?? 'AUTO') as Parameters<typeof db.monitoredSite.create>[0]['data']['platformHint'],
      scanFrequency: (parsed.data.scanFrequency ?? 'WEEKLY') as Parameters<typeof db.monitoredSite.create>[0]['data']['scanFrequency'],
      nextScanAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
  });

  return NextResponse.json(site, { status: 201 });
}
