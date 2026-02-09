# Quickstart: Authentication System Setup

**Feature**: 005-auth-system | **Date**: 2026-02-08

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and pip
- Access to Neon Serverless PostgreSQL instance
- Git on branch `005-auth-system`

## 1. Frontend Setup

### 1.1 Install dependencies

```bash
cd frontend

# Core auth library (includes JWT plugin, adapters, client)
npm install better-auth

# Database: Neon serverless driver + Drizzle ORM
npm install @neondatabase/serverless drizzle-orm

# Dev dependencies: schema generation + migration tooling
npm install -D drizzle-kit @better-auth/cli
```

### 1.2 Configure environment

Create `frontend/.env.local`:

```env
# Better Auth
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000

# Database (same Neon instance as backend)
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require
```

### 1.3 Set up database connection

Create `frontend/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

Create `frontend/drizzle.config.ts`:

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 1.4 Generate schema and run migrations

```bash
# Generate Better Auth schema (creates db/schema.ts with user, session, account, jwks tables)
npx @better-auth/cli@latest generate

# Generate Drizzle migration SQL files
npx drizzle-kit generate

# Apply migrations to Neon database
npx drizzle-kit migrate
```

### 1.5 Create auth server instance

Create `frontend/lib/auth.ts`:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
        }),
      },
    }),
    nextCookies(),
  ],
});
```

### 1.6 Create auth client

Create `frontend/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
```

### 1.7 Create API route handler

Create `frontend/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 1.8 Start frontend

```bash
npm run dev
```

Verify:
- `GET http://localhost:3000/api/auth/get-session` → returns 401 (no session)
- `GET http://localhost:3000/api/auth/jwks` → returns public keys JSON

---

## 2. Backend Setup

### 2.1 Install dependencies

```bash
cd backend
pip install "PyJWT[crypto]"
```

Or add to `requirements.txt`:

```
PyJWT[crypto]==2.11.0
```

Then: `pip install -r requirements.txt`

### 2.2 Configure environment

Add to `backend/.env`:

```env
# Existing vars...
# DATABASE_URL=postgresql://...
# DEBUG=True
# LOG_LEVEL=info

# NEW: Better Auth URL for JWKS verification
BETTER_AUTH_URL=http://localhost:3000
```

### 2.3 Create auth module

Create `backend/app/auth/__init__.py`:

```python
```

Create `backend/app/auth/jwt_handler.py`:

```python
import os
import jwt
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

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
```

Create `backend/app/auth/dependencies.py`:

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from .jwt_handler import verify_token, BETTER_AUTH_URL

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{BETTER_AUTH_URL}/api/auth/sign-in/email")

class TokenPayload(BaseModel):
    sub: str
    email: str | None = None
    name: str | None = None

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> TokenPayload:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return TokenPayload(sub=user_id, email=payload.get("email"), name=payload.get("name"))
    except Exception:
        raise credentials_exception
```

### 2.4 Update Todo model

Add `user_id` field to `backend/app/models/todo_model.py`:

```python
class Todo(TodoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # NEW: Better Auth user UUID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2.5 Start backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Verify:
- `GET http://localhost:8000/health` → returns 200 (no auth required)
- `GET http://localhost:8000/api/<user_id>/tasks` without token → returns 401

---

## 3. End-to-End Verification

### 3.1 Sign up a user

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### 3.2 Get JWT token

```bash
curl http://localhost:3000/api/auth/token \
  -b cookies.txt
# Returns: {"token":"eyJ..."}
```

### 3.3 Call protected backend endpoint

```bash
TOKEN="<paste token from step 3.2>"
USER_ID="<user id from step 3.1>"

curl http://localhost:8000/api/${USER_ID}/tasks \
  -H "Authorization: Bearer ${TOKEN}"
# Returns: [] (empty task list)
```

### 3.4 Create a task

```bash
curl -X POST http://localhost:8000/api/${USER_ID}/tasks \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"First authenticated task","description":"It works!"}'
# Returns: created task with user_id
```

---

## Environment Variables Summary

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Secret for session encryption (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Frontend URL (`http://localhost:3000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (existing) |
| `BETTER_AUTH_URL` | Yes | Frontend URL for JWKS endpoint |
| `DEBUG` | No | Debug mode (existing) |
| `LOG_LEVEL` | No | Log level (existing) |

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `401` on all backend requests | JWKS endpoint unreachable | Ensure frontend is running on port 3000 |
| `EdDSA not supported` | Missing `cryptography` package | Install `PyJWT[crypto]` (with the `[crypto]` extra) |
| CORS errors in browser | Backend CORS misconfigured | Verify `http://localhost:3000` is in allowed origins |
| `Table "user" does not exist` | Migrations not run | Run `npx drizzle-kit migrate` from frontend dir |
| `Column "user_id" does not exist` on todo | Backend table not updated | Drop and recreate todo table, or run `ALTER TABLE` |
