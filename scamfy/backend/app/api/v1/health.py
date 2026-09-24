from datetime import UTC, datetime

from backend.app.core.config import settings
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthCheckResponse(BaseModel):
    status: str
    project: str
    version: str
    timestamp: str


@router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def get_health() -> HealthCheckResponse:
    """Return backend operational status and version."""
    return HealthCheckResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(UTC).isoformat(),
    )
