// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoanAnalyzerPage from "@/app/loan-analyzer/page";

describe("LoanAnalyzerPage Component", () => {
  it("renders page header, educational cards, and calculator component", () => {
    render(<LoanAnalyzerPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Predatory Loan & High-Yield Trap Analyzer" })).toBeDefined();
    expect(screen.getByText("The 7-Day Loan Trap")).toBeDefined();
    expect(screen.getByText("Advance-Fee Approval Scams")).toBeDefined();
    expect(screen.getByText("RBI Digital Lending Rules")).toBeDefined();
    expect(screen.getByText(/RBI Sachet Portal/i)).toBeDefined();
    expect(screen.getByText(/National Cybercrime Portal \(1930\)/i)).toBeDefined();
  });
});
