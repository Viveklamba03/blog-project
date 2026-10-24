import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "sportsjira_admin";
export const adminSessionDuration = 8 * 60 * 60;

function signature(value) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPassword(password) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) throw new Error("ADMIN_PASSWORD is not configured.");
  return safeEqual(password, configuredPassword);
}

export function createAdminSession() {
  const payload = String(Date.now());
  return `${payload}.${signature(payload)}`;
}

export function isAdminSessionValid(token) {
  if (!token) return false;
  const [payload, receivedSignature, ...extra] = token.split(".");
  if (!payload || !receivedSignature || extra.length) return false;
  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt) || issuedAt > Date.now()) return false;
  if (Date.now() - issuedAt > adminSessionDuration * 1000) return false;
  return safeEqual(signature(payload), receivedSignature);
}
