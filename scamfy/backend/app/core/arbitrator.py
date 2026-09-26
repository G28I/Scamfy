from typing import Any

from backend.app.api.v1.schemas.analyze import (
    AnalysisSignal,
    AnalyzeResponse,
    ConfidenceTier,
    ExtractedEntities,
    NemotronAnalysisOutput,
    RiskLevel,
)
from backend.app.core.config import settings
from backend.app.core.evaluator import RULES


def arbitrate_hybrid_analysis(
    det_response: AnalyzeResponse,
    nemotron_output: NemotronAnalysisOutput | None,
    nemotron_metadata: dict[str, Any],
    entities: ExtractedEntities,
) -> AnalyzeResponse:
    """Arbitrate between deterministic red-flag rules and Nemotron NIM inference.

    Enforces critical safety invariants (AI-01):
    - Deterministic CRITICAL risk cannot be downgraded by LLM.
    - Deterministic signals and recovery guidance are strictly preserved.
    - Nemotron enriches psychological tactic detection, missing evidence modeling, and executive summary.
    """
    if nemotron_output is None:
        # Graceful fallback: return deterministic evaluation with fallback metadata
        merged_metadata = {**det_response.model_metadata, **nemotron_metadata}
        return AnalyzeResponse(
            overall_risk=det_response.overall_risk,
            confidence=det_response.confidence,
            primary_category=det_response.primary_category,
            secondary_categories=det_response.secondary_categories,
            signals=det_response.signals,
            extracted_entities=entities,
            psychological_tactics=det_response.psychological_tactics,
            missing_evidence=det_response.missing_evidence,
            synthesis_summary=det_response.synthesis_summary,
            action_recommendations=det_response.action_recommendations,
            model_metadata=merged_metadata,
        )

    severity_order = {
        RiskLevel.SAFE: 0,
        RiskLevel.CAUTION: 1,
        RiskLevel.SUSPICIOUS: 2,
        RiskLevel.HIGH_RISK: 3,
        RiskLevel.CRITICAL: 4,
    }
    rank_to_severity = {v: k for k, v in severity_order.items()}

    det_rank = severity_order[det_response.overall_risk]
    llm_rank = severity_order[nemotron_output.overall_risk]

    # AI-01: Critical safety floor
    final_rank = max(det_rank, llm_rank)
    final_risk = rank_to_severity[final_rank]

    # Category determination
    if det_rank >= 3 and det_response.primary_category != "INFORMATIONAL_OR_UNKNOWN":
        primary_category = det_response.primary_category
    else:
        primary_category = nemotron_output.primary_category or det_response.primary_category

    all_secondary = det_response.secondary_categories + nemotron_output.secondary_categories
    if (
        det_response.primary_category != primary_category
        and det_response.primary_category != "INFORMATIONAL_OR_UNKNOWN"
    ):
        all_secondary.append(det_response.primary_category)
    secondary_categories = list(dict.fromkeys([c for c in all_secondary if c != primary_category]))

    # Signals deduplication
    signals_dict: dict[str, AnalysisSignal] = {}
    for s in det_response.signals:
        signals_dict[s.id] = s
    for s in nemotron_output.signals:
        if s.id not in signals_dict:
            signals_dict[s.id] = s
    combined_signals = list(signals_dict.values())

    # Psychological tactics & missing evidence
    combined_tactics = list(
        dict.fromkeys(det_response.psychological_tactics + nemotron_output.psychological_tactics)
    )
    combined_missing_evidence = list(
        dict.fromkeys(det_response.missing_evidence + nemotron_output.missing_evidence)
    )

    # Action recommendations (deterministic safety recommendations prioritized first)
    combined_recommendations = list(
        dict.fromkeys(det_response.action_recommendations + nemotron_output.action_recommendations)
    )

    # Synthesis summary
    synthesis_summary = (
        nemotron_output.synthesis_summary
        if nemotron_output.synthesis_summary.strip()
        else det_response.synthesis_summary
    )

    # Confidence calculation
    if det_rank >= 3 and len(combined_signals) >= 1:
        confidence = ConfidenceTier.HIGH
    elif final_rank >= 3 and nemotron_output.confidence == ConfidenceTier.LOW:
        confidence = ConfidenceTier.LOW
    elif final_rank >= 3 and len(combined_signals) >= 1:
        confidence = nemotron_output.confidence or ConfidenceTier.HIGH
    elif final_rank >= 1:
        confidence = ConfidenceTier.MEDIUM
    else:
        confidence = nemotron_output.confidence or det_response.confidence

    metadata = {
        "engine": "hybrid-nemotron-v1",
        "ai_assisted": True,
        "model_slug": nemotron_metadata.get("model_slug", settings.NEMOTRON_MODEL_SLUG),
        "prompt_version": nemotron_metadata.get("prompt_version", "v1.0.0"),
        "rules_evaluated": len(RULES),
        "signals_detected": len(combined_signals),
        "latency_ms": nemotron_metadata.get("latency_ms", 0),
        "tokens_used": nemotron_metadata.get("tokens_used", 0),
        "legal_disclaimer": "Automated security triage; not a legal or regulatory determination (AI-05)",
    }

    return AnalyzeResponse(
        overall_risk=final_risk,
        confidence=confidence,
        primary_category=primary_category,
        secondary_categories=secondary_categories,
        signals=combined_signals,
        extracted_entities=entities,
        psychological_tactics=combined_tactics,
        missing_evidence=combined_missing_evidence,
        synthesis_summary=synthesis_summary,
        action_recommendations=combined_recommendations,
        model_metadata=metadata,
    )
