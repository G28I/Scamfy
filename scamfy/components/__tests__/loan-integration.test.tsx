// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScamCheckResult } from "@/components/domain/scam-check-result";
import { isLoanOrYieldRisk, getLoanSignals } from "@/lib/loan";
import type { AnalysisResultDto } from "@/app/api/check/route";

const mockLoanThreatResult: AnalysisResultDto = {
  id: "loan-res-1234",
  overall_risk: "CRITICAL",
  confidence: "high",
  primary_category: "PREDATORY_LOAN_FRAUD",
  secondary_categories: [],
  signals: [
    {
      id: "RULE-LOAN-7DAY-TENURE",
      name: "7-Day / Hyper-Short Predatory Loan Trap",
      description: "Offers instant micro-loans with 7-day repayment deadlines",
      severity: "CRITICAL",
      evidence: "Repay within 7 days",
    },
    {
      id: "RULE-LOAN-UPFRONT-DEDUCTION",
      name: "Excessive Upfront Loan Fee Deduction Trick",
      description: "Deducts 30% processing fee upfront",
      severity: "CRITICAL",
      evidence: "Deduct Rs 1500 processing fee",
    },
  ],
  extracted_entities: {
    upi_ids: [],
    phone_numbers: ["9876543210"],
    urls: ["https://instant-credit.apk"],
    emails: [],
    bank_accounts: [],
    amounts: ["Rs. 5,000", "Rs. 1,500"],
    handles: [],
  },
  psychological_tactics: ["Predatory Tenures", "Hidden Fee Deception"],
  missing_evidence: [
    "No standardized RBI Key Fact Statement (KFS), APR disclosure, or registered NBFC partner credentials.",
  ],
  synthesis_summary: "Critical threat: Predatory 7-day digital loan trap with heavy upfront deductions.",
  action_recommendations: [
    "Do not install unverified loan APKs.",
    "Verify the lender on the official RBI Sachet portal.",
  ],
  model_metadata: {
    engine: "hybrid-nemotron-v1",
    ai_assisted: true,
  },
  created_at: new Date().toISOString(),
};

const mockPonziThreatResult: AnalysisResultDto = {
  id: "ponzi-res-5678",
  overall_risk: "CRITICAL",
  confidence: "high",
  primary_category: "INVESTMENT_PONZI_FRAUD",
  secondary_categories: [],
  signals: [
    {
      id: "RULE-YIELD-GUARANTEED-DAILY-RETURN",
      name: "Guaranteed Daily/Weekly High-Yield Ponzi Lure",
      description: "Promises guaranteed 3% daily returns",
      severity: "CRITICAL",
      evidence: "Guaranteed return of 3% daily",
    },
  ],
  extracted_entities: {
    upi_ids: [],
    phone_numbers: [],
    urls: [],
    emails: [],
    bank_accounts: [],
    amounts: ["Rs. 10,000"],
    handles: ["@crypto_pool"],
  },
  psychological_tactics: ["Unrealistic Greed Lure"],
  missing_evidence: ["No SEBI registration number under BUDS Act, 2019."],
  synthesis_summary: "Critical threat: Ponzi scheme promising impossible daily returns.",
  action_recommendations: ["Do not invest in guaranteed daily yield schemes."],
  model_metadata: {
    engine: "hybrid-nemotron-v1",
  },
  created_at: new Date().toISOString(),
};

describe("Loan & High-Yield Protection Integration Suite (LOAN-01..03, UX-01)", () => {
  describe("isLoanOrYieldRisk & getLoanSignals helpers", () => {
    it("identifies loan risk from primary category", () => {
      expect(isLoanOrYieldRisk(mockLoanThreatResult)).toBe(true);
      expect(isLoanOrYieldRisk(mockPonziThreatResult)).toBe(true);

      const loanSignals = getLoanSignals(mockLoanThreatResult);
      expect(loanSignals.length).toBe(2);
      expect(loanSignals[0]?.id).toBe("RULE-LOAN-7DAY-TENURE");
    });

    it("returns false for benign/non-loan results", () => {
      const benignResult: AnalysisResultDto = {
        id: "benign-1",
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
        synthesis_summary: "Safe message",
        action_recommendations: [],
        model_metadata: {},
        created_at: new Date().toISOString(),
      };

      expect(isLoanOrYieldRisk(benignResult)).toBe(false);
      expect(getLoanSignals(benignResult)).toEqual([]);
      expect(isLoanOrYieldRisk(null)).toBe(false);
    });
  });

  describe("ScamCheckResult UI integration with LoanTrapAnalyzer", () => {
    it("renders dedicated predatory loan banner and toggles analyzer component", () => {
      render(<ScamCheckResult result={mockLoanThreatResult} onReset={vi.fn()} />);

      expect(screen.getByText(/Predatory Loan \/ High-Yield Trap Pattern Detected/i)).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Launch Loan & Yield Trap Analyzer/i })
      ).toBeDefined();

      // Click button to toggle the embedded loan analyzer
      const launchBtn = screen.getByRole("button", {
        name: /Launch Loan & Yield Trap Analyzer/i,
      });
      fireEvent.click(launchBtn);

      expect(screen.getByText(/Predatory Loan & High-Yield Trap Analyzer/i)).toBeDefined();
      expect(screen.getByText(/Instant Loan APR/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Hide Financial Trap Calculator/i })).toBeDefined();
    });

    it("renders loan threat banner for mixed loan and money-mule threats", () => {
      const mixedThreatResult: AnalysisResultDto = {
        ...mockLoanThreatResult,
        id: "mixed-threat-1",
        signals: [
          ...mockLoanThreatResult.signals,
          {
            id: "RULE-MULE-LOAN-ASSISTANCE-PRETEXT",
            name: "Loan Assistance & Banking Instrument Harvesting Mule Lure",
            description: "Mule recruitment under loan guise",
            severity: "CRITICAL",
            evidence: "Send blank signed cheque for loan",
          },
        ],
      };

      render(<ScamCheckResult result={mixedThreatResult} onReset={vi.fn()} />);

      // Both mule banner and loan banner should be rendered
      expect(screen.getByText(/Money-Mule \/ Account/i)).toBeDefined();
      expect(screen.getByText(/Predatory Loan \/ High-Yield Trap Pattern Detected/i)).toBeDefined();
    });
  });
});
