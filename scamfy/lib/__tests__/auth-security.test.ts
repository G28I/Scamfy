import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as adminGet, PATCH as adminPatch } from "@/app/api/admin/reports/route";
import { POST as reportPost, GET as reportGet } from "@/app/api/reports/route";
import { createSessionToken, verifySessionToken } from "@/lib/auth";
import { IndicatorType, ReportStatus, RiskLevel, VerificationStatus } from "@prisma/client";

describe("Server-Authoritative Authentication & RBAC Security Boundary", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const { prisma } = await import("@/lib/prisma");
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return cb(prisma);
      }
      return cb;
    });
  });

  describe("Token Signing & Verification", () => {
    it("creates and verifies a valid cryptographic session token", () => {
      const token = createSessionToken({
        userId: "11111111-1111-1111-1111-111111111111",
        role: "moderator",
        email: "mod@scamfy.org",
      });

      const payload = verifySessionToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe("11111111-1111-1111-1111-111111111111");
      expect(payload?.role).toBe("moderator");
      expect(payload?.email).toBe("mod@scamfy.org");
    });

    it("rejects tampered tokens with forged payloads", () => {
      const token = createSessionToken({
        userId: "11111111-1111-1111-1111-111111111111",
        role: "student_user",
      });

      const parts = token.split(".");
      // Attempt to forge role from student_user to moderator
      const forgedPayload = Buffer.from(
        JSON.stringify({
          userId: "11111111-1111-1111-1111-111111111111",
          role: "moderator",
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      ).toString("base64url");

      const tamperedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;
      const payload = verifySessionToken(tamperedToken);
      expect(payload).toBeNull();
    });

    it("rejects expired tokens", () => {
      // Create token expired 10 seconds ago
      const token = createSessionToken(
        {
          userId: "11111111-1111-1111-1111-111111111111",
          role: "moderator",
        },
        -10
      );

      const payload = verifySessionToken(token);
      expect(payload).toBeNull();
    });
  });

  describe("Forged Header Attack Prevention (SEC-AUTH)", () => {
    it("rejects forged x-user-role and x-user-id headers on unauthenticated request with 401", async () => {
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

    it("rejects forged x-user-role: moderator when authenticated session belongs to student_user with 403", async () => {
      const studentToken = createSessionToken({
        userId: "student-uuid-1",
        role: "student_user",
        email: "student@college.edu",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        headers: {
          Authorization: `Bearer ${studentToken}`,
          "x-user-role": "moderator",
          "x-user-id": "moderator-impersonated",
        },
      });

      const res = await adminGet(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Forbidden");
      expect(body.message).toContain("Moderator role required");
    });

    it("attributs community report to authenticated session userId, ignoring forged x-user-id header", async () => {
      const { prisma } = await import("@/lib/prisma");

      const realUserToken = createSessionToken({
        userId: "legitimate-victim-uuid",
        role: "student_user",
        email: "victim@college.edu",
      });

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
        reporterUserId: "legitimate-victim-uuid",
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
          Authorization: `Bearer ${realUserToken}`,
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

      // Verify report creation strictly used legitimate-victim-uuid, NOT attacker-spoofed-user-id
      expect(createReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reporterUserId: "legitimate-victim-uuid",
          }),
        })
      );
    });

    it("GET /api/reports queries reports only for authenticated session user", async () => {
      const { prisma } = await import("@/lib/prisma");

      const sessionToken = createSessionToken({
        userId: "user-session-abc",
        role: "student_user",
      });

      const findManySpy = vi.spyOn(prisma.communityReport, "findMany").mockResolvedValueOnce([] as never);

      const req = new NextRequest("http://localhost:3000/api/reports", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "x-user-id": "victim-other-user",
        },
      });

      const res = await reportGet(req);
      expect(res.status).toBe(200);

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reporterUserId: "user-session-abc" },
        })
      );
    });

    it("moderator PATCH audit event logs authenticated session actor, ignoring forged x-user-id and role headers", async () => {
      const { prisma } = await import("@/lib/prisma");

      const modToken = createSessionToken({
        userId: "real-mod-uuid-77",
        role: "moderator",
      });

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
          Authorization: `Bearer ${modToken}`,
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
            actorId: "real-mod-uuid-77",
            actorRole: "moderator",
            action: "REPORT_APPROVED",
          }),
        })
      );
    });

    it("accepts authenticated session via Cookie __session or scamfy_session", async () => {
      const { prisma } = await import("@/lib/prisma");

      const cookieToken = createSessionToken({
        userId: "mod-cookie-123",
        role: "moderator",
      });

      vi.spyOn(prisma.communityReport, "findMany").mockResolvedValueOnce([] as never);
      vi.spyOn(prisma.communityReport, "count").mockResolvedValueOnce(0 as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        headers: {
          Cookie: `__session=${cookieToken}`,
        },
      });

      const res = await adminGet(req);
      expect(res.status).toBe(200);
    });
  });
});
