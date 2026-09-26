import pytest
from backend.app.api.v1.schemas.analyze import (
    ConfidenceTier,
    RiskLevel,
)
from backend.app.core.evaluator import evaluate_message
from backend.app.core.extractors import extract_all_entities
from backend.app.main import app
from httpx import ASGITransport, AsyncClient


def test_entity_extraction_comprehensive():
    sample_text = (
        "Dear Customer, your electricity bill is unpaid. Power will be disconnected tonight. "
        "Pay Rs. 1,450 to avoid cutoff. Send payment to upi id: billpay@okhdfcbank or call our officer "
        "Mr. Sharma at +919876543210 or visit https://bit.ly/power-pay. Contact email support@discom-desk.com "
        "IFSC HDFC0001234 or Telegram @power_help."
    )
    entities = extract_all_entities(sample_text)

    assert "billpay@okhdfcbank" in entities.upi_ids
    assert "9876543210" in entities.phone_numbers
    assert "https://bit.ly/power-pay" in entities.urls
    assert "support@discom-desk.com" in entities.emails
    assert "IFSC: HDFC0001234" in entities.bank_accounts
    assert any("1,450" in a for a in entities.amounts)
    assert "@power_help" in entities.handles


def test_evaluator_upi_pin_reverse_scam():
    text = "Congratulations! You won cashback of Rs 5,000. Enter your UPI PIN to receive money in your bank."
    entities = extract_all_entities(text)
    result = evaluate_message(text, entities)

    assert result.overall_risk == RiskLevel.CRITICAL
    assert result.confidence == ConfidenceTier.HIGH
    assert result.primary_category == "UPI_REVERSE_PAYMENT_FRAUD"
    assert any(s.id == "RULE-UPI-PIN-REVERSE" for s in result.signals)
    assert any("UPI PIN is required ONLY to SEND money" in r for r in result.action_recommendations)


def test_evaluator_electricity_disconnection_scam():
    text = "Dear consumer, your electricity will be disconnected tonight by 9:30 PM. Call electricity officer at 9876543210."
    entities = extract_all_entities(text)
    result = evaluate_message(text, entities)

    assert result.overall_risk == RiskLevel.CRITICAL
    assert result.primary_category == "UTILITY_ELECTRICITY_FRAUD"
    assert any("electricity" in s.name.lower() for s in result.signals)


def test_evaluator_digital_arrest_scam():
    text = "Police department notice: Digital arrest warrant issued against you for illegal parcel at customs. Join video call for interrogation."
    entities = extract_all_entities(text)
    result = evaluate_message(text, entities)

    assert result.overall_risk == RiskLevel.CRITICAL
    assert result.primary_category == "IMPERSONATION_POLICE_EXTORTION"
    assert any("1930" in r for r in result.action_recommendations)


def test_evaluator_part_time_task_scam():
    text = "Work from home part time job! Earn Rs 2500 - 5000 daily by liking YouTube videos. Join telegram group @task_earning."
    entities = extract_all_entities(text)
    result = evaluate_message(text, entities)

    assert result.overall_risk == RiskLevel.HIGH_RISK
    assert result.primary_category == "TASK_COMMISSION_FRAUD"


def test_evaluator_clean_safe_message():
    text = "Team, please review the presentation slides before tomorrow's quarterly review meeting at 10:00 AM."
    entities = extract_all_entities(text)
    result = evaluate_message(text, entities)

    assert result.overall_risk == RiskLevel.SAFE
    assert result.confidence == ConfidenceTier.LOW
    assert len(result.signals) == 0


@pytest.mark.asyncio
async def test_analyze_api_endpoint():
    payload = {
        "text": "Dear customer, your electricity power will be disconnected tonight. Call officer at 9876543210 immediately."
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["overall_risk"] == "CRITICAL"
    assert data["primary_category"] == "UTILITY_ELECTRICITY_FRAUD"
    assert len(data["signals"]) >= 1
    assert "9876543210" in data["extracted_entities"]["phone_numbers"]
    assert len(data["action_recommendations"]) >= 1
    assert "model_metadata" in data


@pytest.mark.asyncio
async def test_analyze_api_endpoint_validation_error():
    payload = {"text": "hi"}  # Too short (min 3 chars)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/analyze", json=payload)

    assert response.status_code == 422
