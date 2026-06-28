import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';
import { registerRatelimit, applyRateLimit } from '@/lib/security/rate-limit';
import { sendWelcomeEmail } from '@/lib/notifications/send-email';

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, registerRatelimit);
  if (limited) return limited;
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  // Check if email already exists — return generic message to prevent enumeration
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { name, email, password: hash },
  });

  // Assign free plan
  const freePlan = await db.plan.findUnique({ where: { tier: 'FREE' } });
  if (freePlan) {
    await db.subscription.create({
      data: { userId: user.id, planId: freePlan.id, status: 'ACTIVE' },
    });
  }

  // Send welcome email (non-blocking — don't fail registration if email fails)
  sendWelcomeEmail(user.email, user.name).catch(() => {});

  return NextResponse.json({ id: user.id }, { status: 201 });
}
