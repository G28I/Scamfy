"""Unit tests for backend financial calculation engine (LOAN-01, LOAN-02)."""

from app.core.financial import (
    HEURISTIC_HIGH_COST_APR_THRESHOLD,
    HEURISTIC_PREDATORY_APR_THRESHOLD,
    RBI_REPO_RATE,
    UNREGULATED_HIGH_YIELD_ANOMALY_THRESHOLD,
    LoanInputParams,
    YieldInputParams,
    calculate_loan_metrics,
    calculate_yield_metrics,
    classify_loan_risk,
)


def test_calculate_loan_metrics_predatory_7day_trap():
    """Verify that a 7-day predatory loan app with 30% upfront deduction is classified as PREDATORY."""
    params = LoanInputParams(
        stated_principal=5000.0,
        upfront_deduction=1500.0,
        total_repayment=5000.0,
        tenure_days=7,
    )
    result = calculate_loan_metrics(params)

    assert result.net_disbursed == 3500.0
    assert result.total_borrowing_cost == 1500.0
    assert result.upfront_deduction_percentage == 30.0
    assert result.risk_level == "PREDATORY"
    assert result.annualized_simple_apr > 2000.0
    assert len(result.flags) >= 2
    assert any("7-day" in f for f in result.flags)
    assert "CRITICAL" in result.risk_summary


def test_calculate_loan_metrics_standard_bank_loan():
    """Verify that a standard regulated personal loan is classified as NORMAL risk."""
    params = LoanInputParams(
        stated_principal=100000.0,
        upfront_deduction=1500.0,
        total_repayment=112000.0,
        tenure_days=365,
    )
    result = calculate_loan_metrics(params)

    assert result.net_disbursed == 98500.0
    assert result.upfront_deduction_percentage == 1.5
    assert result.annualized_simple_apr < 20.0
    assert result.risk_level == "NORMAL"
    assert "standard market ranges" in result.risk_summary


def test_calculate_loan_metrics_high_cost_micro_loan():
    """Verify that a high-cost loan is classified as HIGH_COST."""
    params = LoanInputParams(
        stated_principal=10000.0,
        upfront_deduction=500.0,
        total_repayment=11200.0,
        tenure_days=120,
    )
    result = calculate_loan_metrics(params)

    assert result.net_disbursed == 9500.0
    assert result.upfront_deduction_percentage == 5.0
    assert 36.0 < result.annualized_simple_apr < 100.0
    assert result.risk_level == "HIGH_COST"
    assert "CAUTION" in result.risk_summary


def test_classify_loan_risk_thresholds():
    """Verify risk classification boundary conditions."""
    assert classify_loan_risk(HEURISTIC_PREDATORY_APR_THRESHOLD, 60, 0.05) == "PREDATORY"
    assert classify_loan_risk(25.0, 7, 0.20) == "PREDATORY"
    assert classify_loan_risk(40.0, 90, 0.05) == "HIGH_COST"
    assert classify_loan_risk(12.0, 365, 0.02) == "NORMAL"


def test_calculate_yield_metrics_daily_ponzi():
    """Verify that daily compounding return offers are flagged as PONZI_TRAP."""
    params = YieldInputParams(
        investment_amount=10000.0,
        promised_return_percentage=2.0,
        frequency="daily",
    )
    result = calculate_yield_metrics(params)

    assert result.annualized_simple_yield_percentage == 730.0
    assert result.risk_level == "PONZI_TRAP"
    assert result.benchmark_excess_multiplier > 100.0
    assert any("Ponzi" in f for f in result.flags)
    assert "CRITICAL" in result.risk_summary


def test_calculate_yield_metrics_reasonable_investment():
    """Verify that market-standard returns are classified as REASONABLE."""
    params = YieldInputParams(
        investment_amount=50000.0,
        promised_return_percentage=12.0,
        frequency="annual",
    )
    result = calculate_yield_metrics(params)

    assert result.annualized_simple_yield_percentage == 12.0
    assert result.risk_level == "REASONABLE"
    assert "standard regulated capital market" in result.risk_summary


def test_calculate_yield_metrics_buds_act_threshold():
    """Verify that guaranteed 30% yield triggers HIGH_RISK under BUDS Act warning."""
    params = YieldInputParams(
        investment_amount=25000.0,
        promised_return_percentage=2.5,
        frequency="monthly",
    )
    result = calculate_yield_metrics(params)

    assert result.annualized_simple_yield_percentage == 30.0
    assert result.risk_level == "HIGH_RISK"
    assert any("BUDS Act" in f for f in result.flags)


def test_calculate_yield_metrics_zero_and_borderline_daily_return():
    """Verify that zero return and low daily return (<0.1%/day) do not trigger false positive Ponzi flags."""
    zero_result = calculate_yield_metrics(
        YieldInputParams(
            investment_amount=10000.0,
            promised_return_percentage=0.0,
            frequency="daily",
        )
    )
    assert zero_result.annualized_simple_yield_percentage == 0.0
    assert zero_result.risk_level == "REASONABLE"
    assert len(zero_result.flags) == 0

    borderline_result = calculate_yield_metrics(
        YieldInputParams(
            investment_amount=10000.0,
            promised_return_percentage=0.05,
            frequency="daily",
        )
    )
    assert borderline_result.annualized_simple_yield_percentage == 18.25
    assert borderline_result.risk_level == "REASONABLE"
    assert len(borderline_result.flags) == 0


def test_financial_constants():
    """Verify regulatory and heuristic constants are defined accurately."""
    assert RBI_REPO_RATE == 5.50
    assert UNREGULATED_HIGH_YIELD_ANOMALY_THRESHOLD == 24.0
    assert HEURISTIC_PREDATORY_APR_THRESHOLD == 100.0
    assert HEURISTIC_HIGH_COST_APR_THRESHOLD == 36.0
