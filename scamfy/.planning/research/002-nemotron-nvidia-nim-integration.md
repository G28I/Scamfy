# Domain Research 002: NVIDIA Nemotron & NIM Server-Side Integration

- **Topic**: NVIDIA Nemotron Model Family & NIM Inference API
- **Date**: 2026-09-23
- **Provider**: NVIDIA API / NIM (`https://integrate.api.nvidia.com/v1`)

## Architecture & Best Practices
1. **Model Choices**: NVIDIA Nemotron family (e.g. `nvidia/nemotron-4-340b-instruct` or latest production NIM slugs like `nvidia/llama-3.1-nemotron-70b-instruct` / `nvidia/nemotron-mini-4b-instruct`).
2. **Endpoint Structure**: OpenAI-compatible chat completion endpoints with server-side bearer authentication (`NVIDIA_API_KEY`).
3. **Structured Outputs**: Use JSON schema enforcement or rigorous system prompts + Pydantic validation on the FastAPI backend.
4. **Safety & Fallback Policy**:
   - Timeouts bounded to 8 seconds.
   - Fallback to deterministic rule signals if model API is unreachable or times out.
   - Strict sanitization of model outputs before presentation to UI.
