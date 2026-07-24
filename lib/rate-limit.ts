/**
 * PROVIDER RATE LIMITER
 *
 * WARNING: Known limitation — this in-memory rate limiter does NOT work
 * reliably on Vercel serverless. Each invocation gets a fresh instance,
 * so the Map is empty every time. Rate limiting is best-effort only.
 *
 * For production-grade rate limiting, use:
 * - @upstash/ratelimit (Redis-backed, works across invocations)
 * - Vercel KV (native Vercel integration)
 * - Edge Config (for distributed rate limiting)
 *
 * Migration to @upstash/ratelimit is a post-launch TODO.
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 30;

export function rateLimit(identifier: string, maxRequests: number = RATE_LIMIT_MAX): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > RATE_LIMIT_WINDOW * 2) {
        rateLimitMap.delete(key);
      }
    }
  }, RATE_LIMIT_WINDOW).unref?.();
}
