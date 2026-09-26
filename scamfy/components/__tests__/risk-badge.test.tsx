// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskBadge, type RiskLevel } from "@/components/domain/risk-badge";

describe("RiskBadge component", () => {
  const expectedTierMap: Array<{ level: RiskLevel; expectedText: string }> = [
    { level: "SAFE", expectedText: "Safe / Verified" },
    { level: "CAUTION", expectedText: "Caution Advised" },
    { level: "SUSPICIOUS", expectedText: "Suspicious Activity" },
    { level: "HIGH_RISK", expectedText: "High Risk Scam" },
    { level: "CRITICAL", expectedText: "Critical Threat (Immediate Loss)" },
  ];

  it.each(expectedTierMap)(
    "renders $level tier with visible text '$expectedText' and matching accessible aria-label",
    ({ level, expectedText }) => {
      render(<RiskBadge level={level} />);
      const badge = screen.getByRole("status");
      expect(badge).toBeDefined();
      expect(badge.getAttribute("aria-label")).toBe(`Risk Level: ${expectedText}`);
      expect(screen.getByText(expectedText)).toBeDefined();
    }
  );

  it("renders custom label in visible text and accessible aria-label when provided", () => {
    render(<RiskBadge level="CRITICAL" customLabel="Immediate Loss Detected" />);
    const badge = screen.getByRole("status");
    expect(badge.getAttribute("aria-label")).toBe("Risk Level: Immediate Loss Detected");
    expect(screen.getByText("Immediate Loss Detected")).toBeDefined();
  });
});
