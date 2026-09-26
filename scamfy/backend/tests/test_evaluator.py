from backend.app.api.v1.schemas.analyze import RiskLevel
from backend.app.core.evaluator import RULES, evaluate_message
from backend.app.core.extractors import extract_all_entities


def test_rules_count_and_uniqueness():
    rule_ids = [r["id"] for r in RULES]
    assert len(rule_ids) == 10
    assert len(set(rule_ids)) == 10


def test_rule_upi_pin_reverse():
    text = (
        "Congratulations! You won ₹2,500 cashback. Enter your UPI PIN to claim credit in account."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "UPI_REVERSE_PAYMENT_FRAUD"
    assert any(s.id == "RULE-UPI-PIN-REVERSE" for s in res.signals)
    assert "Greed / Reward Trap" in res.psychological_tactics


def test_rule_digital_arrest():
    text = "CBI officer notice: Digital arrest warrant issued for illegal parcel containing narcotics at Mumbai customs. Join video call for statement."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "IMPERSONATION_POLICE_EXTORTION"
    assert any(s.id == "RULE-DIGITAL-ARREST-EXTORTION" for s in res.signals)
    assert "False Authority Impersonation" in res.psychological_tactics
    assert any("summons" in m.lower() for m in res.missing_evidence)


def test_rule_customs_parcel_extortion():
    text = "FedEx courier consignment held at customs. Contraband and drugs found in your parcel. Contact police officer for clearance."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-CUSTOMS-PARCEL-EXTORTION" for s in res.signals)


def test_rule_loan_apk_harassment():
    text = "Instant 7 day loan approved Rs 50,000 without CIBIL. Download APK link http://instant-credit.apk and grant contacts permission."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "PREDATORY_LOAN_FRAUD"
    assert any(s.id == "RULE-LOAN-APK-HARASSMENT" for s in res.signals)


def test_rule_electricity_disconnection():
    text = "Dear consumer, your electricity bill is unpaid. Power will be disconnected tonight. Call officer at 9876543210."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-ELECTRICITY-DISCONNECTION" for s in res.signals)
    assert any("DISCOM" in m for m in res.missing_evidence)


def test_rule_part_time_task_scam():
    text = "Part time work from home job! Like YouTube videos and earn Rs 3000 daily. Join Telegram group @vip_tasks."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.HIGH_RISK
    assert res.primary_category == "TASK_COMMISSION_FRAUD"
    assert any(s.id == "RULE-PART-TIME-TASK-COMMISSION" for s in res.signals)


def test_rule_bank_kyc_pan_phishing():
    text = "Dear customer, your SBI bank account has been blocked. Click here to update your PAN immediately: https://bit.ly/sbi-kyc"
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.HIGH_RISK
    assert any(s.id == "RULE-BANK-KYC-PAN-PHISHING" for s in res.signals)
    assert any("shortener" in m.lower() for m in res.missing_evidence)


def test_rule_crypto_stock_vip_trap():
    text = "Join our VIP stock trading signal group on WhatsApp! Guaranteed profit of 40% daily with institutional upper circuit insider tips."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.HIGH_RISK
    assert res.primary_category == "INVESTMENT_STOCK_FRAUD"
    assert any(s.id == "RULE-CRYPTO-STOCK-VIP-TRAP" for s in res.signals)


def test_rule_fake_customer_care():
    text = "For airline ticket refund or cancellation, call our customer care support helpline officer: 9876543210."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.SUSPICIOUS
    assert any(s.id == "RULE-FAKE-CUSTOMER-CARE" for s in res.signals)


def test_rule_suspicious_short_url():
    text = "Your package delivery tracking details are updated at https://tinyurl.com/track-pkg."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.SUSPICIOUS
    assert any(s.id == "RULE-SUSPICIOUS-SHORT-URL" for s in res.signals)


def test_clean_benign_message():
    text = "Hi Alice, could we schedule our project sync meeting for tomorrow at 2 PM in conference room A?"
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.SAFE
    assert len(res.signals) == 0
    assert len(res.missing_evidence) == 0
    assert "No known active scam indicators" in res.synthesis_summary


def test_detect_missing_evidence_shorteners():
    # Message with only shortener URL and critical threat
    text = "CBI Digital Arrest: parcel seized. Connect immediately: https://bit.ly/cbi-case"
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)
    assert res.overall_risk == RiskLevel.CRITICAL
    # Both notices must be present: no direct verifiable domain AND domain is obscured by shortener
    assert any("No verifiable corporate domain" in m for m in res.missing_evidence)
    assert any(
        "Destination domain is obscured by a URL shortener" in m for m in res.missing_evidence
    )

    # Message with legitimate corporate domain and critical threat
    text_corp = "CBI Digital Arrest: parcel seized. Connect at https://cbi.gov.in/verify"
    entities_corp = extract_all_entities(text_corp)
    res_corp = evaluate_message(text_corp, entities_corp)
    assert not any("No verifiable corporate domain" in m for m in res_corp.missing_evidence)
    assert not any("Destination domain is obscured" in m for m in res_corp.missing_evidence)
