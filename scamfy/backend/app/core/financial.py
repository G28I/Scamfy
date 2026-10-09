"""Financial calculation engine for predatory loan and high-yield trap analysis.

Implements deterministic formulas for APR, effective borrowing costs,
net disbursement, and annualized yields per LOAN-01 and LOAN-02.
"""

from typing import Literal

from pydantic import BaseModel, Field

LoanRiskLevel = Literal["NORMAL", "HIGH_COST", "PREDATORY"]
YieldRiskLevel = Literal["REASONABLE", "HIGH_RISK", "PONZI_TRAP"]
FrequencyType = Literal["daily", "weekly", "monthly", "annual"]


class LoanInputParams(BaseModel):
    """Input parameters for evaluating a loan structure."""

    stated_principal: float = Field(..., ge=0, description="Stated loan principal amount")
    upfront_deduction: float = Field(default=0.0, ge=0, description="Upfront fees deducted before disbursement")
    total_repayment: float = Field(..., ge=0, description="Total amount required to repay")
    tenure_days: int = Field(..., ge=1, description="Loan duration in days")


class LoanCalculationResult(BaseModel):
    """Calculated metrics and risk classification for a loan."""

    stated_principal: float
    upfront_deduction: float
    net_disbursed: float
    total_repayment: float
    total_borrowing_cost: float
    upfront_deduction_percentage: float
    period_interest_rate_percentage: float
    annualized_simple_apr: float
    annualized_compounded_ear: float
    daily_interest_rate_percentage: float
    risk_level: LoanRiskLevel
    risk_summary: str
    flags: list[str]


class YieldInputParams(BaseModel):
    """Input parameters for evaluating an investment yield offer."""

    investment_amount: float = Field(..., ge=0, description="Investment principal amount")
    promised_return_percentage: float = Field(..., ge=0, description="Promised return rate in percent")
    frequency: FrequencyType = Field(..., description="Payout interval: daily, weekly, monthly, annual")


class YieldCalculationResult(BaseModel):
    """Calculated yield metrics and Ponzi risk assessment."""

    investment_amount: float
    promised_return_percentage: float
    frequency: FrequencyType
    annualized_simple_yield_percentage: float
    annualized_compounded_apy_percentage: float
    projected_annual_return_amount: float
    rbi_repo_rate_benchmark_percentage: float
    market_index_benchmark_percentage: float
    benchmark_excess_multiplier: float
    risk_level: YieldRiskLevel
    risk_summary: str
    flags: list[str]


RBI_REPO_RATE = 6.5
NIFTY_CAGR_BENCHMARK = 12.5
BUDS_ACT_THRESHOLD = 24.0
PREDATORY_APR_THRESHOLD = 100.0
HIGH_COST_APR_THRESHOLD = 36.0


def classify_loan_risk(apr: float, tenure_days: int, deduction_ratio: float) -> LoanRiskLevel:
    """Classify the risk level of a loan based on APR, tenure, and upfront fee ratio.

    Args:
        apr: Annual Percentage Rate in percent.
        tenure_days: Loan tenure in days.
        deduction_ratio: Fraction of principal deducted upfront.

    Returns:
        Risk level category: NORMAL, HIGH_COST, or PREDATORY.
    """
    if (
        apr >= PREDATORY_APR_THRESHOLD
        or (tenure_days <= 15 and deduction_ratio >= 0.15)
        or (tenure_days <= 30 and deduction_ratio >= 0.25)
    ):
        return "PREDATORY"

    if apr >= HIGH_COST_APR_THRESHOLD or deduction_ratio >= 0.10:
        return "HIGH_COST"

    return "NORMAL"


def calculate_loan_metrics(params: LoanInputParams) -> LoanCalculationResult:
    """Calculate deterministic loan borrowing metrics and implied APR.

    Args:
        params: Loan input parameters containing principal, deduction, repayment, and tenure.

    Returns:
        LoanCalculationResult containing net disbursement, true cost, and APR.
    """
    stated_principal = max(0.0, float(params.stated_principal))
    upfront_deduction = max(0.0, min(float(params.upfront_deduction), stated_principal))
    total_repayment = max(0.0, float(params.total_repayment))
    tenure_days = max(1, int(params.tenure_days))

    net_disbursed = max(0.0, stated_principal - upfront_deduction)
    total_borrowing_cost = max(0.0, total_repayment - net_disbursed)

    upfront_deduction_percentage = (
        (upfront_deduction / stated_principal) * 100.0 if stated_principal > 0 else 0.0
    )

    base_for_rate = net_disbursed if net_disbursed > 0 else (stated_principal if stated_principal > 0 else 1.0)
    period_interest_rate_percentage = (total_borrowing_cost / base_for_rate) * 100.0

    daily_interest_rate_percentage = period_interest_rate_percentage / tenure_days
    annualized_simple_apr = daily_interest_rate_percentage * 365.0

    periods_per_year = 365.0 / tenure_days
    rate_fraction = period_interest_rate_percentage / 100.0
    annualized_compounded_ear = annualized_simple_apr

    if 0 < rate_fraction < 100:
        try:
            ear_val = ((1.0 + rate_fraction) ** periods_per_year - 1.0) * 100.0
            if ear_val < 1e12:
                annualized_compounded_ear = ear_val
        except (OverflowError, ValueError):
            annualized_compounded_ear = annualized_simple_apr * 10.0

    deduction_ratio = upfront_deduction / stated_principal if stated_principal > 0 else 0.0
    risk_level = classify_loan_risk(annualized_simple_apr, tenure_days, deduction_ratio)

    flags: list[str] = []
    if tenure_days <= 7:
        flags.append("Hyper-short 7-day or weekly tenure trap characteristic of illegal loan apps")
    elif tenure_days <= 15:
        flags.append("Short repayment cycle (< 15 days) not complying with standard personal credit terms")

    if upfront_deduction_percentage >= 25.0:
        flags.append(f"Extravagant upfront deduction ({upfront_deduction_percentage:.1f}%) before disbursement")
    elif upfront_deduction_percentage >= 10.0:
        flags.append(f"High upfront processing charge ({upfront_deduction_percentage:.1f}%) reducing effective credit")

    if annualized_simple_apr >= 1000.0:
        flags.append(f"Usurious annualized rate ({annualized_simple_apr:.0f}% APR) exceeds predatory lending thresholds")
    elif annualized_simple_apr >= PREDATORY_APR_THRESHOLD:
        flags.append(f"Annual Percentage Rate ({annualized_simple_apr:.1f}% APR) is significantly higher than legal microfinance caps")

    risk_summary = "Loan parameters appear within standard consumer lending interest bounds."
    if risk_level == "PREDATORY":
        risk_summary = (
            "CRITICAL: Highly predatory loan structure matching illegal 7-day digital lending trap "
            "patterns with excessive fees and hyper-inflated APR."
        )
    elif risk_level == "HIGH_COST":
        risk_summary = (
            "CAUTION: High-cost credit terms. The total borrowing cost and upfront fee significantly "
            "exceed standard regulated bank interest rates."
        )

    return LoanCalculationResult(
        stated_principal=round(stated_principal, 2),
        upfront_deduction=round(upfront_deduction, 2),
        net_disbursed=round(net_disbursed, 2),
        total_repayment=round(total_repayment, 2),
        total_borrowing_cost=round(total_borrowing_cost, 2),
        upfront_deduction_percentage=round(upfront_deduction_percentage, 2),
        period_interest_rate_percentage=round(period_interest_rate_percentage, 2),
        annualized_simple_apr=round(annualized_simple_apr, 2),
        annualized_compounded_ear=round(annualized_compounded_ear, 2),
        daily_interest_rate_percentage=round(daily_interest_rate_percentage, 3),
        risk_level=risk_level,
        risk_summary=risk_summary,
        flags=flags,
    )


def calculate_yield_metrics(params: YieldInputParams) -> YieldCalculationResult:
    """Calculate annualized returns and Ponzi risk metrics for an investment offer.

    Args:
        params: Yield input parameters including principal, return rate, and payout frequency.

    Returns:
        YieldCalculationResult with APY projection and benchmark comparisons.
    """
    investment_amount = max(0.0, float(params.investment_amount))
    promised_return_percentage = max(0.0, float(params.promised_return_percentage))
    frequency = params.frequency

    multiplier_map = {
        "daily": 365,
        "weekly": 52,
        "monthly": 12,
        "annual": 1,
    }
    multiplier_per_year = multiplier_map.get(frequency, 1)

    annualized_simple_yield_percentage = promised_return_percentage * multiplier_per_year

    rate_fraction = promised_return_percentage / 100.0
    annualized_compounded_apy_percentage = annualized_simple_yield_percentage

    if 0 < rate_fraction < 50:
        try:
            apy_val = ((1.0 + rate_fraction) ** multiplier_per_year - 1.0) * 100.0
            if apy_val < 1e12:
                annualized_compounded_apy_percentage = apy_val
        except (OverflowError, ValueError):
            annualized_compounded_apy_percentage = annualized_simple_yield_percentage * 10.0

    projected_annual_return_amount = (investment_amount * annualized_simple_yield_percentage) / 100.0

    benchmark_excess_multiplier = (
        round(annualized_simple_yield_percentage / RBI_REPO_RATE, 1) if RBI_REPO_RATE > 0 else 1.0
    )

    risk_level: YieldRiskLevel = "REASONABLE"
    if (
        annualized_simple_yield_percentage >= 50.0
        or frequency == "daily"
        or (frequency == "weekly" and promised_return_percentage >= 2.0)
    ):
        risk_level = "PONZI_TRAP"
    elif annualized_simple_yield_percentage >= BUDS_ACT_THRESHOLD:
        risk_level = "HIGH_RISK"

    flags: list[str] = []
    if frequency == "daily":
        flags.append(f"Daily return promises ({promised_return_percentage}%/day) are classic indicators of unsustainable Ponzi / HYIP fraud")
    if annualized_simple_yield_percentage >= BUDS_ACT_THRESHOLD:
        flags.append(
            f"Promised yield ({annualized_simple_yield_percentage:.1f}% p.a.) exceeds the 24% threshold regulated under the BUDS Act, 2019"
        )
    if benchmark_excess_multiplier >= 5.0:
        flags.append(
            f"Promised return is {benchmark_excess_multiplier}x higher than standard RBI repo rate and bank deposits"
        )

    risk_summary = "Promised yield is within normal regulated capital market expectations."
    if risk_level == "PONZI_TRAP":
        risk_summary = (
            "CRITICAL: Mathematically unsustainable guaranteed return. Matches high-yield Ponzi / "
            "unregulated deposit scheme patterns."
        )
    elif risk_level == "HIGH_RISK":
        risk_summary = (
            "CAUTION: Unusually high return promise exceeding market benchmarks. Requires verifying "
            "SEBI/RBI regulatory registration."
        )

    return YieldCalculationResult(
        investment_amount=round(investment_amount, 2),
        promised_return_percentage=round(promised_return_percentage, 2),
        frequency=frequency,
        annualized_simple_yield_percentage=round(annualized_simple_yield_percentage, 2),
        annualized_compounded_apy_percentage=round(annualized_compounded_apy_percentage, 2),
        projected_annual_return_amount=round(projected_annual_return_amount, 2),
        rbi_repo_rate_benchmark_percentage=RBI_REPO_RATE,
        market_index_benchmark_percentage=NIFTY_CAGR_BENCHMARK,
        benchmark_excess_multiplier=benchmark_excess_multiplier,
        risk_level=risk_level,
        risk_summary=risk_summary,
        flags=flags,
    )
