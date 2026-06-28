import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const patchSchema = z.object({
  emailAlerts: z.boolean().optional(),
  inAppAlerts: z.boolean().optional(),
  seoAlerts: z.boolean().optional(),
  rankingAlerts: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  geoAlerts: z.boolean().optional(),
  digestFrequency: z.enum(['daily', 'weekly', 'off']).optional(),
  quietHoursStart: z.number().int().min(0).max(23).optional().nullable(),
  quietHoursEnd: z.number().int().min(0).max(23).optional().nullable(),
  quietDaysOnly: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await db.notificationSettings.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const settings = await db.notificationSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(settings);
}
