# ADR-0003: AI Layer (NVIDIA Nemotron via NIM) and Trust Boundary

- **Status**: Accepted
- **Date**: 2026-09-23
- **Deciders**: Scamfy Architecture Team

## Context
AI analysis must be reliable, fast, structured, and auditable. Fraud assessment cannot rely purely on an opaque LLM prompt, nor should user inputs directly dictate system behavior.

## Decision
1. **AI Provider**: NVIDIA API / NVIDIA NIM endpoints hosting NVIDIA Nemotron models.
2. **Exclusion**: Groq is not used for Scamfy core inference.
3. **Layered Risk Pipeline**:
   - Deterministic red-flag rules run independently of the model.
   - Entity extraction isolates concrete indicators (URLs, UPI IDs, phone numbers, amounts).
   - Nemotron evaluates linguistic context and nuanced manipulation patterns.
   - Outputs are validated against strict Pydantic schemas.
4. **Advisory Invariant**: AI outputs are strictly advisory explanations. Scamfy never issues legal guilt/innocence judgments.

## Consequences
- Resilience against LLM hallucination and prompt injection.
- Auditable explanation trail for every risk score.
