import crypto from "node:crypto";

import jwt from "jsonwebtoken";

const SESSION_COOKIE = "session_token";
const EXPIRY = "7d";

function getSecret() {
  return process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, hashed: string) {
  const [salt, original] = hashed.split(":");
  if (!salt || !original) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(original, "hex"), Buffer.from(derived, "hex"));
}

export function signSession(payload: { userId: number; email: string }) {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRY });
}

export function verifySession(token: string) {
  return jwt.verify(token, getSecret()) as { userId: number; email: string };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
