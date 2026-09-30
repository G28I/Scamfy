import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as adminGet, PATCH as adminPatch } from "@/app/api/admin/reports/route";
import { POST as reportPost } from "@/app/api/reports/route";
import { POST as clerkWebhookPost } from "@/app/api/webhooks/clerk/route";
import { getAuthSession } from "@/lib/auth";
import { IndicatorType, ReportStatus, RiskLevel, VerificationStatus, UserRole } from "@prisma/client";

// Mock @clerk/nextjs/server auth helper
let currentClerkUserId: string | null = null;

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({
    userId: currentClerkUserId,
  })),
  clerkMiddleware: vi.fn(() => () => {}),
}));

describe("Server-Authoritative Clerk Identity & RBAC Security Boundary", () => {
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    currentClerkUserId = null;
    const { prisma } = await import("@/lib/prisma");
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return cb(prisma);
      }
      return cb;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Clerk Identity Resolution & Fail-Closed Boundary", () => {
    it("returns null when user is not authenticated in Clerk (userId is null)", async () => {
      currentClerkUserId = null;
      const req = new NextRequest("http://localhost:3000/api/reports");
      const session = await getAuthSession(req);
      expect(session).toBeNull();
    });

    it("returns null when Clerk auth() throws an unhandled error", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockRejectedValueOnce(new Error("Clerk runtime error"));

      const req = new NextRequest("http://localhost:3000/api/reports");
      const session = await getAuthSession(req);
      expect(session).toBeNull();
    });

    it("resolves authenticated user and extracts authoritative database role from PostgreSQL", async () => {
      currentClerkUserId = "clerk_user_mod_123";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce({
        id: "db-user-uuid-123",
        clerkUserId: "clerk_user_mod_123",
        email: "moderator@scamfy.org",
        role: UserRole.moderator,
      } as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports");
      const session = await getAuthSession(req);

      expect(session).not.toBeNull();
      expect(session?.userId).toBe("db-user-uuid-123");
      expect(session?.clerkUserId).toBe("clerk_user_mod_123");
      expect(session?.role).toBe("moderator");
      expect(session?.email).toBe("moderator@scamfy.org");
    });

    it("auto-provisions default student_user role when user exists in Clerk but not yet in PostgreSQL", async () => {
      currentClerkUserId = "clerk_new_student_456";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce(null);
      const createSpy = vi.spyOn(prisma.user, "create").mockResolvedValueOnce({
        id: "new-student-db-id",
        clerkUserId: "clerk_new_student_456",
        email: null,
        role: UserRole.student_user,
      } as never);

      const req = new NextRequest("http://localhost:3000/api/reports");
      const session = await getAuthSession(req);

      expect(session).not.toBeNull();
      expect(session?.role).toBe(UserRole.student_user);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clerkUserId: "clerk_new_student_456",
            role: UserRole.student_user,
          }),
        })
      );
    });

    it("fails closed with null when database lookup/insertion throws an error", async () => {
      currentClerkUserId = "clerk_user_mod_crash";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockRejectedValueOnce(new Error("DB Connection Pool Timeout"));

      const req = new NextRequest("http://localhost:3000/api/admin/reports");
      const session = await getAuthSession(req);
      expect(session).toBeNull();
    });
  });

  describe("Database-Authoritative RBAC & Fail-Closed Behavior", () => {
    it("fails closed with 401 when unauthenticated request calls protected admin endpoint", async () => {
      currentClerkUserId = null;
      const req = new NextRequest("http://localhost:3000/api/admin/reports");
      const res = await adminGet(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("enforces database-authoritative role and rejects student_user on admin route with 403", async () => {
      currentClerkUserId = "clerk_student_victim";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce({
        id: "student-uuid",
        clerkUserId: "clerk_student_victim",
        email: "student@college.edu",
        role: UserRole.student_user, // Strictly student_user in DB
      } as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports");
      const res = await adminGet(req);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe("Forbidden");
      expect(data.message).toContain("Moderator role required");
    });
  });

  describe("Forged Header Attack Prevention (SEC-AUTH)", () => {
    it("rejects forged x-user-role: moderator on unauthenticated request with 401", async () => {
      currentClerkUserId = null;

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        headers: {
          "x-user-role": "moderator",
          "x-user-id": "attacker-root",
        },
      });

      const res = await adminGet(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("rejects forged x-user-role: moderator when authenticated Clerk user is student_user in DB with 403", async () => {
      currentClerkUserId = "clerk_student_hacker";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce({
        id: "hacker-student-uuid",
        clerkUserId: "clerk_student_hacker",
        email: "student@college.edu",
        role: UserRole.student_user,
      } as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        headers: {
          "x-user-role": "moderator",
          "x-user-id": "moderator-spoofed-id",
        },
      });

      const res = await adminGet(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Forbidden");
      expect(body.message).toContain("Moderator role required");
    });

    it("attributes community report to authenticated session userId, ignoring forged x-user-id header", async () => {
      currentClerkUserId = "clerk_legitimate_reporter";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce({
        id: "legitimate-user-db-uuid",
        clerkUserId: "clerk_legitimate_reporter",
        email: "victim@college.edu",
        role: UserRole.student_user,
      } as never);

      const mockPattern = {
        id: "pat-1",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "fake@upi",
        category: "SUSPICIOUS_COMMUNICATION",
        riskLevel: RiskLevel.HIGH_RISK,
        verificationStatus: VerificationStatus.UNVERIFIED,
        reportCount: 1,
      };

      const mockReport = {
        id: "rep-1",
        reporterUserId: "legitimate-user-db-uuid",
        patternId: "pat-1",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "fake@upi",
        category: "SUSPICIOUS_COMMUNICATION",
        status: ReportStatus.PENDING,
      };

      vi.spyOn(prisma.scamPattern, "upsert").mockResolvedValueOnce(mockPattern as never);
      const createReportSpy = vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockReport as never);

      const req = new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          "x-user-id": "attacker-spoofed-user-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indicatorType: IndicatorType.UPI_ID,
          indicatorValue: "fake@upi",
          category: "SUSPICIOUS_COMMUNICATION",
          description: "Scam payment request received",
        }),
      });

      const res = await reportPost(req);
      expect(res.status).toBe(201);

      // Verify report creation strictly used legitimate-user-db-uuid, NOT attacker-spoofed-user-id
      expect(createReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reporterUserId: "legitimate-user-db-uuid",
          }),
        })
      );
    });

    it("moderator PATCH audit event logs authenticated session actor, ignoring forged x-user-id and role headers", async () => {
      currentClerkUserId = "clerk_real_moderator";
      const { prisma } = await import("@/lib/prisma");

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce({
        id: "real-mod-db-id-77",
        clerkUserId: "clerk_real_moderator",
        email: "moderator@scamfy.org",
        role: UserRole.moderator,
      } as never);

      const mockReport = {
        id: "rep-target-1",
        patternId: "pat-1",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "fraud@axis",
        status: ReportStatus.PENDING,
        pattern: {
          id: "pat-1",
          verificationStatus: VerificationStatus.UNVERIFIED,
        },
      };

      vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
      vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
      vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
      const auditSpy = vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: {
          "x-user-id": "spoofed-admin-id",
          "x-user-role": "superadmin",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: "rep-target-1",
          action: "APPROVE",
          moderatorNotes: "Legitimate verification",
          riskLevel: RiskLevel.CRITICAL,
        }),
      });

      const res = await adminPatch(req);
      expect(res.status).toBe(200);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: "real-mod-db-id-77",
            actorRole: "moderator",
            action: "REPORT_APPROVED",
          }),
        })
      );
    });
  });

  describe("Clerk Webhook User Synchronization (/api/webhooks/clerk)", () => {
    it("creates unprivileged student_user in PostgreSQL on user.created event", async () => {
      const { prisma } = await import("@/lib/prisma");
      const upsertSpy = vi.spyOn(prisma.user, "upsert").mockResolvedValueOnce({} as never);

      const payload = {
        type: "user.created",
        data: {
          id: "user_clerk_new_999",
          email_addresses: [{ email_address: "student@college.edu" }],
        },
      };

      const req = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await clerkWebhookPost(req);
      expect(res.status).toBe(200);

      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clerkUserId: "user_clerk_new_999" },
          create: expect.objectContaining({
            clerkUserId: "user_clerk_new_999",
            email: "student@college.edu",
            role: UserRole.student_user,
          }),
        })
      );
    });
  });
});
