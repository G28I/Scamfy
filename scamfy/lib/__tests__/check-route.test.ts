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

  it("analyzes valid suspicious message and returns 200 with structured analysis payload", async () => {
    const sampleMessage =
      "Dear customer, your electricity bill is unpaid. Power will be disconnected tonight. Call officer at 9876543210.";
    const req = new NextRequest("http://localhost:3000/api/check", {
      method: "POST",
      body: JSON.stringify({ text: sampleMessage }),
      headers: { "Content-Type": "application/json" },
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
});
