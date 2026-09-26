# Phase 6: Deterministic Risk Engine + NVIDIA Nemotron Analysis — Research

- **Phase**: 06
- **Milestone**: Milestone 1 (Slice 1 - Core Scam Check)
- **Status**: Complete 🔬
- **Target Deliverable**: Production-grade hybrid risk arbitration engine pairing expanded deterministic threat rules with server-side NVIDIA Nemotron NIM inference and strict Pydantic contract validation.

---

## 1. NVIDIA Nemotron NIM Integration Pattern

### 1.1 Model & API Architecture
- **Model Slug**: `nvidia/llama-3.1-nemotron-70b-instruct`
- **Base Endpoint**: `https://integrate.api.nvidia.com/v1/chat/completions` (OpenAI-compatible REST API)
- **Authentication**: Bearer Token via `NVIDIA_API_KEY` (kept strictly in backend `.env` per `SEC-02`).
- **Inference Parameters**:
  - `temperature`: `0.1` (low temperature for deterministic, factual categorization)
  - `top_p`: `0.9`
  - `max_tokens`: `1024`
  - `response_format`: `{"type": "json_object"}` (structured JSON generation)

### 1.2 System Prompt & Safety Contract
The system prompt enforces:
1. Strict output format matching the target JSON schema.
2. Anti-jailbreak and adversarial resistance (ignores instructions embedded in suspicious input text).
3. Focus on psychological tactics (urgency, intimidation, false authority, artificial scarcity, guaranteed yields).
4. Explicit identification of missing evidence or uncertain context (`DET-05`).
5. Non-legal disclaimer embedded in rationale (`AI-05`).

---

## 2. Pydantic Contract & Output Validation (`AI-03`)

```python
class NemotronAnalysisOutput(BaseModel):
    overall_risk: RiskLevel
    confidence: ConfidenceTier
    primary_category: str
    secondary_categories: list[str] = Field(default_factory=list)
    signals: list[AnalysisSignal] = Field(default_factory=list)
    psychological_tactics: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)
    synthesis_summary: str
    action_recommendations: list[str] = Field(default_factory=list)
```

If the JSON response cannot be parsed or fails Pydantic schema validation, the system gracefully falls back to the deterministic rule evaluation, logs the validation failure internally, and sets `model_metadata.ai_assisted = False`.

---

## 3. Expanded Deterministic Rule Taxonomy (Indian Threat Context)

To satisfy `AI-01` and `ENG-01`, the deterministic rule engine expands to cover:
1. **UPI PIN Reverse Scam**: `RULE-UPI-PIN-REVERSE` (Severity: `CRITICAL`)
2. **Digital Arrest & Police Extortion**: `RULE-DIGITAL-ARREST-EXTORTION` (Severity: `CRITICAL`)
3. **Electricity & Utility Cutoff Threat**: `RULE-ELECTRICITY-DISCONNECTION` (Severity: `CRITICAL`)
4. **FedEx / Customs Narcotics Parcel Extortion**: `RULE-CUSTOMS-PARCEL-EXTORTION` (Severity: `CRITICAL`)
5. **Predatory Loan APK & Contact Harassment**: `RULE-LOAN-APK-HARASSMENT` (Severity: `CRITICAL`)
6. **Part-Time Task & Telegram Job Scam**: `RULE-PART-TIME-TASK-COMMISSION` (Severity: `HIGH_RISK`)
7. **Bank KYC & PAN Card Blocking Phishing**: `RULE-BANK-KYC-PAN-PHISHING` (Severity: `HIGH_RISK`)
8. **WhatsApp VIP Stock/Crypto Insider Tips**: `RULE-CRYPTO-STOCK-VIP-TRAP` (Severity: `HIGH_RISK`)
9. **Fake Customer Care SEO Toll-Free**: `RULE-FAKE-CUSTOMER-CARE` (Severity: `SUSPICIOUS`)
10. **Suspicious Obfuscated Short URL**: `RULE-SUSPICIOUS-SHORT-URL` (Severity: `SUSPICIOUS`)

---

## 4. Hybrid Arbitration Logic (`AI-01`, `DET-05`)

The hybrid arbitrator resolves deterministic rule findings and Nemotron inferences:
1. **Critical Safety Floor (`AI-01`)**: If deterministic evaluation flags a threat as `CRITICAL`, the overall risk CANNOT be downgraded by the LLM.
2. **Signal Synthesis**: Signals detected by rules and signals detected by Nemotron are merged and deduplicated.
3. **Uncertainty & Missing Evidence Handling (`DET-05`)**: If input lacks key indicators (no verifiable sender domain, unconfirmed payment address), missing evidence notices are attached to the response.
4. **Metadata Auditability (`AI-04`)**:
   ```python
   metadata = {
       "engine": "hybrid-nemotron-v1",
       "ai_assisted": True,
       "model_slug": settings.NEMOTRON_MODEL_SLUG,
       "prompt_version": "v1.0.0",
       "rules_evaluated": len(RULES),
       "signals_detected": len(combined_signals),
       "latency_ms": round(latency * 1000, 2),
       "legal_disclaimer": "Automated security triage; not a legal or regulatory determination (AI-05)",
   }
   ```

---

## 5. Testing & Quality Strategy (`ENG-01`, `ENG-02`)

1. **Deterministic Unit Test Suite (`backend/tests/test_evaluator.py`)**:
   - 100% test coverage across all 10 deterministic scam rules, verifying regex matching, category assignment, signal generation, and action recommendations.
2. **Nemotron Client & Contract Suite (`backend/tests/test_nemotron.py`)**:
   - Contract tests verifying OpenAI-compatible client formatting, JSON serialization, Pydantic validation, error masking on HTTP errors, and graceful fallback when API key is unset.
3. **Full System Verification**:
   - Full 6-gate CI verification via `scripts/verify.ps1`.
