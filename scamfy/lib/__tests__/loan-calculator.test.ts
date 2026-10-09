import { describe, it, expect } from "vitest";
import {
  calculateLoanMetrics,
  calculateYieldMetrics,
  classifyLoanRisk,
  OFFICIAL_BENCHMARKS,
} from "@/lib/loan-calculator";

describe("Deterministic Loan & Yield Calculator Engine (LOAN-01, LOAN-02)", () => {
  describe("Loan Metrics Calculation (calculateLoanMetrics)", () => {
    it("correctly identifies predatory 7-day loan app terms with high deduction", () => {
      // 7-day app: Apply for 5000, 1500 deducted upfront, receive 3500, repay 5000 in 7 days
      const result = calculateLoanMetrics({
        statedPrincipal: 5000,
        upfrontDeduction: 1500,
        totalRepayment: 5000,
        tenureDays: 7,
      });

      expect(result.netDisbursed).toBe(3500);
      expect(result.totalBorrowingCost).toBe(1500);
      expect(result.upfrontDeductionPercentage).toBe(30);
      expect(result.riskLevel).toBe("PREDATORY");
      // Flat rate: 1500 / 3500 = 42.86% for 7 days
      // Annualized: 42.86 * (365 / 7) = ~2234% APR
      expect(result.annualizedSimpleApr).toBeGreaterThan(2000);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags.some((f) => f.includes("7-day"))).toBe(true);
      expect(result.riskSummary).toContain("CRITICAL");
    });

    it("evaluates a standard regulated bank personal loan as NORMAL risk", () => {
      // Regulated personal loan: 1,00,000 principal, 1,500 fee (1.5%), repay 1,12,000 over 365 days (~12% p.a.)
      const result = calculateLoanMetrics({
        statedPrincipal: 100000,
        upfrontDeduction: 1500,
        totalRepayment: 112000,
        tenureDays: 365,
      });

      expect(result.netDisbursed).toBe(98500);
      expect(result.upfrontDeductionPercentage).toBe(1.5);
      expect(result.annualizedSimpleApr).toBeLessThan(20);
      expect(result.riskLevel).toBe("NORMAL");
      expect(result.riskSummary).toContain("standard consumer lending");
    });

    it("evaluates a high-cost NBFC micro-loan as HIGH_COST risk", () => {
      // High cost: 10,000 principal, 500 fee (5%), repay 11,200 over 120 days (~43% APR)
      const result = calculateLoanMetrics({
        statedPrincipal: 10000,
        upfrontDeduction: 500,
        totalRepayment: 11200,
        tenureDays: 120,
      });

      expect(result.netDisbursed).toBe(9500);
      expect(result.upfrontDeductionPercentage).toBe(5);
      expect(result.annualizedSimpleApr).toBeGreaterThan(36);
      expect(result.annualizedSimpleApr).toBeLessThan(100);
      expect(result.riskLevel).toBe("HIGH_COST");
      expect(result.riskSummary).toContain("CAUTION");
    });

    it("handles boundary zero/negative edge cases gracefully without division by zero", () => {
      const zeroResult = calculateLoanMetrics({
        statedPrincipal: 0,
        upfrontDeduction: 0,
        totalRepayment: 0,
        tenureDays: 0,
      });

      expect(zeroResult.netDisbursed).toBe(0);
      expect(zeroResult.annualizedSimpleApr).toBe(0);
      expect(zeroResult.riskLevel).toBe("NORMAL");

      const extremeDeduction = calculateLoanMetrics({
        statedPrincipal: 1000,
        upfrontDeduction: 5000, // Deduction exceeds principal
        totalRepayment: 2000,
        tenureDays: 7,
      });

      expect(extremeDeduction.upfrontDeduction).toBe(1000); // Clamped to stated principal
      expect(extremeDeduction.netDisbursed).toBe(0);
    });
  });

  describe("classifyLoanRisk helper", () => {
    it("flags APR >= 100% as PREDATORY", () => {
      expect(classifyLoanRisk(120, 60, 0.05)).toBe("PREDATORY");
    });

    it("flags 7-day tenure with >= 15% deduction as PREDATORY", () => {
      expect(classifyLoanRisk(25, 7, 0.2)).toBe("PREDATORY");
    });

    it("flags APR >= 36% as HIGH_COST", () => {
      expect(classifyLoanRisk(40, 90, 0.05)).toBe("HIGH_COST");
    });

    it("flags standard rates as NORMAL", () => {
      expect(classifyLoanRisk(14, 180, 0.02)).toBe("NORMAL");
    });
  });

  describe("Yield Metrics Calculation (calculateYieldMetrics)", () => {
    it("identifies high-yield Ponzi trap promising 2% daily return", () => {
      // 2% daily return = 730% annualized simple yield
      const result = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 2,
        frequency: "daily",
      });

      expect(result.annualizedSimpleYieldPercentage).toBe(730);
      expect(result.riskLevel).toBe("PONZI_TRAP");
      expect(result.benchmarkExcessMultiplier).toBeGreaterThan(100);
      expect(result.flags.some((f) => f.includes("Ponzi"))).toBe(true);
      expect(result.riskSummary).toContain("CRITICAL");
    });

    it("evaluates a reasonable mutual fund / bank yield as REASONABLE", () => {
      // 12% annual return
      const result = calculateYieldMetrics({
        investmentAmount: 50000,
        promisedReturnPercentage: 12,
        frequency: "annual",
      });

      expect(result.annualizedSimpleYieldPercentage).toBe(12);
      expect(result.riskLevel).toBe("REASONABLE");
      expect(result.riskSummary).toContain("normal regulated capital market");
    });

    it("evaluates a suspicious 30% p.a. guaranteed scheme as HIGH_RISK under BUDS Act", () => {
      // 2.5% monthly return = 30% annual
      const result = calculateYieldMetrics({
        investmentAmount: 25000,
        promisedReturnPercentage: 2.5,
        frequency: "monthly",
      });

      expect(result.annualizedSimpleYieldPercentage).toBe(30);
      expect(result.riskLevel).toBe("HIGH_RISK");
      expect(result.flags.some((f) => f.includes("BUDS Act"))).toBe(true);
    });

    it("handles zero investment parameters safely", () => {
      const result = calculateYieldMetrics({
        investmentAmount: 0,
        promisedReturnPercentage: 0,
        frequency: "daily",
      });

      expect(result.annualizedSimpleYieldPercentage).toBe(0);
      expect(result.projectedAnnualReturnAmount).toBe(0);
    });
  });

  describe("Regulatory Benchmarks", () => {
    it("contains authoritative official Indian benchmarks", () => {
      expect(OFFICIAL_BENCHMARKS.rbiRepoRatePercentage).toBe(6.5);
      expect(OFFICIAL_BENCHMARKS.budsActSuspiciousThresholdPercentage).toBe(24.0);
      expect(OFFICIAL_BENCHMARKS.rbiPredatoryAprThresholdPercentage).toBe(100.0);
    });
  });
});
