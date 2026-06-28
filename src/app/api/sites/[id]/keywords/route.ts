import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import { getUserPlanTier } from '@/lib/billing/usage';

const createSchema = z.object({
  keyword: z.string().min(1).max(200),
  country: z.string().length(2).default('US'),
  language: z.string().default('en'),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const site = await db.monitoredSite.findUnique({
    where: { id },
    include: { keywords: { select: { id: true } } },
  });
  if (!site || site.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const planTier = await getUserPlanTier(session.user.id);
  const limit = PLAN_FEATURES[planTier].keywordsPerSite;
  if (limit !== -1 && site.keywords.length >= limit) {
    return NextResponse.json({ error: `Keyword limit (${limit}) reached for your plan`, code: 'PLAN_LIMIT' }, { status: 402 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const keyword = await db.keyword.create({
    data: {
      monitoredSiteId: id,
      keyword: parsed.data.keyword,
      country: parsed.data.country.toLowerCase(),
      language: parsed.data.language,
      device: parsed.data.device,
    },
  });

  return NextResponse.json(keyword, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { keywordId } = await req.json();
  if (!keywordId) return NextResponse.json({ error: 'keywordId required' }, { status: 400 });

  const keyword = await db.keyword.findUnique({
    where: { id: keywordId },
    include: { monitoredSite: { select: { userId: true } } },
  });

  if (!keyword || keyword.monitoredSiteId !== id || keyword.monitoredSite.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.keyword.delete({ where: { id: keywordId } });
  return NextResponse.json({ success: true });
}
