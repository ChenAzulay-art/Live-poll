import { createHmac, timingSafeEqual } from "node:crypto";
import { djSessionCookie } from "@/lib/auth/cookie-config";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function getDjPin() {
  return process.env.DJ_PIN ?? "1234";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "dev-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function pinMatches(pin: string) {
  const expected = getDjPin();
  return safeEqual(pin, expected);
}

export function createDjSessionToken(now = Date.now()) {
  const expiresAt = String(now + SESSION_TTL_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyDjSessionToken(
  token: string | undefined,
  now = Date.now(),
) {
  if (!token) {
    return false;
  }
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) {
    return false;
  }
  const expected = sign(expiresAt);
  if (!safeEqual(signature, expected)) {
    return false;
  }
  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}

export { djSessionCookie };
export { voterCookie } from "@/lib/auth/cookie-config";
