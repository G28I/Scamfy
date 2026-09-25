// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskBadge, type RiskLevel } from "@/components/domain/risk-badge";

describe("RiskBadge component", () => {
  const levels: RiskLevel[] = ["SAFE", "CAUTION", "SUSPICIOUS", "HIGH_RISK", "CRITICAL"];

  it.each(levels)("renders %s tier with accessible role and distinct label", (level) => {
    render(<RiskBadge level={level} />);
    const badge = screen.getByRole("status");
    expect(badge).toBeDefined();
    expect(badge.getAttribute("aria-label")).toContain("Risk Level");
  });

  it("renders custom label when provided", () => {
    render(<RiskBadge level="CRITICAL" customLabel="Immediate Loss Detected" />);
    expect(screen.getByText("Immediate Loss Detected")).toBeDefined();
  });
});
