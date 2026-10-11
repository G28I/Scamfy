"""Unit tests for predatory loan and high-yield investment trap detection rules (LOAN-01, LOAN-02, LOAN-03)."""

from app.api.v1.schemas.analyze import RiskLevel
from app.core.evaluator import evaluate_message
from app.core.extractors import extract_all_entities


def test_rule_loan_7day_tenure_positive():
    """Verify detection of 7-day predatory digital lending app loan trap."""
    text = (
        "Congratulations! Quick Cash Loan approved Rs. 10,000. Stated tenure is 7 days. "
        "Repay within 7 days to avoid penalty. Apply now."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.HIGH_RISK
    assert res.primary_category == "PREDATORY_LOAN_FRAUD"
    assert any(s.id == "RULE-LOAN-7DAY-TENURE" for s in res.signals)
    assert "Predatory Tenures" in res.psychological_tactics
    assert any("Key Fact Statement" in m for m in res.missing_evidence)


def test_rule_loan_upfront_deduction_positive():
    """Verify detection of excessive upfront fee deduction scheme."""
    text = (
        "Loan sanctioned for Rs 20,000. Note: Deduct Rs 6,000 processing fee and GST upfront. "
        "You will receive net credit of Rs 14,000 in your bank account."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.HIGH_RISK
    assert any(s.id == "RULE-LOAN-UPFRONT-DEDUCTION" for s in res.signals)
    assert "Hidden Fee Deception" in res.psychological_tactics


def test_rule_loan_upfront_deduction_percentage_boundary_and_over_100():
    """Verify upfront deduction percentage pattern handles >=100% and rejects partial-number matches."""
    # 1. 100% upfront fee before loan disbursal
    text_100 = "Pay 100% upfront processing fee before loan disbursement can be completed."
    res_100 = evaluate_message(text_100, extract_all_entities(text_100))
    assert any(s.id == "RULE-LOAN-UPFRONT-DEDUCTION" for s in res_100.signals)

    # 2. 120% upfront platform deduction before loan disbursal
    text_120 = "Terms: 120% upfront platform deduction applies to this personal loan disbursement."
    res_120 = evaluate_message(text_120, extract_all_entities(text_120))
    assert any(s.id == "RULE-LOAN-UPFRONT-DEDUCTION" for s in res_120.signals)

    # 3. 35.5% upfront processing charge before loan disbursal
    text_decimal = "Special loan offer with 35.5% upfront processing charge before loan disbursal."
    res_decimal = evaluate_message(text_decimal, extract_all_entities(text_decimal))
    assert any(s.id == "RULE-LOAN-UPFRONT-DEDUCTION" for s in res_decimal.signals)

    # 4. Partial number rejection: 15% upfront fee should NOT match 5% (boundary check)
    text_15 = "Sanction letter: 15% upfront processing fee applicable on total loan disbursement."
    res_15 = evaluate_message(text_15, extract_all_entities(text_15))
    assert not any(s.id == "RULE-LOAN-UPFRONT-DEDUCTION" for s in res_15.signals)


def test_rule_loan_contact_harvest_blackmail_positive():
    """Verify detection of loan recovery shaming and contact harvesting extortion."""
    text = (
        "Warning defaulter! If you do not repay your loan today, we will send your morphed pictures "
        "and message all contacts in your phonebook to defame you as a fraud."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-LOAN-CONTACT-HARVEST-BLACKMAIL" for s in res.signals)
    assert "Social Shaming Extortion" in res.psychological_tactics


def test_rule_loan_advance_fee_approval_positive():
    """Verify detection of advance-fee loan release scam."""
    text = (
        "Your personal loan of Rs. 3,00,000 is approved under PM Mudra Scheme. "
        "First pay Rs. 4,500 as file charge and approval fee to release the loan amount."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-LOAN-ADVANCE-FEE-APPROVAL" for s in res.signals)
    assert "Advance-Fee Bait" in res.psychological_tactics


def test_rule_yield_guaranteed_daily_return_positive():
    """Verify detection of guaranteed daily return Ponzi schemes."""
    text = (
        "Join our daily yield pool! Guaranteed return of 3% daily with instant "
        "withdrawals. Double your investment in 30 days."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.HIGH_RISK
    assert res.primary_category == "INVESTMENT_PONZI_FRAUD"
    assert any(s.id == "RULE-YIELD-GUARANTEED-DAILY-RETURN" for s in res.signals)
    assert any("statutory regulatory registration" in m or "fund prospectus" in m for m in res.missing_evidence)


def test_negative_controls_legitimate_financial_communications():
    """Verify negative controls on legitimate bank and investment communications."""
    # 1. Legitimate bank pre-approved personal loan with annual rate
    bank_text = (
        "Dear Customer, HDFC Bank pre-approved Personal Loan of Rs. 5,00,000 at 10.5% p.a. "
        "with flexible tenure up to 60 months. Check eligibility in NetBanking."
    )
    bank_entities = extract_all_entities(bank_text)
    bank_res = evaluate_message(bank_text, bank_entities)
    assert not any(s.id.startswith("RULE-LOAN-") for s in bank_res.signals)
    assert not any(s.id.startswith("RULE-YIELD-") for s in bank_res.signals)

    # 2. Legitimate Mutual Fund SIP / Index Fund notice
    mf_text = (
        "Your monthly SIP of Rs. 2,000 in SBI Nifty 50 Index Fund has been processed successfully. "
        "NAV: 185.42. Mutual fund investments are subject to market risks."
    )
    mf_entities = extract_all_entities(mf_text)
    mf_res = evaluate_message(mf_text, mf_entities)
    assert not any(s.id.startswith("RULE-LOAN-") for s in mf_res.signals)
    assert not any(s.id.startswith("RULE-YIELD-") for s in mf_res.signals)

    # 3. Legitimate Fixed Deposit maturity alert
    fd_text = (
        "Your ICICI Bank Fixed Deposit of Rs. 1,00,000 is maturing on 15 Oct 2026. "
        "Earn 7.10% p.a. for senior citizens on reinvestment."
    )
    fd_entities = extract_all_entities(fd_text)
    fd_res = evaluate_message(fd_text, fd_entities)
    assert not any(s.id.startswith("RULE-LOAN-") for s in fd_res.signals)
    assert not any(s.id.startswith("RULE-YIELD-") for s in fd_res.signals)

    # 4. Benign casual 7-day loan mention without predatory app / urgent disbursement context
    casual_text = "I repaid my friend's 7-day loan yesterday over UPI."
    casual_entities = extract_all_entities(casual_text)
    casual_res = evaluate_message(casual_text, casual_entities)
    assert not any(s.id == "RULE-LOAN-7DAY-TENURE" for s in casual_res.signals)

    # 5. Standard bank processing fee disclosure (1.5% - 2%)
    fee_text = (
        "SBI Car Loan sanctioned for Rs 8,00,000. A standard processing fee of 1.5% + GST "
        "will be deducted from the disbursement amount as per schedule."
    )
    fee_entities = extract_all_entities(fee_text)
    fee_res = evaluate_message(fee_text, fee_entities)
    assert not any(s.id == "RULE-LOAN-UPFRONT-DEDUCTION" for s in fee_res.signals)

    # 6. Zero return and modest daily return updates without Ponzi/guaranteed trap
    daily_update_text = (
        "Daily liquid mutual fund performance report: NAV moved +0.015% today. Past performance does not guarantee future returns."
    )
    daily_entities = extract_all_entities(daily_update_text)
    daily_res = evaluate_message(daily_update_text, daily_entities)
    assert not any(s.id == "RULE-YIELD-GUARANTEED-DAILY-RETURN" for s in daily_res.signals)
    assert daily_res.overall_risk != RiskLevel.CRITICAL
