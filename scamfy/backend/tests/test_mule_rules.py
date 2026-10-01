from backend.app.api.v1.schemas.analyze import RiskLevel
from backend.app.core.evaluator import evaluate_message
from backend.app.core.extractors import extract_all_entities


def test_rule_money_mule_forwarding_commission():
    text = (
        "Part-time financial assistant needed! Receive ₹50,000 in your bank account, "
        "keep a 10% commission of ₹5,000, and transfer the remaining ₹45,000 to our UPI ID: merchant@paytm."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "MONEY_MULE_RECRUITMENT"
    assert any(s.id == "RULE-MONEY-MULE-FORWARDING" for s in res.signals)
    assert "Commission / Easy Money Lure" in res.psychological_tactics
    assert any("Do NOT receive or forward" in r for r in res.action_recommendations)


def test_rule_money_mule_crypto_conversion():
    text = (
        "Deposit ₹80,000 into your account today. Buy USDT crypto with the received funds "
        "and forward to wallet address. You earn ₹4,000 per transaction."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MONEY-MULE-FORWARDING" for s in res.signals)


def test_rule_account_rental_p2p():
    text = (
        "Urgent requirement: Rent your current account or savings bank account for crypto P2P arbitrage. "
        "Earn Rs 10,000 daily rent for providing your bank account. Contact @p2p_deals on Telegram."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "MONEY_MULE_RECRUITMENT"
    assert any(s.id == "RULE-ACCOUNT-RENTAL-P2P" for s in res.signals)
    assert "Account Rental Lure" in res.psychological_tactics
    assert any(
        "Never rent, lease, or share your bank account" in r for r in res.action_recommendations
    )


def test_rule_overpayment_reversal_mule():
    text = (
        "Hello sir, I mistakenly transferred Rs 25,000 to your UPI by mistake. "
        "Please refund the excess amount to this other phone number: 9876543210 immediately."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "MONEY_MULE_RECRUITMENT"
    assert any(s.id == "RULE-OVERPAYMENT-REVERSAL-MULE" for s in res.signals)
    assert "Fake Mistake Deception" in res.psychological_tactics
    assert any("dispute through their own banking app" in r for r in res.action_recommendations)


def test_benign_legitimate_p2p_payment_message():
    text = "Hey Rahul, I split the dinner bill. Transferred my share of Rs 650 to your Google Pay. Thanks!"
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("RULE-MONEY-MULE" in s.id for s in res.signals)
    assert not any("RULE-ACCOUNT-RENTAL" in s.id for s in res.signals)
    assert not any("RULE-OVERPAYMENT" in s.id for s in res.signals)


def test_benign_official_salary_notification():
    text = (
        "Your monthly salary of Rs 75,000 for September 2026 has been credited to your HDFC account. "
        "View your payslip on the internal employee portal."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)
