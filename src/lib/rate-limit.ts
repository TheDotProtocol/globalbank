import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private config: RateLimitConfig) {}

  get message() {
    return this.config.message;
  }
  get max() {
    return this.config.max;
  }
  get windowMs() {
    return this.config.windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return false;
    }

    if (record.count >= this.config.max) {
      return true;
    }

    record.count++;
    return false;
  }

  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.config.max;
    return Math.max(0, this.config.max - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || Date.now() + this.config.windowMs;
  }
}

// Create rate limiters for different endpoints
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts'
});

export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many API requests'
});

export const cardGenerationLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 card generations per hour
  message: 'Too many card generation attempts'
});

export function withRateLimit(
  limiter: RateLimiter,
  getIdentifier: (request: NextRequest) => string
) {
  return function rateLimitMiddleware(handler: Function) {
    return async function (request: NextRequest) {
      const identifier = getIdentifier(request);
      
      if (limiter.isRateLimited(identifier)) {
        return NextResponse.json(
          {
            error: limiter.message || 'Rate limit exceeded',
            retryAfter: Math.ceil((limiter.getResetTime(identifier) - Date.now()) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limiter.max.toString(),
              'X-RateLimit-Remaining': limiter.getRemaining(identifier).toString(),
              'X-RateLimit-Reset': limiter.getResetTime(identifier).toString(),
              'Retry-After': Math.ceil((limiter.getResetTime(identifier) - Date.now()) / 1000).toString()
            }
          }
        );
      }

      return handler(request);
    };
  };
} 