import json
from pathlib import Path
from unittest.mock import AsyncMock

import httpx
from fastapi.testclient import TestClient

from vibestrap.auth.jwt import TokenVerifier
from vibestrap.auth.policy import Role, permissions_for
from vibestrap.auth.schemas import CurrentUser
from vibestrap.core.config import Settings
from vibestrap.main import create_app


def test_liveness_auth_and_contract_without_external_services(settings):
    with TestClient(create_app(settings)) as client:
        assert client.get("/health/live").json() == {"status": "ok"}
        response = client.get("/api/v1/me")
        assert response.status_code == 401
        assert response.headers["www-authenticate"] == "Bearer"
        assert response.json()["error"]["code"] == "unauthorized"
        assert client.get("/openapi.json").status_code == 200
        assert client.get("/does-not-exist").json()["error"]["code"] == "not_found"


async def test_protected_endpoint(settings, jwks, make_token, monkeypatch):
    current = CurrentUser(
        id="user-123",
        email="user@example.com",
        name="Test User",
        role=Role.USER,
        permissions=permissions_for(Role.USER),
    )
    lookup = AsyncMock(return_value=current)
    monkeypatch.setattr("vibestrap.auth.dependencies.load_current_user", lookup)
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(
            transport=httpx.MockTransport(lambda _: httpx.Response(200, json=jwks))
        ) as auth_client:
            app.state.token_verifier = TokenVerifier(settings, auth_client)
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app), base_url="http://test"
            ) as client:
                response = await client.get(
                    "/api/v1/me", headers={"Authorization": f"Bearer {make_token()}"}
                )
    assert response.status_code == 200
    assert response.json() == current.model_dump(mode="json")
    assert lookup.call_args.args[0].session_id == "session-123"


def test_readiness_reports_unreachable_database(settings):
    settings.database_url = "postgresql+asyncpg://test:test@127.0.0.1:1/test"
    with TestClient(create_app(settings)) as client:
        response = client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "database_unavailable"


def test_cors_preflight(settings):
    with TestClient(create_app(settings)) as client:
        response = client.options(
            "/api/v1/me",
            headers={
                "Origin": settings.cors_origins[0],
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization",
            },
        )
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == settings.cors_origins[0]
        denied = client.options(
            "/api/v1/me",
            headers={
                "Origin": "https://untrusted.example",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert denied.status_code == 400


def test_openapi_contract():
    schema = create_app(Settings.model_construct()).openapi()
    expected = json.loads(
        (Path(__file__).resolve().parents[2] / "contracts/openapi.json").read_text()
    )
    assert schema == expected
    operation = schema["paths"]["/api/v1/me"]["get"]
    assert operation["operationId"] == "getCurrentUser"
    assert operation["security"] == [{"HTTPBearer": []}]
    assert "401" in operation["responses"]
