"use server";

import { invalidateTaskCaches, publishUserEvent } from "@/lib/redis";
import { requireAuth } from "@/lib/server-auth";

/** Publishes a Redis message for this user (SSE + Socket.IO gateway receive it). */
export async function publishDemoServerAction(formData: FormData) {
  const auth = await requireAuth();
  if (!auth) return { ok: false as const, error: "Unauthorized" };

  const message = String(formData.get("message") ?? "").trim().slice(0, 500);
  await publishUserEvent(auth.userId, {
    type: "demo.broadcast",
    message: message || "(empty message)"
  });
  return { ok: true as const };
}

/** Clears Redis task list/analytics cache for this user and notifies listeners. */
export async function bustTaskCacheServerAction() {
  const auth = await requireAuth();
  if (!auth) return { ok: false as const, error: "Unauthorized" };

  await invalidateTaskCaches(auth.userId);
  await publishUserEvent(auth.userId, { type: "cache.busted" });
  return { ok: true as const };
}
