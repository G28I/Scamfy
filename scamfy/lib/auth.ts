import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export type { UserRole };

export interface AuthSession {
  userId: string;
  clerkUserId?: string;
  email?: string;
  role: UserRole;
}

export interface SessionJwtPayload {
  sub: string;
  userId: string;
  clerkUserId?: string;
  email?: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  process.env.CLERK_SECRET_KEY ||
  process.env.INTERNAL_API_SECRET ||
  "scamfy-session-hmac-secret-dev-2026-strict-key";

function parseCookies(cookieStr: string): Record<string, string> {
  const list: Record<string, string> = {};
  cookieStr.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join("=").trim());
    }
  });
  return list;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export function createSessionToken(
  payload: {
    userId: string;
    role: UserRole;
    email?: string;
    clerkUserId?: string;
  },
  expiresInSeconds = 7 * 24 * 3600
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: SessionJwtPayload = {
    sub: payload.clerkUserId || payload.userId,
    userId: payload.userId,
    clerkUserId: payload.clerkUserId,
    email: payload.email,
    role: payload.role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const dataToSign = `${headerB64}.${payloadB64}`;
  const signatureB64 = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(dataToSign)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a session token's cryptographic signature and expiration.
 * Returns null if the token is forged, tampered with, or expired.
 */
export function verifySessionToken(token: string): SessionJwtPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64 || !signatureB64) return null;
  const dataToSign = `${headerB64}.${payloadB64}`;

  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(dataToSign)
    .digest();

  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(signatureB64, "base64url");
  } catch {
    return null;
  }

  if (expectedSig.length !== providedSig.length) return null;
  if (!crypto.timingSafeEqual(expectedSig, providedSig)) return null;

  let payload: SessionJwtPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) {
    return null;
  }

  if (!payload.userId || !payload.role) {
    return null;
  }

  return payload;
}

/**
 * Server-authoritative session extractor for Next.js route handlers.
 * Extracts signed session from Cookies (__session or scamfy_session) or Authorization: Bearer.
 * Queries PostgreSQL database for authoritative user record if available.
 * NEVER trusts client-controlled x-user-id or x-user-role headers.
 */
export async function getAuthSession(req: NextRequest | Request): Promise<AuthSession | null> {
  let token: string | null = null;

  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  // 2. Cookie: __session or scamfy_session
  if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      token = cookies["__session"] || cookies["scamfy_session"] || null;
    }
  }

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  // Lookup user in database for authoritative record if available
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.userId);
    const conditions = [
      ...(isUuid ? [{ id: payload.userId }] : []),
      { clerkUserId: payload.userId },
      ...(payload.clerkUserId ? [{ clerkUserId: payload.clerkUserId }] : []),
      ...(payload.sub ? [{ clerkUserId: payload.sub }] : []),
    ];

    const user = await prisma.user.findFirst({
      where: {
        OR: conditions,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        role: true,
      },
    });

    if (user) {
      return {
        userId: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email || payload.email,
        role: user.role,
      };
    }
  } catch {
    // Database lookup error fallback to verified token claims
  }

  return {
    userId: payload.userId,
    clerkUserId: payload.clerkUserId,
    email: payload.email,
    role: payload.role,
  };
}
