from backend.app.api.v1.schemas.analyze import RiskLevel
from backend.app.core.evaluator import evaluate_message
from backend.app.core.extractors import extract_all_entities

# ============================================================================
# POSITIVE TEST CASES: Core & Student-Specific Money-Mule Recruitment Patterns
# ============================================================================


def test_rule_money_mule_forwarding_commission():
    """Verify detection of fund forwarding with percentage commission lure."""
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
    """Verify detection of receiving funds and converting to USDT crypto."""
    text = (
        "Deposit ₹80,000 into your account today. Buy USDT crypto with the received funds "
        "and forward to wallet address. You earn ₹4,000 per transaction."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MONEY-MULE-FORWARDING" for s in res.signals)


def test_rule_account_rental_p2p():
    """Verify detection of bank account rental solicitation for P2P crypto arbitrage."""
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
        "Never rent, lease, share, or arrange your bank account" in r
        for r in res.action_recommendations
    )


def test_rule_account_rental_telegram_campus():
    """Verify detection of campus student account procurement on messaging channels."""
    text = (
        "Campus student offer on Telegram: procure or arrange 3 savings accounts of friends "
        "for daily rent of Rs 2,500 per active account."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-ACCOUNT-RENTAL-P2P" for s in res.signals)


def test_rule_overpayment_reversal_mule():
    """Verify detection of accidental transfer pretext requesting reverse payout."""
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


def test_rule_mule_loan_assistance_instrument_harvesting():
    """Family A: Loan assistance pretext soliciting blank signed cheques & debit cards."""
    text = (
        "Education loan approval guaranteed without CIBIL check! "
        "To process your instant loan, send 2 blank signed cheques and your debit card with PIN to our DSA agent."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "MONEY_MULE_RECRUITMENT"
    assert any(s.id == "RULE-MULE-LOAN-ASSISTANCE-PRETEXT" for s in res.signals)
    assert "Loan Assistance Bait" in res.psychological_tactics
    assert any("Legitimate lenders and DSAs NEVER ask" in r for r in res.action_recommendations)


def test_rule_mule_loan_assistance_routing():
    """Family A: Loan assistance pretext routing funds through student account."""
    text = (
        "Instant loan assistance: We will disburse loan funds into your savings account. "
        "Forward and transfer the amount to our corporate agency UPI and keep 5% commission."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-LOAN-ASSISTANCE-PRETEXT" for s in res.signals)


def test_rule_mule_scholarship_fund_forwarding():
    """Family B: Fake scholarship distribution asking student to receive & forward."""
    text = (
        "Government scholarship scheme distribution assistant: receive scholarship funds of ₹60,000 "
        "into your bank account, keep a commission of 10%, and transfer the balance to our coordinator."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "MONEY_MULE_RECRUITMENT"
    assert any(s.id == "RULE-MULE-SCHOLARSHIP-JOB-COMMISSION" for s in res.signals)
    assert "Education/Job Masquerade" in res.psychological_tactics


def test_rule_mule_job_personal_account_processing():
    """Family B: Part-time job asking candidate to use personal account for client payments."""
    text = (
        "Work from home internship: use your personal bank account and Google Pay to route company client payments. "
        "Earn 8% commission per transaction."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-SCHOLARSHIP-JOB-COMMISSION" for s in res.signals)


def test_rule_mule_student_peer_arranging():
    """Family B: Recruiter asking student to arrange/procure friend accounts for commission."""
    text = (
        "College campus coordinator role: arrange bank accounts of students and friends. "
        "Earn ₹3,000 commission for every active account arranged."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-SCHOLARSHIP-JOB-COMMISSION" for s in res.signals)


def test_rule_mule_banking_instrument_standalone_capture():
    """Family C: Direct banking instrument & credential harvesting."""
    text = (
        "Urgent verification: Courier your ATM card, cheque book, and welcome kit with PIN "
        "to our branch address to activate your account."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-BANKING-INSTRUMENT-CAPTURE" for s in res.signals)
    assert "Credential Harvesting" in res.psychological_tactics
    assert any(
        "Never share or courier blank signed cheques" in r for r in res.action_recommendations
    )


def test_rule_mule_otp_forwarding_capture():
    """Family C: Request to forward bank OTPs to operate account."""
    text = "Forward all bank OTPs received on your phone to our manager so they can operate the account."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-BANKING-INSTRUMENT-CAPTURE" for s in res.signals)


def test_rule_mule_direct_upi_pin_sharing_capture():
    """Family C: Direct request to send or share UPI PIN to operate an account."""
    text = "Send us your UPI PIN so we can operate your account."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-BANKING-INSTRUMENT-CAPTURE" for s in res.signals)
    assert any(
        "Never disclose NetBanking passwords, UPI PINs" in r for r in res.action_recommendations
    )


def test_rule_mule_intermediary_reassurance():
    """Family D: Deceptive risk minimization ('only an intermediary') with fund routing."""
    text = (
        "You are only an intermediary helping transfer funds for our client. "
        "It is completely harmless and you have no risk. Receive ₹40,000 in your UPI and forward ₹36,000."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert any(s.id == "RULE-MULE-INTERMEDIARY-REASSURANCE" for s in res.signals)
    assert "Deceptive Risk Minimization" in res.psychological_tactics
    assert any("only an intermediary" in r for r in res.action_recommendations)


def test_rule_mule_corporate_account_creation():
    """Family E: Request to open an account in student's name for company use."""
    text = (
        "Open a new bank account in your name under your PAN card for our crypto trading company to operate. "
        "We will pay you monthly rent of Rs 15,000."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.CRITICAL
    assert res.primary_category == "MONEY_MULE_RECRUITMENT"
    assert any(s.id == "RULE-MULE-CORPORATE-ACCOUNT-CREATION" for s in res.signals)
    assert "Identity Exploitation" in res.psychological_tactics


# ============================================================================
# NEGATIVE TEST CONTROLS: Legitimate Transactions (False-Positive Prevention)
# ============================================================================


def test_benign_legitimate_p2p_payment_message():
    """Negative Control 1: Routine split bill between friends."""
    text = "Hey Rahul, I split the dinner bill. Transferred my share of Rs 650 to your Google Pay. Thanks!"
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)
    assert not any("RENTAL" in s.id for s in res.signals)
    assert not any("OVERPAYMENT" in s.id for s in res.signals)


def test_benign_official_salary_notification():
    """Negative Control 2: Legitimate monthly salary credit."""
    text = (
        "Your monthly salary of Rs 75,000 for September 2026 has been credited to your HDFC account. "
        "View your payslip on the internal employee portal."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)


def test_benign_employer_reimbursement():
    """Negative Control 3: Expense reimbursement."""
    text = "Expense reimbursement of Rs 4,200 for client travel has been approved and credited to your account."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)


def test_benign_family_transfer():
    """Negative Control 4: Family transfer for educational / living expenses."""
    text = "Mom sent Rs 5,000 for your hostel mess fees and college books. Let me know when you receive it."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)


def test_benign_genuine_scholarship_disbursement():
    """Negative Control 5: Official government scholarship disbursement."""
    text = (
        "Congratulations! Your National Merit Scholarship disbursement of Rs 20,000 "
        "has been credited directly to your registered bank account by the Ministry of Education."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)


def test_benign_bank_loan_sanction():
    """Negative Control 6: Legitimate bank loan sanction letter."""
    text = (
        "Dear Customer, your education loan application #LN-8921 has been sanctioned by SBI. "
        "Please visit your home branch with your original marksheet and admission letter for document verification."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)


def test_benign_ordinary_internship_offer():
    """Negative Control 7: Ordinary internship offer without suspicious account-use instructions."""
    text = (
        "We are pleased to offer you the position of Software Engineer Intern at Acme Labs. "
        "Your monthly stipend will be Rs 35,000. Please sign the attached offer letter and report on Monday."
    )
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert res.overall_risk == RiskLevel.SAFE
    assert not any("MULE" in s.id for s in res.signals)


def test_mistaken_transfer_unrelated_request_does_not_trigger_mule_reversal():
    """Negative Control 8: Accidentally transferred money without reverse routing trap."""
    text = "I accidentally transferred Rs. 500 yesterday. Please send documents and the report to my email."
    entities = extract_all_entities(text)
    res = evaluate_message(text, entities)

    assert not any(s.id == "RULE-OVERPAYMENT-REVERSAL-MULE" for s in res.signals)
