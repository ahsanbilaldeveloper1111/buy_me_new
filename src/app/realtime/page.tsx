import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/server-auth";

import { RealtimePanel } from "./realtime-panel";

export default async function RealtimePage() {
  const auth = await requireAuth();
  if (!auth) redirect("/auth");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Redis, SSE, Socket.IO, server actions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Logged in as <strong>{auth.email}</strong> (user id {auth.userId}). Start{" "}
          <code className="text-xs">redis</code> and <code className="text-xs">socket-gateway</code> with Docker Compose
          for full functionality.
        </p>
      </div>
      <RealtimePanel />
    </section>
  );
}
