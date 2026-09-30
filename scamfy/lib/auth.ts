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

const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "scamfy-session-hmac-dev-secret-only-2026-strict-key";

/**
 * Resolves the server-side session authentication secret.
 * In production, an explicit non-empty secret of at least 32 characters is mandatory.
 * The session signing key may come ONLY from AUTH_SECRET or SESSION_SECRET.
 * Never uses CLERK_SECRET_KEY or INTERNAL_API_SECRET for session HMAC signing.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.trim().length === 0 || secret.trim().length < MIN_SECRET_LENGTH) {
      throw new Error(
        "CRITICAL: AUTH_SECRET or SESSION_SECRET must be configured with at least 32 characters."
      );
    }
    return secret.trim();
  }

  if (secret && secret.trim().length > 0) {
    return secret.trim();
  }

  // Development/test-only isolated fallback (never usable in production)
  return DEV_FALLBACK_SECRET;
}

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
  const authSecret = getAuthSecret();
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
    .createHmac("sha256", authSecret)
    .update(dataToSign)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a session token's cryptographic signature and expiration.
 * Returns null if the token is forged, tampered with, expired, or if auth secret is missing.
 */
export function verifySessionToken(token: string): SessionJwtPayload | null {
  if (!token || typeof token !== "string") return null;

  let authSecret: string;
  try {
    authSecret = getAuthSecret();
  } catch {
    // Fail closed if production secret is missing
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64 || !signatureB64) return null;
  const dataToSign = `${headerB64}.${payloadB64}`;

  const expectedSig = crypto
    .createHmac("sha256", authSecret)
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
 * Queries PostgreSQL database for authoritative user record and role.
 *
 * CRITICAL SAFETY & RBAC INVARIANTS:
 * 1. NEVER trusts client-controlled x-user-id or x-user-role headers.
 * 2. Fails closed if production AUTH_SECRET is not configured.
 * 3. Fails closed for privileged roles (moderator, college_admin) if authoritative database lookup
 *    fails or user is not confirmed as a moderator/admin in the database.
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

  // Lookup user in database for authoritative record & role
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
        role: user.role, // Authoritative role strictly from database
      };
    }

    // If user is not found in database:
    // Privileged roles (moderator, college_admin) MUST fail closed.
    if (payload.role === "moderator" || payload.role === "college_admin") {
      if (process.env.NODE_ENV === "production") {
        return null;
      }
    }
  } catch {
    // Database lookup failure:
    // Privileged roles MUST fail closed — never grant administrative access on DB error
    if (payload.role === "moderator" || payload.role === "college_admin") {
      return null;
    }
  }

  // In non-production or for standard student users where DB record is pending sync:
  if (process.env.NODE_ENV === "production" && (payload.role === "moderator" || payload.role === "college_admin")) {
    return null;
  }

  return {
    userId: payload.userId,
    clerkUserId: payload.clerkUserId,
    email: payload.email,
    role: payload.role,
  };
}
