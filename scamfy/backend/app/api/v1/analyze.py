from backend.app.api.v1.schemas.analyze import (
    AnalyzeRequest,
    AnalyzeResponse,
)
from backend.app.core.evaluator import evaluate_message
from backend.app.core.extractors import extract_all_entities
from backend.app.core.rate_limit import check_rate_limit
from fastapi import APIRouter, Depends, status

router = APIRouter(tags=["Analysis"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(check_rate_limit)],
    summary="Analyze suspicious message text for scam patterns and extract entities",
    description="Accepts text input, extracts financial/contact entities, and performs deterministic heuristic scam triage.",
)
async def analyze_message_endpoint(request: AnalyzeRequest) -> AnalyzeResponse:
    entities = extract_all_entities(request.text)
    response = evaluate_message(request.text, entities)
    return response
