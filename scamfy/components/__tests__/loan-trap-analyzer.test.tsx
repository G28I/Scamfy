// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoanTrapAnalyzer } from "@/components/domain/loan-trap-analyzer";

describe("LoanTrapAnalyzer Component (LOAN-01, LOAN-02, LOAN-03, UX-03, UX-04)", () => {
  it("renders loan APR tab by default with initial calculations", () => {
    render(<LoanTrapAnalyzer />);

    expect(screen.getByText("Predatory Loan & High-Yield Trap Analyzer")).toBeDefined();
    expect(screen.getByText(/Instant Loan APR/i)).toBeDefined();
    expect(screen.getByText(/High-Yield \/ Ponzi/i)).toBeDefined();
    expect(screen.getByText(/RBI Verification/i)).toBeDefined();

    expect(screen.getByLabelText(/Stated Loan Principal in Rupees/i)).toBeDefined();
    expect(screen.getByLabelText(/Upfront Deduction Fee in Rupees/i)).toBeDefined();
    expect(screen.getByLabelText(/Total Repayment Amount in Rupees/i)).toBeDefined();
    expect(screen.getByLabelText(/Loan Tenure in Days/i)).toBeDefined();

    expect(screen.getByText(/Implied Annualized Borrowing Rate \(APR\)/i)).toBeDefined();
    expect(screen.getByText(/PREDATORY LENDING TRAP/i)).toBeDefined();
  });

  it("updates calculations when quick scenario preset is clicked", async () => {
    const user = userEvent.setup();
    render(<LoanTrapAnalyzer />);

    const bankPresetBtn = screen.getByText(/Regulated NBFC Personal Loan/i);
    await user.click(bankPresetBtn);

    // Regulated loan should display STANDARD MARKET RATE badge
    expect(screen.getByText(/STANDARD MARKET RATE/i)).toBeDefined();
    expect(screen.getByText(/Net Cash Disbursed/i)).toBeDefined();
  });

  it("switches to High-Yield / Ponzi tab and calculates APY against benchmarks", async () => {
    const user = userEvent.setup();
    render(<LoanTrapAnalyzer />);

    const yieldTabBtn = screen.getByRole("tab", { name: /High-Yield \/ Ponzi/i });
    await user.click(yieldTabBtn);

    expect(await screen.findByText(/Investment Principal \(₹\)/i)).toBeDefined();
    expect(screen.getByText(/Promised Return \(%\)/i)).toBeDefined();
    expect(screen.getByText(/Payout Interval/i)).toBeDefined();
    expect(screen.getByText(/Effective Annual Yield \(Simple APY\)/i)).toBeDefined();
    expect(screen.getByText(/🚨 MATHEMATICALLY IMPOSSIBLE PONZI/i)).toBeDefined();
    expect(screen.getByText(/RBI Repo Benchmark/i)).toBeDefined();
    expect(screen.getByText(/BUDS Act Alert Ceiling/i)).toBeDefined();
  });

  it("switches to RBI Verification checklist tab and toggles checklist items", async () => {
    const user = userEvent.setup();
    render(<LoanTrapAnalyzer />);

    const rbiTabBtn = screen.getByRole("tab", { name: /RBI Verification/i });
    await user.click(rbiTabBtn);

    expect(await screen.findByText(/RBI Digital Lending Regulatory Compliance Checklist/i)).toBeDefined();
    expect(screen.getByText(/1\. Key Fact Statement \(KFS\) Provided/i)).toBeDefined();
    expect(screen.getByText(/2\. Direct Bank-to-Bank Disbursal/i)).toBeDefined();
    expect(screen.getByText(/3\. Zero Mobile Contact Book/i)).toBeDefined();
    expect(screen.getByText(/sachet\.rbi\.org\.in/i)).toBeDefined();

    const kfsItem = screen.getByText(/1\. Key Fact Statement \(KFS\) Provided/i);
    await user.click(kfsItem);
  });
});
