// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScamCheckForm, SAMPLE_PRESETS } from "@/components/domain/scam-check-form";
import { ScamCheckResult } from "@/components/domain/scam-check-result";
import HomePage from "@/app/page";
import type { AnalysisResultDto } from "@/app/api/check/route";

const mockAnalysisResult: AnalysisResultDto = {
  id: "test-uuid-1234-5678",
  overall_risk: "CRITICAL",
  confidence: "high",
  primary_category: "UTILITY_ELECTRICITY_FRAUD",
  secondary_categories: [],
  signals: [
    {
      id: "RULE-ELECTRICITY-DISCONNECTION",
      name: "Urgent Electricity Disconnection Threat",
      description: "Official electricity providers never issue disconnection notices via personal SMS.",
      severity: "CRITICAL",
      evidence: "disconnected tonight by 9:30 PM",
    },
  ],
  extracted_entities: {
    upi_ids: ["billdesk@okhdfcbank"],
    phone_numbers: ["9876543210"],
    urls: ["https://bit.ly/pay-now"],
    emails: ["support@discom.com"],
    bank_accounts: ["IFSC: HDFC0001234"],
    amounts: ["Rs. 1,450"],
    handles: ["@power_help"],
  },
  psychological_tactics: ["Artificial Urgency", "Fear of Utility Loss"],
  missing_evidence: ["No consumer ID / bill account number matching official state DISCOM records."],
  synthesis_summary: "Critical threat detected: Message matches urgent disconnection trap to extort funds.",
  action_recommendations: [
    "Do not call the phone number mentioned in the SMS.",
    "Verify bill status only on the official state DISCOM portal.",
  ],
  model_metadata: {
    engine: "hybrid-nemotron-v1",
    ai_assisted: true,
    model_slug: "nvidia/llama-3.1-nemotron-70b-instruct",
  },
  created_at: new Date().toISOString(),
};

describe("ScamCheckForm component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea, sample presets, and submit button", () => {
    render(<ScamCheckForm onAnalyze={vi.fn()} />);

    expect(screen.getByLabelText(/Suspicious message text for scam analysis/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Analyze Message" })).toBeDefined();
    expect(screen.getByText(/⚡ Electricity Cutoff/i)).toBeDefined();
    expect(screen.getByText(/💳 Fake Cashback/i)).toBeDefined();
  });

  it("populates textarea when a preset chip is clicked", () => {
    render(<ScamCheckForm onAnalyze={vi.fn()} />);

    const textarea = screen.getByLabelText(/Suspicious message text/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    const electricityBtn = screen.getByText(/⚡ Electricity Cutoff/i);
    fireEvent.click(electricityBtn);

    expect(textarea.value).toBe(SAMPLE_PRESETS[0]!.text);
  });

  it("triggers validation error when submitted with empty or too short input", () => {
    const handleAnalyze = vi.fn();
    render(<ScamCheckForm onAnalyze={handleAnalyze} />);

    const textarea = screen.getByLabelText(/Suspicious message text/i);
    fireEvent.change(textarea, { target: { value: "hi" } });

    const submitBtn = screen.getByRole("button", { name: "Analyze Message" });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/at least 3 characters/i)).toBeDefined();
    expect(handleAnalyze).not.toHaveBeenCalled();
  });

  it("calls onAnalyze with trimmed text when submitted with valid message", () => {
    const handleAnalyze = vi.fn();
    render(<ScamCheckForm onAnalyze={handleAnalyze} />);

    const textarea = screen.getByLabelText(/Suspicious message text/i);
    fireEvent.change(textarea, { target: { value: "   Suspicious electricity cutoff notice   " } });

    const submitBtn = screen.getByRole("button", { name: "Analyze Message" });
    fireEvent.click(submitBtn);

    expect(handleAnalyze).toHaveBeenCalledWith("Suspicious electricity cutoff notice");
  });
});

describe("ScamCheckResult component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders critical urgency banner and 1930 helpline for critical threats", () => {
    render(<ScamCheckResult result={mockAnalysisResult} onReset={vi.fn()} />);

    expect(screen.getByText("Critical Scam Threat Detected")).toBeDefined();
    expect(screen.getByRole("link", { name: /Call National Cyber Crime Helpline 1930/i })).toBeDefined();
  });

  it("renders executive AI summary, psychological tactics, and missing evidence notice", () => {
    render(<ScamCheckResult result={mockAnalysisResult} onReset={vi.fn()} />);

    expect(screen.getByText(/Executive Analysis & Assessment/i)).toBeDefined();
    expect(screen.getByText(/Critical threat detected: Message matches urgent disconnection trap/i)).toBeDefined();
    expect(screen.getByText("Artificial Urgency")).toBeDefined();
    expect(screen.getByText("Fear of Utility Loss")).toBeDefined();
    expect(screen.getByText(/Missing Corroborating Context/i)).toBeDefined();
    expect(screen.getByText("Nemotron-70B Assisting")).toBeDefined();
  });

  it("renders extracted identifiers as copyable indicator tags including amounts", () => {
    render(<ScamCheckResult result={mockAnalysisResult} onReset={vi.fn()} />);

    expect(screen.getByText(/Extracted Technical Indicators \(7\)/i)).toBeDefined();
    expect(screen.getByText("billdesk@okhdfcbank")).toBeDefined();
    expect(screen.getByText("9876543210")).toBeDefined();
    expect(screen.getByText("https://bit.ly/pay-now")).toBeDefined();
    expect(screen.getByText("IFSC: HDFC0001234")).toBeDefined();
    expect(screen.getByText("Rs. 1,450")).toBeDefined();
    expect(screen.getByText("Amount")).toBeDefined();
  });

  it("renders threat signals and recommended next actions", () => {
    render(<ScamCheckResult result={mockAnalysisResult} onReset={vi.fn()} />);

    expect(screen.getByText("Urgent Electricity Disconnection Threat")).toBeDefined();
    expect(screen.getByText(/Do not call the phone number/i)).toBeDefined();
    expect(screen.getByText(/Verify bill status only/i)).toBeDefined();
  });

  it("triggers onReset when analyze another message button is clicked", () => {
    const handleReset = vi.fn();
    render(<ScamCheckResult result={mockAnalysisResult} onReset={handleReset} />);

    const resetBtn = screen.getByRole("button", { name: "Analyze Another Message" });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});

describe("HomePage integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page header, navigation, and scam check form", () => {
    render(<HomePage />);

    expect(screen.getByText(/Verify suspicious messages, links/i)).toBeDefined();
    expect(screen.getAllByRole("link", { name: /1930/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Analyze Message" })).toBeDefined();
  });
});
