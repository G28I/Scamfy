// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfidenceMeter } from "@/components/domain/confidence-meter";

describe("ConfidenceMeter component", () => {
  it("renders analysis confidence region with accessible label", () => {
    render(<ConfidenceMeter level="high" signalCount={4} />);
    const region = screen.getByRole("region");
    expect(region).toBeDefined();
    expect(region.getAttribute("aria-label")).toContain("High Analysis Confidence");
  });

  it("explicitly presents confidence as signal strength without legal certainty", () => {
    render(<ConfidenceMeter level="low" />);
    expect(screen.getByText(/Indicates signal correlation strength/i)).toBeDefined();
  });
});
