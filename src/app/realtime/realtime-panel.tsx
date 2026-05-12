"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { bustTaskCacheServerAction, publishDemoServerAction } from "@/app/actions/redis-realtime";

export function RealtimePanel() {
  const [sseLog, setSseLog] = useState<string[]>([]);
  const [socketLog, setSocketLog] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/realtime/sse");
    es.onmessage = (ev) => {
      setSseLog((prev) => [...prev.slice(-40), ev.data]);
    };
    es.onerror = () => {
      setSseLog((prev) => [...prev.slice(-40), "[sse] connection error / retrying…"]);
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:3002";
    const socket: Socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    const push = (line: string) => setSocketLog((prev) => [...prev.slice(-40), line]);

    socket.on("connect", () => push(`[socket] id=${socket.id}`));
    socket.on("gateway:ready", (p: unknown) => push(`[socket] ready ${JSON.stringify(p)}`));
    socket.on("event", (p: unknown) => push(`[socket] event ${JSON.stringify(p)}`));
    socket.on("client:pong", (p: unknown) => push(`[socket] pong ${JSON.stringify(p)}`));
    socket.on("gateway:error", (p: unknown) => push(`[socket] error ${JSON.stringify(p)}`));
    socket.on("disconnect", (reason) => push(`[socket] disconnect ${reason}`));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded border p-4 space-y-2">
        <h3 className="font-semibold">Server actions → Redis PUBLISH</h3>
        <p className="text-sm text-gray-600">
          Submits run on the server, publish to your per-user channel, and show up in SSE + Socket.IO below.
        </p>
        <form className="flex flex-wrap items-end gap-2" action={publishDemoServerAction}>
          <label className="flex flex-col text-sm">
            Message
            <input name="message" className="rounded border px-2 py-1 min-w-[200px]" placeholder="Hello from server action" />
          </label>
          <button type="submit" className="rounded border px-3 py-1 text-sm">
            Publish
          </button>
        </form>
        <form action={bustTaskCacheServerAction}>
          <button type="submit" className="rounded border px-3 py-1 text-sm">
            Bust task cache + notify
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-3">
          <h3 className="font-semibold mb-2">SSE (/api/realtime/sse)</h3>
          <pre className="max-h-64 overflow-auto text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">{sseLog.join("\n") || "…"}</pre>
        </div>
        <div className="rounded border p-3">
          <h3 className="font-semibold mb-2">Socket.IO (gateway)</h3>
          <p className="text-xs text-gray-600 mb-2">Emit ping to gateway (round-trip):</p>
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs"
            onClick={() => socketRef.current?.emit("client:ping")}
          >
            Emit client:ping
          </button>
          <pre className="max-h-48 overflow-auto text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded mt-2">
            {socketLog.join("\n") || "…"}
          </pre>
        </div>
      </div>
    </div>
  );
}
