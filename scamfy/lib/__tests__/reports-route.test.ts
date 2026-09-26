import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/reports/route";
import { NextRequest } from "next/server";
import { IndicatorType, RiskLevel, VerificationStatus } from "@prisma/client";

describe("Community Reports BFF Route (/api/reports)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects missing or invalid indicatorType with status 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: "INVALID_TYPE",
        indicatorValue: "user@okhdfc",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Valid description here",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("ValidationError");
    expect(data.message).toContain("indicatorType");
  });

  it("rejects too short description with status 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "user@okhdfc",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "hi",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("ValidationError");
    expect(data.message).toContain("Description must be at least 5 characters");
  });

  it("successfully creates report and returns 201 with pattern details", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockUser = { id: "user-123", clerkUserId: "clerk-123" };
    const mockPattern = {
      id: "pat-123",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "scamvpa@icici",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      riskLevel: RiskLevel.HIGH_RISK,
      verificationStatus: VerificationStatus.UNVERIFIED,
      reportCount: 1,
      firstReportedAt: new Date(),
      lastReportedAt: new Date(),
    };
    const mockReport = {
      id: "rep-123",
      reporterUserId: "user-123",
      patternId: "pat-123",
      indicatorType: IndicatorType.UPI_ID,
      indicatorValue: "scamvpa@icici",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      description: "Demanded UPI PIN for reward",
      status: "PENDING",
      createdAt: new Date(),
    };

    vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce(mockUser as never);
    vi.spyOn(prisma.scamPattern, "findUnique").mockResolvedValueOnce(null);
    vi.spyOn(prisma.scamPattern, "create").mockResolvedValueOnce(mockPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockReport as never);

    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scamvpa@icici",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Demanded UPI PIN for reward",
      }),
      headers: { "Content-Type": "application/json", "x-user-id": "user-123" },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.reportId).toBe("rep-123");
    expect(data.patternId).toBe("pat-123");
    expect(data.status).toBe("PENDING");
    expect(data.indicatorValue).toBe("scamvpa@icici");
  });

  it("returns user reports via GET /api/reports", async () => {
    const { prisma } = await import("@/lib/prisma");
    const mockReports = [
      {
        id: "rep-1",
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scam@upi",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Test description",
        status: "PENDING",
        createdAt: new Date("2026-09-26T10:00:00Z"),
      },
    ];

    vi.spyOn(prisma.communityReport, "findMany").mockResolvedValueOnce(mockReports as never);

    const req = new NextRequest("http://localhost:3000/api/reports", {
      headers: { "x-user-id": "user-123" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reports.length).toBe(1);
    expect(data.reports[0].indicatorValue).toBe("scam@upi");
  });
});
