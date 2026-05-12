import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

/**
 * Shared publisher/command client. Do not use for SUBSCRIBE / blocking ops.
 */
export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
  }
  return globalForRedis.redis;
}

export function userEventsChannel(userId: number): string {
  return `app:user:${userId}:events`;
}

export async function publishUserEvent(userId: number, payload: Record<string, unknown>): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const body = JSON.stringify({ ...payload, userId, at: new Date().toISOString() });
  await redis.publish(userEventsChannel(userId), body);
}

export const taskCacheKeys = {
  list: (userId: number) => `cache:tasks:list:${userId}`,
  analytics: (userId: number) => `cache:tasks:analytics:${userId}`
};

export async function invalidateTaskCaches(userId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(taskCacheKeys.list(userId), taskCacheKeys.analytics(userId));
}
