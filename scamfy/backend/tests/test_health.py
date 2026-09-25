import pytest
from backend.app.main import app, create_application
from fastapi.middleware.cors import CORSMiddleware
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_health_check_returns_ok() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["project"] == "Scamfy API"
    assert data["version"] == "0.1.0"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_sanitized_error_handling_masks_internal_details() -> None:
    test_app = create_application()

    @test_app.get("/api/v1/test-internal-error")
    async def trigger_internal_error() -> None:
        raise RuntimeError("CRITICAL_INTERNAL_DB_PASSWORD_LEAK_SECRET_12345")

    wrapped_test_app = CORSMiddleware(
        test_app,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    transport = ASGITransport(app=wrapped_test_app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/test-internal-error")

    assert response.status_code == 500
    data = response.json()
    assert data["error"] == "InternalServerError"
    assert data["message"] == "An unexpected error occurred. Please try again or contact support."
    assert data["status"] == 500
    # Ensure sensitive exception details are never leaked in the response payload
    assert "CRITICAL_INTERNAL_DB_PASSWORD_LEAK_SECRET_12345" not in response.text
