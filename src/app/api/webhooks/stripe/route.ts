import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe';
import { db } from '@/lib/db';
import { getPlanByPriceId } from '@/lib/billing/plans';

export async function POST(req: NextRequest) {
  // IMPORTANT: use raw text body for signature verification
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return new NextResponse('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Idempotency — never process the same event twice
  const existing = await db.stripeEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existing) return new NextResponse('Already processed', { status: 200 });

  await db.stripeEvent.create({
    data: { stripeEventId: event.id, type: event.type },
  });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceId ? getPlanByPriceId(priceId) : null;

      if (!tier) break;

      const plan = await db.plan.findUnique({ where: { tier } });
      if (!plan) break;

      await db.subscription.upsert({
        where: { userId },
        update: {
          planId: plan.id,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: 'ACTIVE',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          auditsUsedThisPeriod: 0,
        },
        create: {
          userId,
          planId: plan.id,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: 'ACTIVE',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          auditsUsedThisPeriod: 0,
        },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const tier = priceId ? getPlanByPriceId(priceId) : null;

      const updateData: Record<string, unknown> = {
        status: sub.status.toUpperCase(),
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      };

      if (tier) {
        const plan = await db.plan.findUnique({ where: { tier } });
        if (plan) {
          updateData.planId = plan.id;
          updateData.auditsUsedThisPeriod = 0; // Reset on period renewal
        }
      }

      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: updateData as Parameters<typeof db.subscription.updateMany>[0]['data'],
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const freePlan = await db.plan.findUnique({ where: { tier: 'FREE' } });
      if (!freePlan) break;

      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          planId: freePlan.id,
          status: 'CANCELED',
          stripeSubscriptionId: null,
        },
      });
      break;
    }
  }

  return new NextResponse('OK', { status: 200 });
}
