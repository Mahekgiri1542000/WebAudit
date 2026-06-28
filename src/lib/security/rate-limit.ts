import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Only initialize if Redis URL is configured
function makeRatelimit(requests: number, windowSeconds: number) {
  // @upstash/redis uses REST API — needs UPSTASH_REDIS_REST_URL + TOKEN, not REDIS_URL
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
  });
}

export const registerRatelimit = makeRatelimit(5, 3600);    // 5 per hour
export const loginRatelimit = makeRatelimit(10, 900);       // 10 per 15 min
export const auditRatelimit = makeRatelimit(30, 60);        // 30 per min (per user)
export const checkoutRatelimit = makeRatelimit(5, 3600);    // 5 per hour

export async function applyRateLimit(
  req: NextRequest,
  limiter: Ratelimit | null,
  identifier?: string,
): Promise<NextResponse | null> {
  if (!limiter) return null;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? '127.0.0.1';

  const id = identifier ?? ip;
  const { success, reset } = await limiter.limit(id);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil((reset - Date.now()) / 1000) },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      },
    );
  }

  return null;
}
