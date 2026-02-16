import jwt
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from .jwt_handler import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/sign-in/email")


class TokenPayload(BaseModel):
    sub: str
    email: str | None = None
    name: str | None = None


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> TokenPayload:
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        email = payload.get("email")
        if user_id is None or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenPayload(
            sub=user_id,
            email=email,
            name=payload.get("name"),
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
