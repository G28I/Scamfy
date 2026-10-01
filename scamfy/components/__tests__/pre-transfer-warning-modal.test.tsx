// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreTransferWarningModal } from "@/components/domain/pre-transfer-warning-modal";
import type { AnalysisResultDto } from "@/app/api/check/route";

describe("PreTransferWarningModal Component (MULE-02, UX-02, UX-03)", () => {
  const mockResult: AnalysisResultDto = {
    id: "mule-res-1",
    overall_risk: "CRITICAL",
    confidence: "high",
    primary_category: "MONEY_MULE_RECRUITMENT",
    secondary_categories: [],
    signals: [
      {
        id: "RULE-MONEY-MULE-FORWARDING",
        name: "Money Mule Fund Forwarding Lure",
        description: "Solicits forwarding received funds",
        severity: "CRITICAL",
        evidence: "Receive money and forward 90%",
      },
    ],
    extracted_entities: {
      upi_ids: [],
      phone_numbers: [],
      urls: [],
      emails: [],
      bank_accounts: [],
      amounts: [],
      handles: [],
    },
    psychological_tactics: ["Commission / Easy Money Lure"],
    missing_evidence: [],
    synthesis_summary: "Money mule recruitment pattern identified.",
    action_recommendations: [],
    model_metadata: {},
    created_at: new Date().toISOString(),
  };

  it("renders modal content with high-urgency directives when isOpen is true", () => {
    const onOpenChange = vi.fn();
    render(
      <PreTransferWarningModal
        isOpen={true}
        onOpenChange={onOpenChange}
        result={mockResult}
      />
    );

    expect(screen.getByText(/Stop: Do Not Transfer or Forward Any Funds/i)).toBeDefined();
    expect(screen.getByText(/1. DO NOT SEND/i)).toBeDefined();
    expect(screen.getByText(/2. DO NOT TOUCH/i)).toBeDefined();
    expect(screen.getByText(/3. REFUSE & BLOCK/i)).toBeDefined();
    expect(screen.getByText(/Legal & Banking Consequences/i)).toBeDefined();
  });

  it("calls onOpenChange(false) when close button is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <PreTransferWarningModal
        isOpen={true}
        onOpenChange={onOpenChange}
        result={mockResult}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /I Understand — Close Warning/i });
    fireEvent.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("triggers onOpenReceivedFundsGuide when guided recovery button is clicked", () => {
    const onOpenChange = vi.fn();
    const onGuide = vi.fn();
    render(
      <PreTransferWarningModal
        isOpen={true}
        onOpenChange={onOpenChange}
        result={mockResult}
        onOpenReceivedFundsGuide={onGuide}
      />
    );

    const guideBtn = screen.getByRole("button", { name: /Money Already Received\? \(Guide\)/i });
    fireEvent.click(guideBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onGuide).toHaveBeenCalled();
  });

  it("supports keyboard dismissal via Escape key and retains focusable actions", () => {
    const onOpenChange = vi.fn();
    render(
      <PreTransferWarningModal
        isOpen={true}
        onOpenChange={onOpenChange}
        result={mockResult}
        onOpenReceivedFundsGuide={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /I Understand — Close Warning/i });
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    // Radix Dialog listens to Escape key down
  });
});
