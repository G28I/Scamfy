import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndicatorType, RiskLevel, VerificationStatus, ReportStatus } from "@prisma/client";
import { ingestCommunityReport, listPublicPatterns } from "@/lib/services/pattern-service";
import { GET as getPublicPatterns } from "@/app/api/patterns/route";
import { PATCH as patchAdminReport } from "@/app/api/admin/reports/route";
import { NextRequest } from "next/server";

describe("Critical Safety & Provenance Requirements — Community Intelligence (Phase 7)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Safety Requirement 1: Unverified community report is clearly labeled unverified
  it("Scenario 1: Fresh community report is saved as UNVERIFIED with PENDING status", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockPattern = {
      id: "pat-1",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "unverified@icici",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      riskLevel: RiskLevel.SUSPICIOUS,
      verificationStatus: VerificationStatus.UNVERIFIED,
      reportCount: 1,
      firstReportedAt: new Date(),
      lastReportedAt: new Date(),
      createdAt: new Date(),
    };

    const mockReport = {
      id: "rep-1",
      reporterUserId: "user-1",
      patternId: "pat-1",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "unverified@icici",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      description: "Asking for UPI pin refund",
      status: ReportStatus.PENDING,
      createdAt: new Date(),
    };

    vi.spyOn(prisma.scamPattern, "findUnique").mockResolvedValueOnce(null);
    vi.spyOn(prisma.scamPattern, "create").mockResolvedValueOnce(mockPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockReport as never);

    const result = await ingestCommunityReport(
      {
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "unverified@icici",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Asking for UPI pin refund",
      },
      "user-1"
    );

    expect(result.pattern.verificationStatus).toBe(VerificationStatus.UNVERIFIED);
    expect(result.report.status).toBe(ReportStatus.PENDING);
  });

  // Safety Requirement 2: Verified pattern is clearly labeled verified
  it("Scenario 2: Verified pattern returned with MODERATOR_VERIFIED status and provenance", async () => {
    const { prisma } = await import("@/lib/prisma");

    const verifiedPattern = {
      id: "pat-verified-1",
      indicatorType: IndicatorType.DOMAIN,
      indicatorValue: "phishing-bank-login.xyz",
      category: "PHISHING_CREDENTIAL_HARVESTING",
      riskLevel: RiskLevel.CRITICAL,
      verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
      reportCount: 14,
      firstReportedAt: new Date("2026-09-01"),
      lastReportedAt: new Date("2026-09-26"),
      createdAt: new Date("2026-09-01"),
      reports: [
        {
          id: "rep-v1",
          category: "PHISHING_CREDENTIAL_HARVESTING",
          description: "Fake login screen stealing OTPs",
          createdAt: new Date("2026-09-20"),
        },
      ],
    };

    vi.spyOn(prisma.scamPattern, "findMany").mockResolvedValueOnce([verifiedPattern] as never);
    vi.spyOn(prisma.scamPattern, "count").mockResolvedValueOnce(1 as never);

    const result = await listPublicPatterns({ tier: "verified" });
    expect(result.patterns.length).toBe(1);
    expect(result.patterns[0]!.verificationStatus).toBe(VerificationStatus.MODERATOR_VERIFIED);
    expect(result.patterns[0]!.riskLevel).toBe(RiskLevel.CRITICAL);
  });

  // Safety Requirement 3 & 4: Verified vs Unverified query stream segregation
  it("Scenario 3 & 4: Unverified reports never appear in verified-only stream and vice versa", async () => {
    const { prisma } = await import("@/lib/prisma");

    const verifiedPatterns = [
      {
        id: "pat-v",
        indicatorType: IndicatorType.PHONE,
        indicatorValue: "+919999988888",
        category: "IMPERSONATION_OFFICIAL",
        riskLevel: RiskLevel.CRITICAL,
        verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
        reportCount: 5,
        firstReportedAt: new Date(),
        lastReportedAt: new Date(),
        createdAt: new Date(),
        reports: [],
      },
    ];

    const unverifiedPatterns = [
      {
        id: "pat-u",
        indicatorType: IndicatorType.HANDLE,
        indicatorValue: "@fake_airdrop_bot",
        category: "TELEGRAM_CRYPTO_JOB_SCAM",
        riskLevel: RiskLevel.SUSPICIOUS,
        verificationStatus: VerificationStatus.UNVERIFIED,
        reportCount: 2,
        firstReportedAt: new Date(),
        lastReportedAt: new Date(),
        createdAt: new Date(),
        reports: [],
      },
    ];

    // Verified stream
    const findManySpy = vi.spyOn(prisma.scamPattern, "findMany").mockResolvedValueOnce(verifiedPatterns as never);
    vi.spyOn(prisma.scamPattern, "count").mockResolvedValueOnce(1 as never);

    await listPublicPatterns({ tier: "verified" });
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
        }),
      })
    );

    // Unverified stream
    findManySpy.mockResolvedValueOnce(unverifiedPatterns as never);
    vi.spyOn(prisma.scamPattern, "count").mockResolvedValueOnce(1 as never);

    await listPublicPatterns({ tier: "community" });
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verificationStatus: {
            in: [VerificationStatus.COMMUNITY_FLAGGED, VerificationStatus.UNVERIFIED],
          },
        }),
      })
    );
  });

  // Safety Requirement 5: Increasing reportCount alone NEVER promotes an indicator to MODERATOR_VERIFIED
  it("Scenario 5: High volume accumulation increases reportCount but preserves UNVERIFIED status", async () => {
    const { prisma } = await import("@/lib/prisma");

    const existingPattern = {
      id: "pat-high-vol",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "viralscam@upi",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      riskLevel: RiskLevel.SUSPICIOUS,
      verificationStatus: VerificationStatus.UNVERIFIED,
      reportCount: 99,
      firstReportedAt: new Date("2026-09-01"),
      lastReportedAt: new Date("2026-09-20"),
      createdAt: new Date("2026-09-01"),
    };

    const updatedPattern = {
      ...existingPattern,
      reportCount: 100,
      lastReportedAt: new Date(),
    };

    const mockReport = {
      id: "rep-100",
      reporterUserId: "user-100",
      patternId: "pat-high-vol",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "viralscam@upi",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      description: "100th report for this scam",
      status: ReportStatus.PENDING,
      createdAt: new Date(),
    };

    vi.spyOn(prisma.scamPattern, "findUnique").mockResolvedValueOnce(existingPattern as never);
    const updateSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce(updatedPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockReport as never);

    const result = await ingestCommunityReport(
      {
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "viralscam@upi",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "100th report for this scam",
      },
      "user-100"
    );

    // Invariant check: MUST NOT be MODERATOR_VERIFIED without human moderator action
    expect(result.pattern.verificationStatus).toBe(VerificationStatus.UNVERIFIED);
    expect(result.pattern.verificationStatus).not.toBe(VerificationStatus.MODERATOR_VERIFIED);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pat-high-vol" },
        data: expect.objectContaining({
          reportCount: { increment: 1 },
        }),
      })
    );
  });

  // Safety Requirement 6: Moderator approval explicitly changes verification state to MODERATOR_VERIFIED
  it("Scenario 6: Moderator approval action explicitly elevates pattern to MODERATOR_VERIFIED", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockReport = {
      id: "rep-pending-1",
      patternId: "pat-unv-1",
      indicatorType: IndicatorType.DOMAIN,
      indicatorValue: "fake-university-login.in",
      status: ReportStatus.PENDING,
      pattern: {
        id: "pat-unv-1",
        verificationStatus: VerificationStatus.UNVERIFIED,
        riskLevel: RiskLevel.SUSPICIOUS,
      },
    };

    vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
    vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
    const updatePatternSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
    vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

    const req = new NextRequest("http://localhost:3000/api/admin/reports", {
      method: "PATCH",
      headers: {
        "x-user-id": "moderator-1",
        "x-user-role": "moderator",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId: "rep-pending-1",
        action: "APPROVE",
        moderatorNotes: "Confirmed fraudulent landing page cloned from university portal",
        riskLevel: RiskLevel.CRITICAL,
      }),
    });

    const res = await patchAdminReport(req);
    expect(res.status).toBe(200);

    expect(updatePatternSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pat-unv-1" },
        data: expect.objectContaining({
          verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
          riskLevel: RiskLevel.CRITICAL,
        }),
      })
    );
  });

  // Safety Requirement 7: Reject / dismiss does not expose item as verified
  it("Scenario 7: Reject / dismiss sets status to DISMISSED/REJECTED and suppresses from public verified stream", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockReport = {
      id: "rep-fp-1",
      patternId: "pat-fp-1",
      indicatorType: IndicatorType.PHONE,
      indicatorValue: "+918000000000",
      status: ReportStatus.PENDING,
      pattern: {
        id: "pat-fp-1",
        verificationStatus: VerificationStatus.UNVERIFIED,
      },
    };

    vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
    vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
    const updatePatternSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
    vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

    const req = new NextRequest("http://localhost:3000/api/admin/reports", {
      method: "PATCH",
      headers: { "x-user-id": "moderator-1", "x-user-role": "moderator" },
      body: JSON.stringify({
        reportId: "rep-fp-1",
        action: "DISMISS",
        moderatorNotes: "Official helpline falsely reported",
      }),
    });

    const res = await patchAdminReport(req);
    expect(res.status).toBe(200);

    expect(updatePatternSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pat-fp-1" },
        data: expect.objectContaining({
          verificationStatus: VerificationStatus.DISMISSED,
        }),
      })
    );
  });

  // Safety Requirement 8: Merge preserves contributing report provenance while updating canonical pattern link
  it("Scenario 8: Merging duplicate report preserves original submission and updates link to canonical pattern", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockReport = {
      id: "rep-dup-1",
      patternId: "pat-dup-1",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "samefraud@okaxis",
      status: ReportStatus.PENDING,
    };

    vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
    const updateReportSpy = vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
    const updatePatternSpy = vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
    vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

    const req = new NextRequest("http://localhost:3000/api/admin/reports", {
      method: "PATCH",
      headers: { "x-user-id": "moderator-1", "x-user-role": "moderator" },
      body: JSON.stringify({
        reportId: "rep-dup-1",
        action: "MERGE",
        targetPatternId: "pat-canonical-master",
        moderatorNotes: "Merging identical VPA alias",
      }),
    });

    const res = await patchAdminReport(req);
    expect(res.status).toBe(200);

    expect(updateReportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rep-dup-1" },
        data: expect.objectContaining({
          patternId: "pat-canonical-master",
          status: ReportStatus.MERGED,
        }),
      })
    );
    expect(updatePatternSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pat-canonical-master" },
        data: expect.objectContaining({
          reportCount: { increment: 1 },
        }),
      })
    );
  });

  // Safety Requirement 9: Every moderation state change creates an immutable AuditEvent
  it("Scenario 9: Moderation actions emit structured AuditEvents for governance & audit compliance (SEC-06)", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockReport = {
      id: "rep-audit-test",
      patternId: "pat-audit-test",
      indicatorType: IndicatorType.DOMAIN,
      indicatorValue: "scam-loan-portal.org",
      status: ReportStatus.PENDING,
      pattern: { id: "pat-audit-test", verificationStatus: VerificationStatus.UNVERIFIED },
    };

    vi.spyOn(prisma.communityReport, "findUnique").mockResolvedValueOnce(mockReport as never);
    vi.spyOn(prisma.communityReport, "update").mockResolvedValueOnce({} as never);
    vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce({} as never);
    const auditSpy = vi.spyOn(prisma.auditEvent, "create").mockResolvedValueOnce({} as never);

    const req = new NextRequest("http://localhost:3000/api/admin/reports", {
      method: "PATCH",
      headers: { "x-user-id": "admin-1", "x-user-role": "college_admin" },
      body: JSON.stringify({
        reportId: "rep-audit-test",
        action: "APPROVE",
        moderatorNotes: "Approved by college security officer",
      }),
    });

    await patchAdminReport(req);

    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "admin-1",
          actorRole: "college_admin",
          action: "REPORT_APPROVED",
          targetResourceType: "CommunityReport",
          targetResourceId: "rep-audit-test",
        }),
      })
    );
  });

  // Safety Requirement 10: Public APIs do not expose private reporter/moderator data (SEC-04, OOS-04)
  it("Scenario 10: Public GET /api/patterns excludes reporterUserId, email, and internal moderator notes", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockPublicPatterns = [
      {
        id: "pat-public-1",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "exposed@upi",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        riskLevel: RiskLevel.HIGH_RISK,
        verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
        reportCount: 3,
        firstReportedAt: new Date("2026-09-01"),
        lastReportedAt: new Date("2026-09-25"),
        createdAt: new Date("2026-09-01"),
        metadataPayload: {},
        reports: [
          {
            id: "rep-p1",
            category: "UPI_REVERSE_PAYMENT_FRAUD",
            description: "QR scan scam request",
            createdAt: new Date("2026-09-20"),
            reporterUserId: "private-user-id-999",
            moderatorNotes: "Internal note: high confidence fraud",
          },
        ],
      },
    ];

    vi.spyOn(prisma.scamPattern, "findMany").mockResolvedValueOnce(mockPublicPatterns as never);
    vi.spyOn(prisma.scamPattern, "count").mockResolvedValueOnce(1 as never);

    const req = new NextRequest("http://localhost:3000/api/patterns?tier=verified");
    const res = await getPublicPatterns(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.patterns.length).toBe(1);

    const item = data.patterns[0];
    expect(item).not.toHaveProperty("reporterUserId");
    expect(item).not.toHaveProperty("reporterEmail");
    expect(item).not.toHaveProperty("moderatorNotes");
  });
});
