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
  rbiRepoRatePercentage: 6.5,
  bankFixedDepositPercentage: 7.0,
  niftyHistoricalCagrPercentage: 12.5,
  topMutualFundEquityPercentage: 15.0,
  budsActSuspiciousThresholdPercentage: 24.0,
  mathematicallyImpossibleApyPercentage: 50.0,
  rbiPredatoryAprThresholdPercentage: 100.0,
  rbiHighCostAprThresholdPercentage: 36.0,
} as const;

/**
 * Classifies the risk level of a loan offer based on APR, tenure, and upfront fee ratio.
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
    apr >= OFFICIAL_BENCHMARKS.rbiPredatoryAprThresholdPercentage ||
    (tenureDays <= 15 && deductionRatio >= 0.15) ||
    (tenureDays <= 30 && deductionRatio >= 0.25)
  ) {
    return "PREDATORY";
  }

  if (
    apr >= OFFICIAL_BENCHMARKS.rbiHighCostAprThresholdPercentage ||
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
    flags.push("Hyper-short 7-day or weekly tenure trap characteristic of illegal loan apps");
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
  } else if (annualizedSimpleApr >= OFFICIAL_BENCHMARKS.rbiPredatoryAprThresholdPercentage) {
    flags.push(
      `Annual Percentage Rate (${annualizedSimpleApr.toFixed(1)}% APR) is significantly higher than legal microfinance caps`
    );
  }

  let riskSummary = "Loan parameters appear within standard consumer lending interest bounds.";
  if (riskLevel === "PREDATORY") {
    riskSummary =
      "CRITICAL: Highly predatory loan structure matching illegal 7-day digital lending trap patterns with excessive fees and hyper-inflated APR.";
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
    try {
      const apyVal = (Math.pow(1 + rateFraction, multiplierPerYear) - 1) * 100;
      annualizedCompoundedApyPercentage = Number.isFinite(apyVal)
        ? apyVal
        : annualizedSimpleYieldPercentage * 10;
    } catch {
      annualizedCompoundedApyPercentage = annualizedSimpleYieldPercentage * 10;
    }
  }

  const projectedAnnualReturnAmount = (investmentAmount * annualizedSimpleYieldPercentage) / 100;

  const benchmarkExcessMultiplier =
    OFFICIAL_BENCHMARKS.rbiRepoRatePercentage > 0
      ? Number(
          (annualizedSimpleYieldPercentage / OFFICIAL_BENCHMARKS.rbiRepoRatePercentage).toFixed(1)
        )
      : 1;

  let riskLevel: YieldRiskLevel = "REASONABLE";
  if (
    annualizedSimpleYieldPercentage >= OFFICIAL_BENCHMARKS.mathematicallyImpossibleApyPercentage ||
    frequency === "daily" ||
    (frequency === "weekly" && promisedReturnPercentage >= 2)
  ) {
    riskLevel = "PONZI_TRAP";
  } else if (
    annualizedSimpleYieldPercentage >= OFFICIAL_BENCHMARKS.budsActSuspiciousThresholdPercentage
  ) {
    riskLevel = "HIGH_RISK";
  }

  const flags: string[] = [];
  if (frequency === "daily") {
    flags.push(
      `Daily return promises (${promisedReturnPercentage}%/day) are classic indicators of unsustainable Ponzi / HYIP fraud`
    );
  }
  if (annualizedSimpleYieldPercentage >= OFFICIAL_BENCHMARKS.budsActSuspiciousThresholdPercentage) {
    flags.push(
      `Promised yield (${annualizedSimpleYieldPercentage.toFixed(1)}% p.a.) exceeds the 24% threshold regulated under the BUDS Act, 2019`
    );
  }
  if (benchmarkExcessMultiplier >= 5) {
    flags.push(
      `Promised return is ${benchmarkExcessMultiplier}x higher than standard RBI repo rate and bank deposits`
    );
  }

  let riskSummary = "Promised yield is within normal regulated capital market expectations.";
  if (riskLevel === "PONZI_TRAP") {
    riskSummary =
      "CRITICAL: Mathematically unsustainable guaranteed return. Matches high-yield Ponzi / unregulated deposit scheme patterns.";
  } else if (riskLevel === "HIGH_RISK") {
    riskSummary =
      "CAUTION: Unusually high return promise exceeding market benchmarks. Requires verifying SEBI/RBI regulatory registration.";
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
