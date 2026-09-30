import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/reports/route";
import { NextRequest } from "next/server";
import { IndicatorType, RiskLevel, VerificationStatus, UserRole } from "@prisma/client";

let mockClerkUserId: string | null = "user-123";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({
    userId: mockClerkUserId,
  })),
  clerkMiddleware: vi.fn(() => () => {}),
}));

describe("Community Reports BFF Route (/api/reports)", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    mockClerkUserId = "user-123";
    const { prisma } = await import("@/lib/prisma");
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return cb(prisma);
      }
      return cb;
    });

    vi.spyOn(prisma.user, "upsert").mockResolvedValue({
      id: "user-123",
      clerkUserId: "user-123",
      email: "user@college.edu",
      role: UserRole.student_user,
    } as never);
  });

  it("rejects missing authentication on POST with status 401", async () => {
    mockClerkUserId = null;
    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scam@upi",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Valid description here",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("rejects missing authentication on GET with status 401", async () => {
    mockClerkUserId = null;
    const req = new NextRequest("http://localhost:3000/api/reports");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("ValidationError");
    expect(data.message).toContain("Description must be at least 5 characters");
  });

  it("successfully creates report and returns 201 with pattern details", async () => {
    const { prisma } = await import("@/lib/prisma");

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

    vi.spyOn(prisma.scamPattern, "upsert").mockResolvedValueOnce(mockPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValueOnce(mockReport as never);

    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scamvpa@icici",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Demanded UPI PIN for reward",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.reportId).toBe("rep-123");
    expect(data.patternId).toBe("pat-123");
    expect(data.status).toBe("PENDING");
    expect(data.indicatorValue).toBe("scamvpa@icici");
  });

  it("returns generic 500 error when unexpected database failure occurs", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.spyOn(prisma.scamPattern, "upsert").mockRejectedValueOnce(new Error("Database connection lost"));

    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scamvpa@icici",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Demanded UPI PIN for reward",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("InternalError");
    expect(data.message).toBe("Failed to submit report.");
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

    const req = new NextRequest("http://localhost:3000/api/reports");

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reports.length).toBe(1);
    expect(data.reports[0].indicatorValue).toBe("scam@upi");
  });

  it("enforces rate limit of 10 requests per minute per user/ip", async () => {
    const { prisma } = await import("@/lib/prisma");
    mockClerkUserId = "ratelimit-user";

    const mockPattern = { id: "p-1", reportCount: 1 };
    const mockReport = { id: "r-1", status: "PENDING" };
    vi.spyOn(prisma.scamPattern, "upsert").mockResolvedValue(mockPattern as never);
    vi.spyOn(prisma.communityReport, "create").mockResolvedValue(mockReport as never);

    // Make 10 valid requests
    for (let i = 0; i < 10; i++) {
      const req = new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify({
          indicatorType: IndicatorType.UPI_ID,
          indicatorValue: `scam${i}@okhdfc`,
          category: "UPI_REVERSE_PAYMENT_FRAUD",
          description: "Valid description here",
        }),
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "10.0.0.1",
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    }

    // 11th request should be rejected with 429
    const req11 = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        indicatorType: IndicatorType.UPI_ID,
        indicatorValue: "scam11@okhdfc",
        category: "UPI_REVERSE_PAYMENT_FRAUD",
        description: "Valid description here",
      }),
      headers: {
        "Content-Type": "application/json",
        "x-real-ip": "10.0.0.1",
      },
    });
    const res11 = await POST(req11);
    expect(res11.status).toBe(429);
    const data = await res11.json();
    expect(data.error).toBe("RateLimitExceeded");
  });
});
