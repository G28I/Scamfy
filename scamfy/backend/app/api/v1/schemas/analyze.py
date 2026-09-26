from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class RiskLevel(StrEnum):
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH_RISK = "HIGH_RISK"
    CRITICAL = "CRITICAL"


class ConfidenceTier(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ExtractedEntities(BaseModel):
    upi_ids: list[str] = Field(default_factory=list)
    phone_numbers: list[str] = Field(default_factory=list)
    urls: list[str] = Field(default_factory=list)
    emails: list[str] = Field(default_factory=list)
    bank_accounts: list[str] = Field(default_factory=list)
    amounts: list[str] = Field(default_factory=list)
    handles: list[str] = Field(default_factory=list)


class AnalysisSignal(BaseModel):
    id: str
    name: str
    description: str
    severity: RiskLevel
    evidence: str


class AnalyzeRequest(BaseModel):
    text: str = Field(
        ..., min_length=3, max_length=10000, description="Raw message text to analyze"
    )


class AnalyzeResponse(BaseModel):
    overall_risk: RiskLevel
    confidence: ConfidenceTier
    primary_category: str
    secondary_categories: list[str] = Field(default_factory=list)
    signals: list[AnalysisSignal] = Field(default_factory=list)
    extracted_entities: ExtractedEntities
    action_recommendations: list[str] = Field(default_factory=list)
    model_metadata: dict[str, Any] = Field(default_factory=dict)
