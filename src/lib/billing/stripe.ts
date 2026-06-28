import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  let customerId: string | undefined;

  const { db } = await import('@/lib/db');
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });
  customerId = sub?.stripeCustomerId ?? undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    customer_email: customerId ? undefined : userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}/dashboard/billing?success=1`,
    cancel_url: `${returnUrl}/pricing?canceled=1`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    allow_promotion_codes: true,
  });

  return session.url!;
}

export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${returnUrl}/dashboard/billing`,
  });
  return session.url;
}
