# Phase 5: Scam Check Input & Analysis Slice — Research & Technical Specification

- **Phase**: 05
- **Milestone**: Milestone 1 (Slice 1 - Core Scam Check)
- **Status**: Ready for Execution ⚪

---

## 1. Technical Contracts & Schemas

### A. FastAPI Pydantic Models (`backend/app/api/v1/schemas/analyze.py`)

```python
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH_RISK = "HIGH_RISK"
    CRITICAL = "CRITICAL"


class ConfidenceTier(str, Enum):
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
    text: str = Field(..., min_length=5, max_length=10000, description="Raw message text to analyze")


class AnalyzeResponse(BaseModel):
    overall_risk: RiskLevel
    confidence: ConfidenceTier
    primary_category: str
    secondary_categories: list[str] = Field(default_factory=list)
    signals: list[AnalysisSignal] = Field(default_factory=list)
    extracted_entities: ExtractedEntities
    action_recommendations: list[str] = Field(default_factory=list)
    model_metadata: dict[str, Any] = Field(default_factory=dict)
```

---

## 2. Deterministic Entity Extraction Patterns

Scamfy relies on robust regex extractors specifically tailored for the Indian digital payment and messaging landscape:

1. **UPI Virtual Payment Addresses (VPAs)**:
   - Pattern: `\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b`
   - Common handles: `@okhdfcbank`, `@okaxis`, `@oksbi`, `@paytm`, `@ybl`, `@ibl`, `@axl`, `@apl`, `@postbank`, `@federal`.
2. **Indian Mobile & Contact Numbers**:
   - Pattern: `(?:(?:\+91|91|0)[\s\-]?)?([6-9]\d{9})\b`
   - Normalization: Strips formatting and standardizes to 10-digit / E.164.
3. **Phishing Links & URLs**:
   - Pattern: `https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)`
   - Shortener detection: `bit.ly`, `tinyurl.com`, `t.me`, `wa.me`, `is.gd`, `cutt.ly`.
4. **Email Addresses**:
   - Pattern: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`
5. **Monetary Amounts**:
   - Pattern: `(?:₹|Rs\.?|INR|\$)\s*([\d,]+(?:\.\d{1,2})?)|(\b[\d,]+\s*(?:rupees|lakhs?|crores?|k)\b)`
6. **Telegram / WhatsApp Handles**:
   - Pattern: `(?:@|t\.me\/)([a-zA-Z0-9_]{4,32})`

---

## 3. Baseline Deterministic Heuristic Risk Scoring (Phase 5)

Phase 5 implements deterministic keyword and pattern matching to score risk prior to Phase 6 Nemotron NIM integration:

- **CRITICAL Signals**:
  - Urgent request to enter UPI PIN to receive money (classic UPI collect reverse scam).
  - Immediate threat of electricity/power disconnection within hours accompanied by a phone number or APK.
  - Threat of police arrest / digital arrest demanding video call or immediate bank transfer.
- **HIGH_RISK Signals**:
  - Task/rating commission lure (YouTube video liking, Google review rating, Telegram group task).
  - Unsolicited lottery, prize, or customs package clearance with processing fee.
  - Remote desktop APK download request (`AnyDesk`, `TeamViewer`, `RustDesk`, `.apk` attachment).
- **SUSPICIOUS Signals**:
  - URL shorteners hiding destination domains.
  - Severe artificial urgency ("Account blocked in 10 minutes", "KYC expired").
- **SAFE / CAUTION**:
  - Informational messages without credentials/payment demands, verified official domains.

---

## 4. Next.js BFF & Database Persistence (`app/api/check/route.ts`)

- **Input Hashing**: `crypto.createHash('sha256').update(text.trim()).digest('hex')`
- **Prisma Persistence**:
  ```ts
  const check = await prisma.scamCheck.create({
    data: {
      userId: session?.userId || null,
      inputHash,
      overallRisk: result.overall_risk,
      primaryCategory: result.primary_category,
      secondaryCategories: result.secondary_categories,
      signals: result.signals,
      extractedEntities: result.extracted_entities,
      modelMetadata: result.model_metadata,
      actionRecommendations: result.action_recommendations,
    },
  });
  ```
- **Error Handling**: Graceful fallback if backend service is unreachable; sanitizes error messages per `SEC-03`.

---

## 5. User Interface & Experience Architecture

1. **Header & Hero**:
   - Clean, calm title: "Scamfy Instant Scam Detector"
   - Reassuring subtitle explaining that message text is never sold or published.
2. **Analysis Input Box**:
   - Expanding `Textarea` with character counter (max 5,000 chars).
   - "Try Sample" quick preset buttons:
     - ⚡ *Electricity Bill Fraud*
     - 💼 *Part-Time Task Scam*
     - 💳 *UPI Reverse Request Lure*
     - 👮 *Digital Arrest / Sextortion Lure*
   - Primary `Button` with loading state and `Loader2` spinner.
3. **Analysis Results View**:
   - `RiskBadge` with large semantic pill and icon.
   - `ConfidenceMeter` displaying calibrated signal strength.
   - **Recommended Immediate Actions Box** (`UX-01`): Bulleted safe recovery checklist.
   - **Extracted Indicators Grid**: Interactive `IndicatorTag` chips with 1-click clipboard copy.
   - **Detected Threat Signals List**: Breakdown cards with severity badges and evidence quotes.
   - `UrgencyBanner` rendered at the top when risk level is `CRITICAL` or `HIGH_RISK`.
