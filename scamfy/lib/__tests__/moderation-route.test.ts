import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/admin/reports/route";
import { NextRequest } from "next/server";
import { ReportStatus, VerificationStatus, RiskLevel, IndicatorType } from "@prisma/client";

describe("Admin Moderation API Route (/api/admin/reports)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/admin/reports", () => {
    it("rejects unauthorized non-moderator roles with 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        headers: { "x-user-role": "user" },
      });

      const res = await GET(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe("Forbidden");
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
  });

  describe("PATCH /api/admin/reports", () => {
    it("rejects unauthorized non-moderator roles with 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/reports", {
        method: "PATCH",
        headers: { "x-user-role": "user" },
        body: JSON.stringify({ reportId: "rep-1", action: "APPROVE" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(403);
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

      vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
      const updateReportSpy = vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
      const updatePatternSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
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
