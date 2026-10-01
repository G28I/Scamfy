import { describe, it, expect } from "vitest";
import { isMoneyMuleRisk, getMuleSignals, generateBankLienNoticeTemplate } from "@/lib/mule";
import type { AnalysisResultDto } from "@/app/api/check/route";

describe("Money Mule Detection Helpers & Bank Notice Generator (lib/mule)", () => {
  it("detects money mule risk when primary category is MONEY_MULE_RECRUITMENT", () => {
    const mockResult: AnalysisResultDto = {
      id: "res-1",
      overall_risk: "CRITICAL",
      confidence: "high",
      primary_category: "MONEY_MULE_RECRUITMENT",
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
      synthesis_summary: "Money mule threat detected.",
      action_recommendations: [],
      model_metadata: {},
      created_at: new Date().toISOString(),
    };

    expect(isMoneyMuleRisk(mockResult)).toBe(true);
  });

  it("detects money mule risk when secondary category matches", () => {
    const mockResult: AnalysisResultDto = {
      id: "res-2",
      overall_risk: "CRITICAL",
      confidence: "high",
      primary_category: "TASK_COMMISSION_FRAUD",
      secondary_categories: ["MONEY_MULE_RECRUITMENT"],
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
      synthesis_summary: "Task scam with mule signals.",
      action_recommendations: [],
      model_metadata: {},
      created_at: new Date().toISOString(),
    };

    expect(isMoneyMuleRisk(mockResult)).toBe(true);
  });

  it("detects money mule risk when signal ID matches RULE-MONEY-MULE-FORWARDING", () => {
    const mockResult: AnalysisResultDto = {
      id: "res-3",
      overall_risk: "CRITICAL",
      confidence: "high",
      primary_category: "SUSPICIOUS_COMMUNICATION",
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
      psychological_tactics: [],
      missing_evidence: [],
      synthesis_summary: "Mule signals present.",
      action_recommendations: [],
      model_metadata: {},
      created_at: new Date().toISOString(),
    };

    expect(isMoneyMuleRisk(mockResult)).toBe(true);
    const muleSignals = getMuleSignals(mockResult);
    expect(muleSignals.length).toBe(1);
    expect(muleSignals[0]?.id).toBe("RULE-MONEY-MULE-FORWARDING");
  });

  it("returns false for benign results without mule categories or signals", () => {
    const mockResult: AnalysisResultDto = {
      id: "res-4",
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
      synthesis_summary: "Safe message.",
      action_recommendations: [],
      model_metadata: {},
      created_at: new Date().toISOString(),
    };

    expect(isMoneyMuleRisk(mockResult)).toBe(false);
    expect(getMuleSignals(mockResult)).toEqual([]);
    expect(isMoneyMuleRisk(null)).toBe(false);
  });

  it("generates a formatted bank lien notice template with supplied details", () => {
    const template = generateBankLienNoticeTemplate({
      accountHolderName: "Aarav Sharma",
      bankName: "State Bank of India",
      accountNumber: "30012345678",
      transactionRefOrUtr: "UPI/329482938492",
      transactionDate: "2026-10-01",
      amount: "45,000",
      senderIdentifier: "fraudster@upi",
      communicationChannel: "Telegram",
    });

    expect(template).toContain("State Bank of India");
    expect(template).toContain("Aarav Sharma");
    expect(template).toContain("A/C: 30012345678");
    expect(template).toContain("UPI/329482938492");
    expect(template).toContain("₹45,000");
    expect(template).toContain("temporary debit hold / lien");
    expect(template).toContain("NCRP / 1930");
  });
});
