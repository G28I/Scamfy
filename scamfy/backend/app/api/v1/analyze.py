from backend.app.api.v1.schemas.analyze import (
    AnalyzeRequest,
    AnalyzeResponse,
)
from backend.app.core.arbitrator import arbitrate_hybrid_analysis
from backend.app.core.evaluator import evaluate_message
from backend.app.core.extractors import extract_all_entities
from backend.app.core.nemotron import analyze_with_nemotron
from backend.app.core.rate_limit import check_rate_limit
from fastapi import APIRouter, Depends, status

router = APIRouter(tags=["Analysis"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(check_rate_limit)],
    summary="Analyze suspicious message text for scam patterns and extract entities",
    description="Accepts text input, extracts financial/contact entities, and performs hybrid deterministic + NVIDIA Nemotron scam triage.",
)
async def analyze_message_endpoint(request: AnalyzeRequest) -> AnalyzeResponse:
    entities = extract_all_entities(request.text)
    det_response = evaluate_message(request.text, entities)
    nemotron_output, nemotron_metadata = await analyze_with_nemotron(request.text, entities)
    final_response = arbitrate_hybrid_analysis(
        det_response=det_response,
        nemotron_output=nemotron_output,
        nemotron_metadata=nemotron_metadata,
        entities=entities,
    )
    return final_response
