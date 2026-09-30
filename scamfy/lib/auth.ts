import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";

export type { UserRole };

export interface AuthSession {
  userId: string;
  clerkUserId: string;
  email?: string | null;
  role: UserRole;
}

/**
 * Server-authoritative session adapter built on Clerk identity and PostgreSQL RBAC.
 *
 * Flow:
 * 1. Obtains authenticated Clerk user ID via Clerk's server-side auth().
 * 2. Queries PostgreSQL (prisma.user) by clerkUserId for the authoritative internal User record and role.
 * 3. Enforces database-authoritative role.
 *
 * CRITICAL SAFETY & RBAC INVARIANTS:
 * - Identity is established strictly via Clerk's server-side auth().
 * - Internal application role is established strictly via PostgreSQL.
 * - NEVER trusts client-controlled x-user-id or x-user-role headers.
 * - Fails closed if unauthenticated or if database lookup fails for privileged access.
 * - Privileged roles (moderator, college_admin) MUST be explicitly confirmed in the database.
 */
export async function getAuthSession(
  req?: NextRequest | Request
): Promise<AuthSession | null> {
  void req;
  let clerkUserId: string | null = null;

  try {
    const authState = await auth();
    clerkUserId = authState?.userId || null;
  } catch {
    // If auth() cannot resolve or is outside request context, fail closed
    return null;
  }

  if (!clerkUserId || typeof clerkUserId !== "string" || clerkUserId.trim().length === 0) {
    return null;
  }

  const normalizedClerkId = clerkUserId.trim();

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId: normalizedClerkId },
      update: {}, // Preserve existing user data and database role
      create: {
        clerkUserId: normalizedClerkId,
        role: UserRole.student_user, // Default unprivileged role
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        role: true,
      },
    });

    return {
      userId: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      role: user.role, // Authoritative role strictly from database
    };
  } catch {
    // Database lookup or insertion failure:
    // Fail closed — never grant administrative/privileged access on DB error
    return null;
  }
}

