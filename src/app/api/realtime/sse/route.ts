import { cookies } from "next/headers";
import Redis from "ioredis";

import { getSessionCookieName, verifySession } from "@/lib/auth";
import { userEventsChannel } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream: subscribes to Redis channel for the signed-in user.
 * Demonstrates pub/sub consumption in Next (Redis PUBLISH from API/server actions).
 */
export async function GET() {
  const token = (await cookies()).get(getSessionCookieName())?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  let userId: number;
  try {
    const session = verifySession(token);
    userId = session.userId;
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return new Response("Redis not configured (set REDIS_URL)", { status: 503 });

  const channel = userEventsChannel(userId);
  const encoder = new TextEncoder();
  const sub = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: string) => {
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      send(JSON.stringify({ type: "sse.connected", channel }));

      sub.on("message", (_ch, message) => {
        send(message);
      });

      try {
        await sub.subscribe(channel);
      } catch (e) {
        send(JSON.stringify({ type: "sse.error", message: String(e) }));
        controller.close();
      }
    },
    async cancel() {
      try {
        await sub.unsubscribe(channel);
        sub.disconnect();
      } catch {
        // ignore
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
