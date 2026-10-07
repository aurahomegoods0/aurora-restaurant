import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  /** Maximum requests allowed per window */
  max: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export const RESERVATION_RATE_LIMIT: RateLimitConfig = {
  max: 3,
  windowSeconds: 60,
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const upstashLimiter =
  upstashUrl && upstashToken
    ? new Ratelimit({
        redis: new Redis({ url: upstashUrl, token: upstashToken }),
        limiter: Ratelimit.slidingWindow(
          RESERVATION_RATE_LIMIT.max,
          `${RESERVATION_RATE_LIMIT.windowSeconds} s`,
        ),
        prefix: 'aurora:reservation',
      })
    : null;

/**
 * In-memory sliding-window fallback. State lives in a single server instance,
 * so on serverless / multi-instance deployments it is only best-effort;
 * configure Upstash for a limit that is shared across instances.
 */
const memoryHits = new Map<string, number[]>();
const SWEEP_THRESHOLD = 1000;

const limitInMemory = (
  identifier: string,
  { max, windowSeconds }: RateLimitConfig,
): RateLimitResult => {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (memoryHits.size > SWEEP_THRESHOLD) {
    for (const [key, hits] of memoryHits) {
      if (hits[hits.length - 1] <= now - windowMs) memoryHits.delete(key);
    }
  }

  const recent = (memoryHits.get(identifier) ?? []).filter(
    (timestamp) => timestamp > now - windowMs,
  );

  if (recent.length >= max) {
    memoryHits.set(identifier, recent);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((recent[0] + windowMs - now) / 1000),
      ),
    };
  }

  recent.push(now);
  memoryHits.set(identifier, recent);
  return { allowed: true, retryAfterSeconds: 0 };
};

/**
 * Limits `identifier` (usually a client IP) to RESERVATION_RATE_LIMIT.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL / _TOKEN are set, and falls
 * back to the in-memory limiter when they are missing or Redis is unreachable.
 */
export const checkRateLimit = async (
  identifier: string,
): Promise<RateLimitResult> => {
  if (upstashLimiter) {
    try {
      const { success, reset } = await upstashLimiter.limit(identifier);
      return {
        allowed: success,
        retryAfterSeconds: success
          ? 0
          : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
      };
    } catch (error) {
      console.error('[rate-limit] Upstash unavailable, using memory', error);
    }
  }

  return limitInMemory(identifier, RESERVATION_RATE_LIMIT);
};
