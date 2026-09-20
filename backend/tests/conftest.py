import json
import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from vibestrap.core.config import Settings


@pytest.fixture
def settings():
    return Settings(_env_file=None)


@pytest.fixture
def signing_key():
    return Ed25519PrivateKey.generate()


@pytest.fixture
def jwks(signing_key):
    key = json.loads(jwt.algorithms.OKPAlgorithm.to_jwk(signing_key.public_key()))
    key.update(kid="test-key", alg="EdDSA", use="sig")
    return {"keys": [key]}


@pytest.fixture
def make_token(signing_key, settings):
    def build(claims=None, *, key=None, kid="test-key", omit=()):
        now = int(time.time())
        payload = {
            "sub": "user-123",
            "sid": "session-123",
            "email": "user@example.com",
            "name": "Test User",
            "iat": now,
            "exp": now + 300,
            "iss": settings.auth_issuer,
            "aud": settings.auth_audience,
        }
        payload.update(claims or {})
        for field in omit:
            payload.pop(field, None)
        return jwt.encode(payload, key or signing_key, algorithm="EdDSA", headers={"kid": kid})

    return build
