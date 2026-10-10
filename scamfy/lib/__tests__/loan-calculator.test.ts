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
      expect(result.riskSummary).toContain("standard market ranges");
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
      expect(result.riskSummary).toContain("standard regulated capital market");
    });

    it("evaluates a suspicious 30% p.a. guaranteed scheme as HIGH_RISK under BUDS Act warning", () => {
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

    it("does not flag daily frequency as Ponzi when promised return is zero", () => {
      const result = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 0,
        frequency: "daily",
      });

      expect(result.annualizedSimpleYieldPercentage).toBe(0);
      expect(result.riskLevel).toBe("REASONABLE");
      expect(result.flags.length).toBe(0);
    });

    it("evaluates low borderline daily return (<0.1%/day) without Ponzi false positive", () => {
      // 0.05% daily return = 18.25% p.a. (below 24% threshold)
      const result = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 0.05,
        frequency: "daily",
      });

      expect(result.annualizedSimpleYieldPercentage).toBe(18.25);
      expect(result.riskLevel).toBe("REASONABLE");
      expect(result.flags.length).toBe(0);
    });

    it("evaluates exact 24% and 50% yield threshold boundaries accurately", () => {
      // 23.9% annual return -> REASONABLE
      const result23 = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 23.9,
        frequency: "annual",
      });
      expect(result23.riskLevel).toBe("REASONABLE");

      // 24.0% annual return -> HIGH_RISK
      const result24 = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 24.0,
        frequency: "annual",
      });
      expect(result24.riskLevel).toBe("HIGH_RISK");

      // 49.9% annual return -> HIGH_RISK
      const result49 = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 49.9,
        frequency: "annual",
      });
      expect(result49.riskLevel).toBe("HIGH_RISK");

      // 50.0% annual return -> PONZI_TRAP
      const result50 = calculateYieldMetrics({
        investmentAmount: 10000,
        promisedReturnPercentage: 50.0,
        frequency: "annual",
      });
      expect(result50.riskLevel).toBe("PONZI_TRAP");
    });
  });

  describe("Regulatory Benchmarks & Edge Safeguards", () => {
    it("contains authoritative official Indian benchmarks", () => {
      expect(OFFICIAL_BENCHMARKS.rbiRepoRatePercentage).toBe(5.50);
      expect(OFFICIAL_BENCHMARKS.rbiRepoRateAsOfDate).toBe("2026-10-07");
      expect(OFFICIAL_BENCHMARKS.unregulatedHighYieldAnomalyThresholdPercentage).toBe(24.0);
      expect(OFFICIAL_BENCHMARKS.heuristicPredatoryAprThresholdPercentage).toBe(100.0);
    });

    it("ensures compounded EAR remains finite and bounded for extreme rates", () => {
      const extremeResult = calculateLoanMetrics({
        statedPrincipal: 5000,
        upfrontDeduction: 4900,
        totalRepayment: 50000,
        tenureDays: 1,
      });

      expect(Number.isFinite(extremeResult.annualizedCompoundedEar)).toBe(true);
      expect(extremeResult.annualizedCompoundedEar).toBeLessThanOrEqual(1e12);
    });
  });
});
