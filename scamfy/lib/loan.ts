import type { AnalysisResultDto, AnalysisSignalDto } from "@/app/api/check/route";

/**
 * Checks whether an analysis result indicates a predatory loan, advance-fee loan fraud,
 * or high-yield Ponzi investment trap.
 *
 * @param result - Analysis result object from threat triage engine
 * @returns True if predatory loan or high-yield trap risk is detected
 */
export function isLoanOrYieldRisk(result: AnalysisResultDto | null | undefined): boolean {
  if (!result) return false;

  const category = (result.primary_category || "").toUpperCase();
  if (
    category === "PREDATORY_LOAN_FRAUD" ||
    category === "INVESTMENT_PONZI_FRAUD" ||
    category === "INVESTMENT_STOCK_FRAUD"
  ) {
    return true;
  }

  if (
    result.secondary_categories?.some((c) => {
      const uc = c.toUpperCase();
      return (
        uc === "PREDATORY_LOAN_FRAUD" ||
        uc === "INVESTMENT_PONZI_FRAUD" ||
        uc === "INVESTMENT_STOCK_FRAUD"
      );
    })
  ) {
    return true;
  }

  return (result.signals || []).some((s) => {
    const sid = (s.id || "").toUpperCase();
    const sname = (s.name || "").toUpperCase();
    return (
      sid.includes("RULE-LOAN-") ||
      sid.includes("RULE-YIELD-") ||
      sid.includes("RULE-CRYPTO-STOCK-VIP-TRAP") ||
      sname.includes("PREDATORY LOAN") ||
      sname.includes("7-DAY") ||
      sname.includes("ADVANCE-FEE") ||
      sname.includes("PONZI")
    );
  });
}

/**
 * Checks whether an analysis result indicates a predatory loan or advance-fee loan fraud specifically.
 *
 * @param result - Analysis result object from threat triage engine
 * @returns True if loan threat indicators are present
 */
export function isPredatoryLoanRisk(result: AnalysisResultDto | null | undefined): boolean {
  if (!result) return false;

  const category = (result.primary_category || "").toUpperCase();
  if (category === "PREDATORY_LOAN_FRAUD") return true;

  if (result.secondary_categories?.some((c) => c.toUpperCase() === "PREDATORY_LOAN_FRAUD")) {
    return true;
  }

  return (result.signals || []).some((s) => {
    const sid = (s.id || "").toUpperCase();
    const sname = (s.name || "").toUpperCase();
    return (
      sid.includes("RULE-LOAN-") ||
      sname.includes("PREDATORY LOAN") ||
      sname.includes("7-DAY") ||
      sname.includes("ADVANCE-FEE")
    );
  });
}

/**
 * Checks whether an analysis result indicates an investment, high-yield, or Ponzi fraud specifically.
 *
 * @param result - Analysis result object from threat triage engine
 * @returns True if investment/yield indicators are present
 */
export function isYieldOrInvestmentRisk(result: AnalysisResultDto | null | undefined): boolean {
  if (!result) return false;

  const category = (result.primary_category || "").toUpperCase();
  if (category === "INVESTMENT_PONZI_FRAUD" || category === "INVESTMENT_STOCK_FRAUD") {
    return true;
  }

  if (
    result.secondary_categories?.some((c) => {
      const uc = c.toUpperCase();
      return uc === "INVESTMENT_PONZI_FRAUD" || uc === "INVESTMENT_STOCK_FRAUD";
    })
  ) {
    return true;
  }

  return (result.signals || []).some((s) => {
    const sid = (s.id || "").toUpperCase();
    const sname = (s.name || "").toUpperCase();
    return (
      sid.includes("RULE-YIELD-") ||
      sid.includes("RULE-CRYPTO-STOCK-VIP-TRAP") ||
      sname.includes("PONZI")
    );
  });
}

/**
 * Checks whether an analysis result is strictly an investment/yield fraud without loan threat signals.
 *
 * @param result - Analysis result object from threat triage engine
 * @returns True if threat is investment-only (no loan indicators)
 */
export function isInvestmentOnlyRisk(result: AnalysisResultDto | null | undefined): boolean {
  return isYieldOrInvestmentRisk(result) && !isPredatoryLoanRisk(result);
}

/**
 * Filters and returns all analysis signals specific to predatory loans or investment yield traps.
 *
 * @param result - Analysis result object
 * @returns Array of matching loan/yield analysis signals
 */
export function getLoanSignals(result: AnalysisResultDto | null | undefined): AnalysisSignalDto[] {
  if (!result || !result.signals) return [];

  return result.signals.filter((s) => {
    const sid = (s.id || "").toUpperCase();
    const sname = (s.name || "").toUpperCase();
    return (
      sid.includes("RULE-LOAN-") ||
      sid.includes("RULE-YIELD-") ||
      sid.includes("RULE-CRYPTO-STOCK-VIP-TRAP") ||
      sname.includes("PREDATORY LOAN") ||
      sname.includes("7-DAY") ||
      sname.includes("ADVANCE-FEE") ||
      sname.includes("PONZI")
    );
  });
}
