// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CookieConsent } from "@/components/domain/cookie-consent";
import { getConsentStatus, setConsentStatus, trackEvent, CONSENT_STORAGE_KEY } from "@/lib/analytics";

describe("Cookie Consent and Privacy-Preserving Analytics", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders cookie consent banner when user has not made a decision", async () => {
    render(<CookieConsent />);
    
    // Allow effect to execute
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(screen.getByRole("region", { name: /Privacy & Cookie Preferences/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Accept Telemetry/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Essential Only/i })).toBeDefined();
  });

  it("persists acceptance to localStorage and dismisses banner on Accept", async () => {
    render(<CookieConsent />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const acceptButton = screen.getByRole("button", { name: /Accept Telemetry/i });
    act(() => {
      fireEvent.click(acceptButton);
    });

    expect(getConsentStatus()).toBe("accepted");
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("accepted");
  });

  it("persists rejection to localStorage and dismisses banner on Essential Only", async () => {
    render(<CookieConsent />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const rejectButton = screen.getByRole("button", { name: /Essential Only/i });
    act(() => {
      fireEvent.click(rejectButton);
    });

    expect(getConsentStatus()).toBe("rejected");
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("rejected");
  });

  it("does not track telemetry when consent is rejected or not granted", () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    // Case 1: No consent
    trackEvent("scam_check_started");
    expect(consoleSpy).not.toHaveBeenCalled();

    // Case 2: Rejected consent
    setConsentStatus("rejected");
    trackEvent("scam_check_started");
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("tracks privacy-safe telemetry when consent is accepted", () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    setConsentStatus("accepted");
    trackEvent("scam_check_completed", {
      risk_level: "HIGH",
      is_emergency: true,
      indicator_count: 2,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Scamfy Analytics] Event: scam_check_completed",
      {
        risk_level: "HIGH",
        is_emergency: true,
        indicator_count: 2,
      }
    );

    consoleSpy.mockRestore();
  });
});
