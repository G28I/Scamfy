// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScamCheckResult } from "@/components/domain/scam-check-result";
import type { AnalysisResultDto } from "@/app/api/check/route";

describe("Money Mule Protection Integration Suite (MULE-01, MULE-02, MULE-03, UX-02)", () => {
  const muleAnalysisResult: AnalysisResultDto = {
    id: "mule-int-101",
    overall_risk: "CRITICAL",
    confidence: "high",
    primary_category: "MONEY_MULE_RECRUITMENT",
    secondary_categories: [],
    signals: [
      {
        id: "RULE-MONEY-MULE-FORWARDING",
        name: "Money Mule Fund Forwarding Lure",
        description: "Solicits receiving and forwarding third-party funds",
        severity: "CRITICAL",
        evidence: "Receive ₹50,000, keep 10% commission, forward remaining to merchant@paytm",
      },
    ],
    extracted_entities: {
      upi_ids: ["merchant@paytm"],
      phone_numbers: [],
      urls: [],
      emails: [],
      bank_accounts: [],
      amounts: ["₹50,000", "10%", "₹5,000", "₹45,000"],
      handles: [],
    },
    psychological_tactics: ["Commission / Easy Money Lure", "Layering / Mule Exploitation"],
    missing_evidence: ["No verifiable corporate domain, official email header, or sender identity."],
    synthesis_summary: "Critical threat: Message solicits money mule forwarding via personal bank account.",
    action_recommendations: [
      "CRITICAL: Do NOT receive or forward third-party funds through your personal bank account or UPI.",
      "Allowing your account to route unsolicited funds risks immediate bank debit holds and law enforcement scrutiny.",
      "Refuse the proposal and do not touch, spend, or transfer any unsolicited funds.",
    ],
    model_metadata: {
      engine: "deterministic-v2",
      ai_assisted: false,
    },
    created_at: new Date().toISOString(),
  };

  const safeAnalysisResult: AnalysisResultDto = {
    id: "safe-int-102",
    overall_risk: "SAFE",
    confidence: "low",
    primary_category: "INFORMATIONAL_OR_UNKNOWN",
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
    psychological_tactics: [],
    missing_evidence: [],
    synthesis_summary: "Standard meeting invitation.",
    action_recommendations: [
      "No active high-risk scam patterns detected in this message.",
    ],
    model_metadata: {},
    created_at: new Date().toISOString(),
  };

  it("triggers pre-transfer warning modal and dedicated mule banner for money mule threats", () => {
    render(<ScamCheckResult result={muleAnalysisResult} />);

    // Warning modal header
    expect(screen.getByText(/Stop: Do Not Transfer or Forward Any Funds/i)).toBeDefined();
    // Dedicated banner in result
    expect(screen.getByText(/Money-Mule \/ Account Rental Risk Detected/i)).toBeDefined();
    expect(screen.getByText(/Money-Mule Solicitation & Fund Routing Scheme/i)).toBeDefined();
  });

  it("opens received funds guide when requested from the mule banner", () => {
    render(<ScamCheckResult result={muleAnalysisResult} />);

    // Close the initial modal
    const closeBtn = screen.getByRole("button", { name: /I Understand — Close Warning/i });
    fireEvent.click(closeBtn);

    // Click Guide button in the dedicated banner
    const guideToggleBtn = screen.getByRole("button", { name: /Received Unsolicited Money\? \(Guide\)/i });
    fireEvent.click(guideToggleBtn);

    // Verify Step 1 is rendered
    expect(screen.getByText(/Received Unsolicited Money\? Safe Action Protocol/i)).toBeDefined();
    expect(screen.getByText(/Step 1: Immediate Fund Isolation & Freeze Protocol/i)).toBeDefined();

    // Navigate to Step 2 (Bank Notice Generator)
    const nextBtn = screen.getByRole("button", { name: /Next Step/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 2: Formal Bank Notification/i)).toBeDefined();
  });

  it("does not display money mule banners or modals for safe messages", () => {
    render(<ScamCheckResult result={safeAnalysisResult} />);

    expect(screen.queryByText(/Stop: Do Not Transfer or Forward Any Funds/i)).toBeNull();
    expect(screen.queryByText(/Money-Mule \/ Account Rental Risk Detected/i)).toBeNull();
    expect(screen.getByText(/Standard \/ Informational Message/i)).toBeDefined();
  });
});
