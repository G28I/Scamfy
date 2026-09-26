// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IntelPage from "@/app/intel/page";

const mockPatternsResponse = {
  patterns: [
    {
      id: "pat-1",
      indicatorType: "UPI_ID",
      indicatorValue: "scamvpa@okhdfc",
      category: "UPI_REVERSE_PAYMENT_FRAUD",
      riskLevel: "CRITICAL",
      verificationStatus: "MODERATOR_VERIFIED",
      reportCount: 12,
      firstReportedAt: "2026-09-20T10:00:00Z",
      lastReportedAt: "2026-09-26T10:00:00Z",
    },
  ],
  total: 1,
  limit: 20,
  offset: 0,
};

describe("IntelPage Component (REP-04)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPatternsResponse,
    });
  });

  it("renders header, verified tab, and fetches verified patterns by default", async () => {
    render(<IntelPage />);

    expect(screen.getByText("Community Scam Intelligence")).toBeDefined();
    expect(screen.getByText("Verified Pattern Signatures")).toBeDefined();
    expect(screen.getByText("Unverified Community Reports")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("scamvpa@okhdfc")).toBeDefined();
      expect(screen.getByText("Verified Pattern Signature")).toBeDefined();
      expect(screen.getByText("12 reports")).toBeDefined();
    });
  });

  it("switches to Unverified Community Reports tab and updates view", async () => {
    const mockUnverifiedResponse = {
      patterns: [
        {
          id: "pat-2",
          indicatorType: "PHONE",
          indicatorValue: "9876543210",
          category: "UTILITY_ELECTRICITY_FRAUD",
          riskLevel: "HIGH_RISK",
          verificationStatus: "UNVERIFIED",
          reportCount: 2,
          firstReportedAt: "2026-09-26T10:00:00Z",
          lastReportedAt: "2026-09-26T10:00:00Z",
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUnverifiedResponse,
    });

    render(<IntelPage />);

    const unverifiedTabBtn = screen.getByRole("button", {
      name: /Unverified Community Reports/i,
    });
    fireEvent.click(unverifiedTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Unverified Community Submissions/i)).toBeDefined();
      expect(screen.getByText("9876543210")).toBeDefined();
      expect(screen.getByText("Unverified Community Report")).toBeDefined();
    });
  });

  it("opens report indicator dialog when report button is clicked", () => {
    render(<IntelPage />);

    const reportBtn = screen.getByRole("button", { name: /Report Suspicious Indicator/i });
    fireEvent.click(reportBtn);

    expect(
      screen.getByRole("heading", { name: "Report Suspicious Indicator" })
    ).toBeDefined();
    expect(screen.getByLabelText(/Indicator Type/i)).toBeDefined();
  });
});
