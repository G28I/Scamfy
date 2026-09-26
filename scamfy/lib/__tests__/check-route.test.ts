import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/check/route";
import { NextRequest } from "next/server";

describe("Scam Check BFF Route (/api/check)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects missing or empty text payload with status 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("ValidationError");
    expect(data.message).toContain("at least 3 characters");
  });

  it("rejects oversized text payload with status 400", async () => {
    const hugeText = "a".repeat(10001);
    const req = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: hugeText }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("ValidationError");
    expect(data.message).toContain("cannot exceed 10,000 characters");
  });

  it("handles upstream FastAPI failure by returning 503 error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const req = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: "Suspicious message text that cannot reach backend" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.99" },
    });

    const res = await POST(req);
    expect(res.status).toBe(503);

    const data = await res.json();
    expect(data.error).toBe("AnalysisServiceUnavailable");
    expect(data.message).toContain("temporarily unavailable");
  });

  it("analyzes valid suspicious message and returns 200 with structured analysis payload", async () => {
    const mockFastApiResponse = {
      overall_risk: "CRITICAL",
      confidence: "high",
      primary_category: "UTILITY_ELECTRICITY_FRAUD",
      secondary_categories: [],
      signals: [
        {
          id: "RULE-ELECTRICITY-DISCONNECTION",
          name: "Urgent Electricity Disconnection Threat",
          description: "Official providers never disconnect via SMS",
          severity: "CRITICAL",
          evidence: "disconnected tonight",
        },
      ],
      extracted_entities: {
        upi_ids: [],
        phone_numbers: ["9876543210"],
        urls: [],
        emails: [],
        bank_accounts: [],
        amounts: [],
        handles: [],
      },
      action_recommendations: ["Do not call the mobile number."],
      model_metadata: { engine: "deterministic-v1" },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFastApiResponse,
    });

    const sampleMessage =
      "Dear customer, your electricity bill is unpaid. Power will be disconnected tonight. Call officer at 9876543210.";
    const req = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: sampleMessage }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.overall_risk).toBe("CRITICAL");
    expect(data.primary_category).toBe("UTILITY_ELECTRICITY_FRAUD");
    expect(data.signals.length).toBeGreaterThanOrEqual(1);
    expect(data.extracted_entities.phone_numbers).toContain("9876543210");
    expect(data.action_recommendations.length).toBeGreaterThanOrEqual(1);
    expect(data.created_at).toBeDefined();
  });

  it("enforces rate limiting by returning 429 when threshold is exceeded", async () => {
    const testIp = "192.168.100.50";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        overall_risk: "SAFE",
        confidence: "low",
        primary_category: "INFORMATIONAL",
        secondary_categories: [],
        signals: [],
        extracted_entities: {
          upi_ids: [],
          phone_numbers: [],
          urls: [],
          emails: [],
          bank_accounts: [],
          amounts: [],
          handles: [],
        },
        action_recommendations: [],
        model_metadata: {},
      }),
    });

    // Make 30 requests
    for (let i = 0; i < 30; i++) {
      const req = new NextRequest("http://localhost:3000/api/check", {
        method: "POST",
        body: JSON.stringify({ text: `Message check iteration ${i}` }),
        headers: { "Content-Type": "application/json", "x-forwarded-for": testIp },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 31st request should trigger 429
    const blockedReq = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: "Message check rate limited request" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": testIp },
    });
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);

    const blockedData = await blockedRes.json();
    expect(blockedData.error).toBe("RateLimitExceeded");
    expect(blockedRes.headers.get("Retry-After")).toBe("60");
  });

  it("returns 500 PersistenceError when database insert fails", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.spyOn(prisma.scamCheck, "create").mockRejectedValueOnce(new Error("DB Connection Error"));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        overall_risk: "SAFE",
        confidence: "low",
        primary_category: "INFORMATIONAL",
        secondary_categories: [],
        signals: [],
        extracted_entities: {
          upi_ids: [],
          phone_numbers: [],
          urls: [],
          emails: [],
          bank_accounts: [],
          amounts: [],
          handles: [],
        },
        action_recommendations: [],
        model_metadata: {},
      }),
    });

    const req = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: "Valid test message for persistence failure" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.200" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("PersistenceError");
    expect(data.message).toContain("Unable to record");
  });
});

