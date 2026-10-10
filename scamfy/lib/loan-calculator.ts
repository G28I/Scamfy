/**
 * Pure deterministic financial calculation engine for predatory loan and high-yield trap analysis.
 *
 * Implements auditable mathematical formulas for APR, effective borrowing costs, net disbursement,
 * and annualized yields compared against authoritative regulatory benchmarks per LOAN-01 and LOAN-02.
 */

export type LoanRiskLevel = "NORMAL" | "HIGH_COST" | "PREDATORY";

export type YieldRiskLevel = "REASONABLE" | "HIGH_RISK" | "PONZI_TRAP";

export interface LoanInputParams {
  readonly statedPrincipal: number;
  readonly upfrontDeduction: number;
  readonly totalRepayment: number;
  readonly tenureDays: number;
}

export interface LoanCalculationResult {
  readonly statedPrincipal: number;
  readonly upfrontDeduction: number;
  readonly netDisbursed: number;
  readonly totalRepayment: number;
  readonly totalBorrowingCost: number;
  readonly upfrontDeductionPercentage: number;
  readonly periodInterestRatePercentage: number;
  readonly annualizedSimpleApr: number;
  readonly annualizedCompoundedEar: number;
  readonly dailyInterestRatePercentage: number;
  readonly riskLevel: LoanRiskLevel;
  readonly riskSummary: string;
  readonly flags: readonly string[];
}

export interface YieldInputParams {
  readonly investmentAmount: number;
  readonly promisedReturnPercentage: number;
  readonly frequency: "daily" | "weekly" | "monthly" | "annual";
  readonly tenureMonths?: number;
}

export interface YieldCalculationResult {
  readonly investmentAmount: number;
  readonly promisedReturnPercentage: number;
  readonly frequency: "daily" | "weekly" | "monthly" | "annual";
  readonly annualizedSimpleYieldPercentage: number;
  readonly annualizedCompoundedApyPercentage: number;
  readonly projectedAnnualReturnAmount: number;
  readonly rbiRepoRateBenchmarkPercentage: number;
  readonly marketIndexBenchmarkPercentage: number;
  readonly benchmarkExcessMultiplier: number;
  readonly riskLevel: YieldRiskLevel;
  readonly riskSummary: string;
  readonly flags: readonly string[];
}

export const OFFICIAL_BENCHMARKS = {
  /** Current RBI policy repo rate benchmark as of Oct 7, 2026 monetary policy decision. */
  rbiRepoRatePercentage: 5.50,
  rbiRepoRateAsOfDate: "2026-10-07",
  /** Standard commercial bank 1-year fixed deposit average rate. */
  bankFixedDepositPercentage: 7.0,
  /** Nifty 50 historic 10-year rolling CAGR benchmark. */
  niftyHistoricalCagrPercentage: 12.5,
  /** Top-tier equity mutual fund 10-year CAGR range. */
  topMutualFundEquityPercentage: 15.0,
  /** Scamfy product heuristic: Promised returns exceeding 24% p.a. are flagged as anomalous high-yield risks. */
  unregulatedHighYieldAnomalyThresholdPercentage: 24.0,
  /** Scamfy product heuristic: Promised returns exceeding 50% p.a. are flagged as extreme Ponzi/HYIP risks. */
  extremeYieldRiskThresholdPercentage: 50.0,
  /** Scamfy product heuristic: Microloan simple borrowing cost exceeding 100% APR indicates predatory terms. */
  heuristicPredatoryAprThresholdPercentage: 100.0,
  /** Scamfy product heuristic: Microloan simple borrowing cost exceeding 36% APR indicates high-cost credit. */
  heuristicHighCostAprThresholdPercentage: 36.0,
} as const;

/**
 * Classifies the risk level of a loan offer based on APR, tenure, and upfront fee ratio.
 * Note: 36% and 100% APR thresholds are Scamfy product heuristics modeling high-cost and predatory credit patterns.
 *
 * @param apr - Annual Percentage Rate in percent
 * @param tenureDays - Loan duration in days
 * @param deductionRatio - Ratio of upfront deductions to stated principal
 * @returns Risk classification (NORMAL, HIGH_COST, or PREDATORY)
 */
export function classifyLoanRisk(
  apr: number,
  tenureDays: number,
  deductionRatio: number
): LoanRiskLevel {
  if (
    apr >= OFFICIAL_BENCHMARKS.heuristicPredatoryAprThresholdPercentage ||
    (tenureDays <= 15 && deductionRatio >= 0.15) ||
    (tenureDays <= 30 && deductionRatio >= 0.25)
  ) {
    return "PREDATORY";
  }

  if (
    apr >= OFFICIAL_BENCHMARKS.heuristicHighCostAprThresholdPercentage ||
    deductionRatio >= 0.1
  ) {
    return "HIGH_COST";
  }

  return "NORMAL";
}

/**
 * Calculates deterministic borrowing metrics, true net disbursement, fee percentages,
 * and implied Annual Percentage Rate (APR) from raw loan parameters.
 *
 * @param params - Stated principal, upfront deduction, repayment amount, and tenure in days
 * @returns Immutable calculation result with risk tier and breakdown metrics
 */
export function calculateLoanMetrics(params: LoanInputParams): LoanCalculationResult {
  const statedPrincipal = Math.max(0, params.statedPrincipal || 0);
  const upfrontDeduction = Math.max(0, Math.min(params.upfrontDeduction || 0, statedPrincipal));
  const totalRepayment = Math.max(0, params.totalRepayment || 0);
  const tenureDays = Math.max(1, params.tenureDays || 1);

  const netDisbursed = Math.max(0, statedPrincipal - upfrontDeduction);
  const totalBorrowingCost = Math.max(0, totalRepayment - netDisbursed);

  const upfrontDeductionPercentage =
    statedPrincipal > 0 ? (upfrontDeduction / statedPrincipal) * 100 : 0;

  const baseForRate = netDisbursed > 0 ? netDisbursed : statedPrincipal > 0 ? statedPrincipal : 1;
  const periodInterestRatePercentage = (totalBorrowingCost / baseForRate) * 100;

  const dailyInterestRatePercentage = periodInterestRatePercentage / tenureDays;
  const annualizedSimpleApr = dailyInterestRatePercentage * 365;

  // Compounded Effective Annual Rate (EAR) capped safely to avoid Infinity / overflow
  const periodsPerYear = 365 / tenureDays;
  const rateFraction = periodInterestRatePercentage / 100;
  let annualizedCompoundedEar = annualizedSimpleApr;

  if (rateFraction > 0 && rateFraction < 100) {
    const earVal = (Math.pow(1 + rateFraction, periodsPerYear) - 1) * 100;
    if (Number.isFinite(earVal) && earVal < 1e12) {
      annualizedCompoundedEar = earVal;
    }
  }

  const deductionRatio = statedPrincipal > 0 ? upfrontDeduction / statedPrincipal : 0;
  const riskLevel = classifyLoanRisk(annualizedSimpleApr, tenureDays, deductionRatio);

  const flags: string[] = [];
  if (tenureDays <= 7) {
    flags.push("Hyper-short 7-day or weekly tenure trap characteristic of predatory digital lending apps");
  } else if (tenureDays <= 15) {
    flags.push("Short repayment cycle (< 15 days) not complying with standard personal credit terms");
  }

  if (upfrontDeductionPercentage >= 25) {
    flags.push(
      `Extravagant upfront deduction (${upfrontDeductionPercentage.toFixed(1)}%) before disbursement`
    );
  } else if (upfrontDeductionPercentage >= 10) {
    flags.push(
      `High upfront processing charge (${upfrontDeductionPercentage.toFixed(1)}%) reducing effective credit`
    );
  }

  if (annualizedSimpleApr >= 1000) {
    flags.push(
      `Usurious annualized rate (${annualizedSimpleApr.toFixed(0)}% APR) exceeds predatory lending thresholds`
    );
  } else if (annualizedSimpleApr >= OFFICIAL_BENCHMARKS.heuristicPredatoryAprThresholdPercentage) {
    flags.push(
      `Annual Percentage Rate (${annualizedSimpleApr.toFixed(1)}% APR) exceeds Scamfy's high-risk lending heuristic`
    );
  }

  let riskSummary =
    "Loan parameters appear within standard consumer lending interest bounds and standard market ranges.";
  if (riskLevel === "PREDATORY") {
    riskSummary =
      "CRITICAL: Highly predatory loan structure matching predatory 7-day digital lending trap patterns with excessive fees and hyper-inflated APR.";
  } else if (riskLevel === "HIGH_COST") {
    riskSummary =
      "CAUTION: High-cost credit terms. The total borrowing cost and upfront fee significantly exceed standard regulated bank interest rates.";
  }

  return {
    statedPrincipal: Number(statedPrincipal.toFixed(2)),
    upfrontDeduction: Number(upfrontDeduction.toFixed(2)),
    netDisbursed: Number(netDisbursed.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
    totalBorrowingCost: Number(totalBorrowingCost.toFixed(2)),
    upfrontDeductionPercentage: Number(upfrontDeductionPercentage.toFixed(2)),
    periodInterestRatePercentage: Number(periodInterestRatePercentage.toFixed(2)),
    annualizedSimpleApr: Number(annualizedSimpleApr.toFixed(2)),
    annualizedCompoundedEar: Number(annualizedCompoundedEar.toFixed(2)),
    dailyInterestRatePercentage: Number(dailyInterestRatePercentage.toFixed(3)),
    riskLevel,
    riskSummary,
    flags,
  };
}

/**
 * Calculates annualized returns, compounded APY, and benchmark comparisons for high-yield investment offers.
 *
 * @param params - Stated investment principal, return rate percentage, and payout interval
 * @returns Immutable yield calculation result with Ponzi / BUDS Act risk indicators
 */
export function calculateYieldMetrics(params: YieldInputParams): YieldCalculationResult {
  const investmentAmount = Math.max(0, params.investmentAmount || 0);
  const promisedReturnPercentage = Math.max(0, params.promisedReturnPercentage || 0);
  const frequency = params.frequency;

  let multiplierPerYear = 1;
  if (frequency === "daily") multiplierPerYear = 365;
  else if (frequency === "weekly") multiplierPerYear = 52;
  else if (frequency === "monthly") multiplierPerYear = 12;
  else if (frequency === "annual") multiplierPerYear = 1;

  const annualizedSimpleYieldPercentage = promisedReturnPercentage * multiplierPerYear;

  const rateFraction = promisedReturnPercentage / 100;
  let annualizedCompoundedApyPercentage = annualizedSimpleYieldPercentage;

  if (rateFraction > 0 && rateFraction < 50) {
    const apyVal = (Math.pow(1 + rateFraction, multiplierPerYear) - 1) * 100;
    if (Number.isFinite(apyVal) && apyVal < 1e12) {
      annualizedCompoundedApyPercentage = apyVal;
    }
  }

  const projectedAnnualReturnAmount = (investmentAmount * annualizedSimpleYieldPercentage) / 100;

  const benchmarkExcessMultiplier =
    OFFICIAL_BENCHMARKS.rbiRepoRatePercentage > 0 && promisedReturnPercentage > 0
      ? Number(
          (annualizedSimpleYieldPercentage / OFFICIAL_BENCHMARKS.rbiRepoRatePercentage).toFixed(1)
        )
      : 1;

  let riskLevel: YieldRiskLevel = "REASONABLE";
  if (
    promisedReturnPercentage > 0 &&
    (annualizedSimpleYieldPercentage >= OFFICIAL_BENCHMARKS.extremeYieldRiskThresholdPercentage ||
      (frequency === "daily" && promisedReturnPercentage > 0.1))
  ) {
    riskLevel = "PONZI_TRAP";
  } else if (
    promisedReturnPercentage > 0 &&
    annualizedSimpleYieldPercentage >= OFFICIAL_BENCHMARKS.unregulatedHighYieldAnomalyThresholdPercentage
  ) {
    riskLevel = "HIGH_RISK";
  }

  const flags: string[] = [];
  if (frequency === "daily" && promisedReturnPercentage > 0.1) {
    flags.push(
      `Daily return promises (${promisedReturnPercentage}%/day) are classic indicators of unsustainable high-yield / Ponzi schemes`
    );
  }
  if (
    promisedReturnPercentage > 0 &&
    annualizedSimpleYieldPercentage >= OFFICIAL_BENCHMARKS.unregulatedHighYieldAnomalyThresholdPercentage
  ) {
    flags.push(
      `Promised yield (${annualizedSimpleYieldPercentage.toFixed(1)}% p.a.) significantly exceeds regulated market benchmarks. Schemes soliciting public deposits without authorization may fall under the BUDS Act (Banning of Unregulated Deposit Schemes Act, 2019).`
    );
  }
  if (promisedReturnPercentage > 0 && benchmarkExcessMultiplier >= 5) {
    flags.push(
      `Promised return is ${benchmarkExcessMultiplier}x higher than standard RBI repo rate and bank deposits`
    );
  }

  let riskSummary = "Promised yield is within standard regulated capital market expectations.";
  if (riskLevel === "PONZI_TRAP") {
    riskSummary =
      "CRITICAL: Unsustainable high-yield promise. Unregulated deposit or Ponzi-style schemes often promise high or daily returns without a legitimate underlying business model.";
  } else if (riskLevel === "HIGH_RISK") {
    riskSummary =
      "CAUTION: Unusually high return promise exceeding market benchmarks. Verify whether the offering entity is officially registered with statutory regulators.";
  }

  return {
    investmentAmount: Number(investmentAmount.toFixed(2)),
    promisedReturnPercentage: Number(promisedReturnPercentage.toFixed(2)),
    frequency,
    annualizedSimpleYieldPercentage: Number(annualizedSimpleYieldPercentage.toFixed(2)),
    annualizedCompoundedApyPercentage: Number(annualizedCompoundedApyPercentage.toFixed(2)),
    projectedAnnualReturnAmount: Number(projectedAnnualReturnAmount.toFixed(2)),
    rbiRepoRateBenchmarkPercentage: OFFICIAL_BENCHMARKS.rbiRepoRatePercentage,
    marketIndexBenchmarkPercentage: OFFICIAL_BENCHMARKS.niftyHistoricalCagrPercentage,
    benchmarkExcessMultiplier,
    riskLevel,
    riskSummary,
    flags,
  };
}
