/**
 * WebSocket gateway: Socket.IO + Redis adapter + Redis pub/sub fan-out.
 * Next.js does not expose WebSocket upgrades on the same port; this sidecar
 * shares JWT session cookies and Redis channels with the Next app.
 */
import { createServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import { Server } from "socket.io";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const PORT = Number(process.env.PORT || 3002);

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return { userId, email: String(payload.email || "") };
  } catch {
    return null;
  }
}

function sessionTokenFromHandshake(handshake) {
  const cookieHeader = handshake.headers.cookie || "";
  const parts = cookieHeader.split(";").map((s) => s.trim());
  const pair = parts.find((p) => p.startsWith("session_token="));
  if (pair) return decodeURIComponent(pair.slice("session_token=".length));
  const fromAuth = handshake.auth?.token;
  return typeof fromAuth === "string" ? fromAuth : null;
}

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.IO gateway (use WebSocket client)\n");
});

const io = new Server(httpServer, {
  cors: { origin: true, credentials: true }
});

const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.on("connection", (socket) => {
  const token = sessionTokenFromHandshake(socket.handshake);
  const auth = verifyToken(token);
  if (!auth) {
    socket.emit("gateway:error", { message: "Unauthorized" });
    socket.disconnect(true);
    return;
  }
  socket.join(`user:${auth.userId}`);
  socket.emit("gateway:ready", {
    userId: auth.userId,
    message: "Subscribed to user room; Redis pub events forwarded as event"
  });

  socket.on("client:ping", () => {
    socket.emit("client:pong", { at: new Date().toISOString() });
  });
});

const fanout = new Redis(REDIS_URL);
fanout.psubscribe("app:user:*:events", (err) => {
  if (err) console.error("[socket-gateway] psubscribe error", err);
});

fanout.on("pmessage", (_pattern, channel, message) => {
  const m = /^app:user:(\d+):events$/.exec(channel);
  if (!m) return;
  const userId = m[1];
  let data;
  try {
    data = JSON.parse(message);
  } catch {
    data = { raw: message };
  }
  io.to(`user:${userId}`).emit("event", data);
});

httpServer.listen(PORT, () => {
  console.log(`[socket-gateway] listening on ${PORT}, redis ${REDIS_URL}`);
});
