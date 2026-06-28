import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/billing/stripe';
import { z } from 'zod';
import { checkoutRatelimit, applyRateLimit } from '@/lib/security/rate-limit';

const Schema = z.object({ priceId: z.string().startsWith('price_') });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limited = await applyRateLimit(req, checkoutRatelimit, session.user.id);
  if (limited) return limited;

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid priceId' }, { status: 400 });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const url = await createCheckoutSession(session.user.id, session.user.email, parsed.data.priceId, baseUrl);

  return NextResponse.json({ url });
}
