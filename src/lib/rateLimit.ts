/**
 * Simple in-memory rate limiter for LLM endpoints.
 * Limits requests per user per window.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 per minute

/**
 * Check rate limit for a user. Returns { allowed, remaining, retryAfterMs }.
 */
export function checkRateLimit(userId: string): {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
} {
    const now = Date.now();
    const key = `llm:${userId}`;
    const entry = store.get(key);

    // Clean expired entries periodically
    if (store.size > 1000) {
        for (const [k, v] of store.entries()) {
            if (v.resetAt < now) store.delete(k);
        }
    }

    if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfterMs: 0 };
    }

    if (entry.count >= MAX_REQUESTS) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: entry.resetAt - now,
        };
    }

    entry.count++;
    return { allowed: true, remaining: MAX_REQUESTS - entry.count, retryAfterMs: 0 };
}
