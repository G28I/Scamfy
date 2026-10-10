// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafetyDisclaimerTicker } from "@/components/shared/safety-disclaimer-ticker";

describe("SafetyDisclaimerTicker Component", () => {
  it("renders the safety disclaimer notice landmark with accessible label", () => {
    render(<SafetyDisclaimerTicker />);
    const landmark = screen.getByRole("complementary", { name: /Safety Disclaimer Notice/i });
    expect(landmark).toBeDefined();
  });

  it("displays the exact required disclaimer notice copy and official reporting channels", () => {
    render(<SafetyDisclaimerTicker />);

    // Header notice label
    expect(screen.getAllByText(/SCAMFY SAFETY NOTICE:/i).length).toBeGreaterThan(0);

    // Disclaimer core content
    expect(
      screen.getAllByText(/Scamfy highlights potential scam indicators; it cannot verify every claim/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Results are for awareness and educational purposes only, not financial or legal advice/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/A low-risk result does not guarantee safety/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Never share your OTP, UPI PIN, or password/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Be cautious of requests for upfront payments to release loans, refunds, prizes, or recover lost money/i).length
    ).toBeGreaterThan(0);

    // Official helpline and portal links
    const phoneLinks = screen.getAllByRole("link", { name: "1930" });
    expect(phoneLinks.length).toBeGreaterThan(0);
    expect(phoneLinks[0]?.getAttribute("href")).toBe("tel:1930");

    const portalLinks = screen.getAllByRole("link", { name: "cybercrime.gov.in" });
    expect(portalLinks.length).toBeGreaterThan(0);
    expect(portalLinks[0]?.getAttribute("href")).toBe("https://www.cybercrime.gov.in/");
  });

  it("marks duplicate ticker track with aria-hidden and makes its links keyboard-unfocusable", () => {
    const { container } = render(<SafetyDisclaimerTicker />);
    
    // Explicit duplicate track container has aria-hidden="true"
    const duplicateTrack = screen.getByTestId("ticker-duplicate-track");
    expect(duplicateTrack).toBeDefined();
    expect(duplicateTrack.getAttribute("aria-hidden")).toBe("true");
    expect(duplicateTrack.className).toContain("motion-reduce:hidden");

    // Duplicate track links have tabIndex="-1" to prevent keyboard navigation into aria-hidden content
    const duplicateLinks = duplicateTrack.querySelectorAll("a");
    expect(duplicateLinks.length).toBe(2);
    duplicateLinks.forEach((link) => {
      expect(link.getAttribute("tabindex")).toBe("-1");
      expect(link.getAttribute("aria-hidden")).toBe("true");
    });

    // Primary track links are normal and keyboard-focusable
    const primaryTrack = screen.getByTestId("ticker-primary-track");
    const primaryLinks = primaryTrack.querySelectorAll("a");
    expect(primaryLinks.length).toBe(2);
    primaryLinks.forEach((link) => {
      expect(link.getAttribute("tabindex")).toBeNull();
      expect(link.getAttribute("aria-hidden")).toBeNull();
    });

    // Standard accessible role queries return ONLY the primary links (2 links total, not 4)
    const accessibleLinks = screen.getAllByRole("link");
    expect(accessibleLinks.length).toBe(2);

    // Reduced motion classes are present to allow full reading without clipping
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("motion-reduce:overflow-visible");
    expect(aside?.className).toContain("motion-reduce:select-text");
  });
});
