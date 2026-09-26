import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndicatorType, RiskLevel, VerificationStatus } from "@prisma/client";
import { normalizeIndicator, validateIndicator } from "@/lib/indicators";
import { ingestCommunityReport, listPublicPatterns } from "@/lib/services/pattern-service";
import { prisma } from "@/lib/prisma";

describe("Indicator Normalization & Validation (REP-01, REP-03)", () => {
  it("normalizes and validates UPI IDs", () => {
    const valid = validateIndicator(IndicatorType.UPI_ID, "  BillDesk@OkHdfcBank  ");
    expect(valid.valid).toBe(true);
    expect(valid.normalizedValue).toBe("billdesk@okhdfcbank");

    const invalid = validateIndicator(IndicatorType.UPI_ID, "not-a-upi-id");
    expect(invalid.valid).toBe(false);
    expect(invalid.error).toContain("Invalid UPI ID");
  });

  it("normalizes Indian phone numbers with country code or 0 prefix", () => {
    const withPlus91 = validateIndicator(IndicatorType.PHONE, "+91 98765-43210");
    expect(withPlus91.valid).toBe(true);
    expect(withPlus91.normalizedValue).toBe("9876543210");

    const withZero = validateIndicator(IndicatorType.PHONE, "09876543210");
    expect(withZero.valid).toBe(true);
    expect(withZero.normalizedValue).toBe("9876543210");

    const invalid = validateIndicator(IndicatorType.PHONE, "12345");
    expect(invalid.valid).toBe(false);
  });

  it("normalizes URLs and domain names", () => {
    const url = validateIndicator(IndicatorType.DOMAIN, "https://www.scam-portal.xyz/path/to/page");
    expect(url.valid).toBe(true);
    expect(url.normalizedValue).toBe("scam-portal.xyz");

    const shortUrl = validateIndicator(IndicatorType.DOMAIN, "bit.ly/fake-kyc");
    expect(shortUrl.valid).toBe(true);
    expect(shortUrl.normalizedValue).toBe("bit.ly");
  });

  it("normalizes handles and bank account numbers", () => {
    const handle = normalizeIndicator(IndicatorType.HANDLE, "@VIP_Tasks_Official");
    expect(handle).toBe("vip_tasks_official");

    const bank = normalizeIndicator(IndicatorType.BANK_ACC, "hdfc0001234 - 502812345678");
    expect(bank).toBe("HDFC0001234 502812345678");
  });
});

describe("Pattern Service Ingestion & Deduplication (REP-01, REP-02, REP-03)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a new UNVERIFIED ScamPattern when indicator is reported for the first time", async () => {
    const mockCreatedPattern = {
      id: "pat-1",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "scammer@paytm",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      riskLevel: RiskLevel.HIGH_RISK,
      verificationStatus: VerificationStatus.UNVERIFIED,
      reportCount: 1,
      firstReportedAt: new Date("2026-09-26T10:00:00Z"),
      lastReportedAt: new Date("2026-09-26T10:00:00Z"),
      metadataPayload: {},
      createdAt: new Date("2026-09-26T10:00:00Z"),
      updatedAt: new Date("2026-09-26T10:00:00Z"),
    };

    const mockCreatedReport = {
      id: "rep-1",
      reporterUserId: "user-1",
      patternId: "pat-1",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "scammer@paytm",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      description: "Asked me to enter UPI PIN to receive refund",
      status: "PENDING",
      moderatorNotes: null,
      createdAt: new Date("2026-09-26T10:00:00Z"),
      updatedAt: new Date("2026-09-26T10:00:00Z"),
    };

    vi.spyOn(prisma.scamPattern, "findUnique").mockResolvedValueOnce(null);
    vi.spyOn(prisma.scamPattern, "create").mockResolvedValueOnce(mockCreatedPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockCreatedReport as never);

    const { report, pattern } = await ingestCommunityReport(
      {
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "Scammer@Paytm",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Asked me to enter UPI PIN to receive refund",
      },
      "user-1"
    );

    expect(pattern.id).toBe("pat-1");
    expect(pattern.reportCount).toBe(1);
    expect(pattern.verificationStatus).toBe(VerificationStatus.UNVERIFIED);
    expect(report.patternId).toBe("pat-1");
    expect(report.reporterUserId).toBe("user-1");
  });

  it("deduplicates existing pattern by incrementing reportCount and preserving verificationStatus", async () => {
    const existingPattern = {
      id: "pat-existing-1",
      indicatorType: IndicatorType.PHONE,
      indicatorValue: "9876543210",
      category: "UTILITY_ELECTRICITY_FRAUD",
      riskLevel: RiskLevel.HIGH_RISK,
      verificationStatus: VerificationStatus.UNVERIFIED,
      reportCount: 3,
      firstReportedAt: new Date("2026-09-25T10:00:00Z"),
      lastReportedAt: new Date("2026-09-25T12:00:00Z"),
      metadataPayload: {},
      createdAt: new Date("2026-09-25T10:00:00Z"),
      updatedAt: new Date("2026-09-25T12:00:00Z"),
    };

    const updatedPattern = {
      ...existingPattern,
      reportCount: 4,
      lastReportedAt: new Date("2026-09-26T14:00:00Z"),
    };

    const mockReport = {
      id: "rep-2",
      reporterUserId: "user-2",
      patternId: "pat-existing-1",
      indicatorType: IndicatorType.PHONE,
      indicatorValue: "9876543210",
      category: "UTILITY_ELECTRICITY_FRAUD",
      description: "Got fake electricity disconnection SMS",
      status: "PENDING",
      moderatorNotes: null,
      createdAt: new Date("2026-09-26T14:00:00Z"),
      updatedAt: new Date("2026-09-26T14:00:00Z"),
    };

    vi.spyOn(prisma.scamPattern, "findUnique").mockResolvedValueOnce(existingPattern as never);
    vi.spyOn(prisma.scamPattern, "update").mockResolvedValueOnce(updatedPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockReport as never);

    const { report, pattern } = await ingestCommunityReport(
      {
        indicatorType: IndicatorType.PHONE,
        indicatorValue: "+91 98765 43210",
        category: "UTILITY_ELECTRICITY_FRAUD",
        description: "Got fake electricity disconnection SMS",
      },
      "user-2"
    );

    expect(pattern.reportCount).toBe(4);
    // CRITICAL SAFETY INVARIANT: Report volume accumulation alone NEVER promotes to MODERATOR_VERIFIED
    expect(pattern.verificationStatus).toBe(VerificationStatus.UNVERIFIED);
    expect(report.patternId).toBe("pat-existing-1");
  });

  it("lists public patterns strictly segmented by tier (REP-04)", async () => {
    const verifiedPattern = {
      id: "pat-v1",
      indicatorType: IndicatorType.DOMAIN,
      indicatorValue: "fake-sbi-portal.xyz",
      category: "BANK_KYC_PHISHING",
      riskLevel: RiskLevel.CRITICAL,
      verificationStatus: VerificationStatus.MODERATOR_VERIFIED,
      reportCount: 15,
      firstReportedAt: new Date("2026-09-20T10:00:00Z"),
      lastReportedAt: new Date("2026-09-26T10:00:00Z"),
      metadataPayload: {},
      createdAt: new Date("2026-09-20T10:00:00Z"),
      updatedAt: new Date("2026-09-26T10:00:00Z"),
    };

    vi.spyOn(prisma.scamPattern, "findMany").mockResolvedValueOnce([verifiedPattern as never]);
    vi.spyOn(prisma.scamPattern, "count").mockResolvedValueOnce(1);

    const result = await listPublicPatterns({ tier: "verified" });
    expect(result.patterns.length).toBe(1);
    expect(result.patterns[0]!.verificationStatus).toBe(VerificationStatus.MODERATOR_VERIFIED);
    expect(result.patterns[0]!.indicatorValue).toBe("fake-sbi-portal.xyz");
  });
});
