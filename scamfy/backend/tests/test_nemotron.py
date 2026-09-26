import json
from unittest.mock import patch

import httpx
import pytest
from backend.app.api.v1.schemas.analyze import (
    ConfidenceTier,
    ExtractedEntities,
    RiskLevel,
)
from backend.app.core.config import settings
from backend.app.core.nemotron import _sanitize_json_content, analyze_with_nemotron


def test_sanitize_json_content_with_markdown_fences():
    raw_markdown = '```json\n{"overall_risk": "CRITICAL", "confidence": "high"}\n```'
    assert (
        _sanitize_json_content(raw_markdown) == '{"overall_risk": "CRITICAL", "confidence": "high"}'
    )

    raw_plain = '{"overall_risk": "SAFE"}'
    assert _sanitize_json_content(raw_plain) == '{"overall_risk": "SAFE"}'


@pytest.mark.asyncio
async def test_nemotron_skips_when_api_key_empty():
    with patch.object(settings, "NVIDIA_API_KEY", ""):
        entities = ExtractedEntities()
        result, metadata = await analyze_with_nemotron("test message", entities)
        assert result is None
        assert metadata["ai_assisted"] is False
        assert metadata["fallback_reason"] == "NVIDIA_API_KEY_NOT_CONFIGURED"


@pytest.mark.asyncio
async def test_nemotron_successful_inference_contract():
    mock_payload = {
        "overall_risk": "CRITICAL",
        "confidence": "high",
        "primary_category": "UPI_REVERSE_PAYMENT_FRAUD",
        "secondary_categories": [],
        "signals": [
            {
                "id": "AI-UPI-REVERSE",
                "name": "UPI PIN Request Fraud",
                "description": "PIN is requested to claim money",
                "severity": "CRITICAL",
                "evidence": "Enter UPI PIN to receive money",
            }
        ],
        "psychological_tactics": ["Greed Trap", "Reversal Deception"],
        "missing_evidence": ["No legitimate merchant billing statement"],
        "synthesis_summary": "The message attempts to deceive the user into authorizing a debit transaction.",
        "action_recommendations": ["Do not enter your PIN."],
    }

    mock_response_json = {
        "id": "chatcmpl-12345",
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": f"```json\n{json.dumps(mock_payload)}\n```",
                }
            }
        ],
        "usage": {"total_tokens": 150},
    }

    async def mock_post(*args, **kwargs):
        return httpx.Response(
            200, json=mock_response_json, request=httpx.Request("POST", "http://test")
        )

    with patch.object(settings, "NVIDIA_API_KEY", "nvapi-test-key"):
        async with httpx.AsyncClient() as client:
            with patch.object(client, "post", side_effect=mock_post):
                entities = ExtractedEntities(upi_ids=["test@okhdfc"])
                result, metadata = await analyze_with_nemotron(
                    "Enter UPI PIN to receive ₹5000", entities, client=client
                )

                assert result is not None
                assert result.overall_risk == RiskLevel.CRITICAL
                assert result.confidence == ConfidenceTier.HIGH
                assert result.primary_category == "UPI_REVERSE_PAYMENT_FRAUD"
                assert len(result.signals) == 1
                assert "Greed Trap" in result.psychological_tactics
                assert len(result.missing_evidence) == 1
                assert metadata["ai_assisted"] is True
                assert metadata["model_slug"] == settings.NEMOTRON_MODEL_SLUG
                assert metadata["tokens_used"] == 150


@pytest.mark.asyncio
async def test_nemotron_upstream_error_fallback():
    async def mock_post_500(*args, **kwargs):
        return httpx.Response(
            500, text="Internal Server Error", request=httpx.Request("POST", "http://test")
        )

    with patch.object(settings, "NVIDIA_API_KEY", "nvapi-test-key"):
        async with httpx.AsyncClient() as client:
            with patch.object(client, "post", side_effect=mock_post_500):
                entities = ExtractedEntities()
                result, metadata = await analyze_with_nemotron(
                    "Suspicious message", entities, client=client
                )
                assert result is None
                assert metadata["ai_assisted"] is False
                assert "UPSTREAM_HTTP_500" in metadata["fallback_reason"]


@pytest.mark.asyncio
async def test_nemotron_malformed_json_fallback():
    async def mock_post_malformed(*args, **kwargs):
        return httpx.Response(
            200,
            json={"choices": [{"message": {"content": "Not valid JSON output"}}]},
            request=httpx.Request("POST", "http://test"),
        )

    with patch.object(settings, "NVIDIA_API_KEY", "nvapi-test-key"):
        async with httpx.AsyncClient() as client:
            with patch.object(client, "post", side_effect=mock_post_malformed):
                entities = ExtractedEntities()
                result, metadata = await analyze_with_nemotron(
                    "Suspicious message", entities, client=client
                )
                assert result is None
                assert metadata["ai_assisted"] is False
                assert "INFERENCE_ERROR" in metadata["fallback_reason"]
