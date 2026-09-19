import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  try {
    const result = await Promise.race([
      (async () => {
        const current = await db.rateLimitBucket.findUnique({ where: { key } });
        if (!current || current.resetAt <= now) {
          await db.rateLimitBucket.upsert({ where: { key }, create: { key, count: 1, resetAt }, update: { count: 1, resetAt } });
          return { allowed: true, remaining: limit - 1, resetAt };
        }
        if (current.count >= limit) return { allowed: false, remaining: 0, resetAt: current.resetAt };
        const updated = await db.rateLimitBucket.updateMany({ where: { key, count: current.count }, data: { count: { increment: 1 } } });
        if (updated.count === 0) return { allowed: false, remaining: 0, resetAt: current.resetAt };
        return { allowed: true, remaining: Math.max(0, limit - current.count - 1), resetAt: current.resetAt };
      })(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("rate limit database timeout")), 3000)),
    ]);
    return result;
  } catch (error) {
    logger.warn("Rate limiter unavailable; allowing request", { key, error: error instanceof Error ? error.message : String(error) });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
}

export function limitedResponse(resetAt: Date) {
  return new Response(JSON.stringify({ error: "Too many requests. Try again later." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)) },
  });
}