import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/admin/reports/route";
import { NextRequest } from "next/server";
import { ReportStatus, VerificationStatus, RiskLevel, IndicatorType } from "@prisma/client";

describe("Admin Moderation API Route (/api/admin/reports)", () => {
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

  describe("GET /api/admin/reports", () => {
    it("rejects unauthorized missing role with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthorized non-moderator roles with 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        headers: { "x-user-role": "user" },
      });

      const res = await GET(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe("Forbidden");
    });

    it("returns 400 for invalid status query parameter", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports?status=INVALID_STATUS", {
        headers: { "x-user-role": "moderator" },
      });

      const res = await GET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("ValidationError");
    });

    it("returns moderation queue for moderator actor", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockReports = [
        {
          id: "rep-1",
          reporterUserId: "user-1",
          patternId: "pat-1",
          indicatorType: IndicatorType.UPI_ID,
          indicatorValue: "scammer@icici",
          category: "UPI_REVERSE_PAYMENT_FRAUD",
          description: "Fake prize scam",
          status: ReportStatus.PENDING,
          moderatorNotes: null,
          createdAt: new Date("2026-09-26T12:00:00Z"),
          pattern: {
            id: "pat-1",
            reportCount: 3,
            riskLevel: RiskLevel.HIGH_RISK,
            verificationStatus: VerificationStatus.UNVERIFIED,
            lastReportedAt: new Date("2026-09-26T12:00:00Z"),
          },
          reporter: {
            id: "user-1",
            email: "student@college.edu",
            role: "user",
          },
        },
      ];

      vi.spyOn(prisma.communityReport, "findMany").mockResolvedValueOnce(mockReports as never);
      vi.spyOn(prisma.communityReport, "count").mockResolvedValueOnce(1 as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports?status=PENDING", {
        headers: { "x-user-role": "moderator" },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.reports.length).toBe(1);
      expect(data.total).toBe(1);
      expect(data.reports[0].reporterEmail).toBe("student@college.edu");
      expect(data.reports[0].pattern.verificationStatus).toBe("UNVERIFIED");
    });

    it("clamps limit to 100 and offset to 0 when out of bounds values provided", async () => {
      const { prisma } = await import("@/lib/prisma");

      const findManySpy = vi.spyOn(prisma.communityReport, "findMany").mockResolvedValueOnce([] as never);
      vi.spyOn(prisma.communityReport, "count").mockResolvedValueOnce(0 as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports?limit=500&offset=-10", {
        headers: { "x-user-role": "moderator" },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          skip: 0,
        })
      );
    });
  });

  describe("PATCH /api/admin/reports", () => {
    it("rejects unauthorized missing role with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        body: JSON.stringify({ reportId: "rep-1", action: "APPROVE" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it("rejects missing actorId with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: { "x-user-role": "moderator" },
        body: JSON.stringify({ reportId: "rep-1", action: "APPROVE" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthorized non-moderator roles with 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: { "x-user-role": "user", "x-user-id": "u-1" },
        body: JSON.stringify({ reportId: "rep-1", action: "APPROVE" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(403);
    });

    it("rejects invalid riskLevel with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: { "x-user-role": "moderator", "x-user-id": "mod-1" },
        body: JSON.stringify({ reportId: "rep-1", action: "APPROVE", riskLevel: "EXTREME_DANGER" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("ValidationError");
    });

    it("approves report, updates pattern to MODERATOR_VERIFIED and logs AuditEvent (SEC-06)", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockReport = {
        id: "rep-1",
        patternId: "pat-1",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scamvpa@okhdfc",
        status: ReportStatus.PENDING,
        pattern: {
          id: "pat-1",
          verificationStatus: VerificationStatus.UNVERIFIED,
          riskLevel: RiskLevel.SUSPICIOUS,
        },
      };

      vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
      const updateReportSpy = vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
      const updatePatternSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
      const createAuditSpy = vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: {
          "x-user-id": "mod-99",
          "x-user-role": "moderator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: "rep-1",
          action: "APPROVE",
          moderatorNotes: "Verified fraudulent QR code match",
          riskLevel: RiskLevel.CRITICAL,
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("APPROVED");

      // Verify report update
      expect(updateReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "rep-1" },
          data: expect.objectContaining({
            status: ReportStatus.APPROVED,
            moderatorNotes: "Verified fraudulent QR code match",
          }),
        })
      );

      // Verify pattern promotion to MODERATOR_VERIFIED (REP-05)
      expect(updatePatternSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "pat-1" },
          data: expect.objectContaining({
            verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
            riskLevel: RiskLevel.CRITICAL,
          }),
        })
      );

      // Verify immutable AuditEvent logged (SEC-06)
      expect(createAuditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: "mod-99",
            actorRole: "moderator",
            action: "REPORT_APPROVED",
            targetResourceType: "CommunityReport",
            targetResourceId: "rep-1",
          }),
        })
      );
    });

    it("handles REJECT action and creates AuditEvent", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockReport = {
        id: "rep-2",
        patternId: "pat-2",
        indicatorType: IndicatorType.PHONE,
        indicatorValue: "+919876543210",
        status: ReportStatus.PENDING,
      };

      vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
      const updateReportSpy = vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
      const createAuditSpy = vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: { "x-user-id": "mod-99", "x-user-role": "moderator" },
        body: JSON.stringify({
          reportId: "rep-2",
          action: "REJECT",
          moderatorNotes: "Legitimate customer service number",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(updateReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "rep-2" },
          data: expect.objectContaining({
            status: ReportStatus.REJECTED,
          }),
        })
      );
      expect(createAuditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "REPORT_REJECTED",
          }),
        })
      );
    });

    it("handles MERGE action into canonical pattern preserving provenance", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockReport = {
        id: "rep-3",
        patternId: "pat-duplicate",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scam@ybl",
        status: ReportStatus.PENDING,
      };

      const mockTargetPattern = {
        id: "pat-canonical",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scam@ybl",
        reportCount: 5,
      };

      vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
      vi.spyOn(prisma.scamPattern, "findUnique")
        .mockResolvedValueOnce(mockTargetPattern as never)
        .mockResolvedValueOnce({ id: "pat-duplicate", reportCount: 3 } as never);

      const updateReportSpy = vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
      const updatePatternSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValue({} as never);
      const createAuditSpy = vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: { "x-user-id": "mod-99", "x-user-role": "moderator" },
        body: JSON.stringify({
          reportId: "rep-3",
          action: "MERGE",
          targetPatternId: "pat-canonical",
          moderatorNotes: "Merged duplicate handle variant",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(updateReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "rep-3" },
          data: expect.objectContaining({
            patternId: "pat-canonical",
            status: ReportStatus.MERGED,
          }),
        })
      );
      expect(updatePatternSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "pat-canonical" },
          data: expect.objectContaining({
            reportCount: { increment: 1 },
          }),
        })
      );
      expect(createAuditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "REPORT_MERGED",
          }),
        })
      );
    });
  });
});

