import os
import jwt
from jwt import PyJWKClient

BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
JWKS_URL = f"{BETTER_AUTH_URL}/api/auth/jwks"
JWT_ALGORITHM = "EdDSA"

jwks_client = PyJWKClient(JWKS_URL)


def verify_token(token: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=[JWT_ALGORITHM],
        issuer=BETTER_AUTH_URL,
        audience=BETTER_AUTH_URL,
        options={"require": ["exp", "sub"]},
    )
