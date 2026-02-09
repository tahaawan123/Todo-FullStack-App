# Research: Authentication System — Better Auth + JWT Integration

**Feature**: 005-auth-system | **Date**: 2026-02-08 | **Status**: Complete

## Research Tasks

### R1: Better Auth JWT Plugin — Signing Algorithm

**Question**: Does Better Auth's JWT plugin support HS256 (symmetric, shared secret)?

**Finding**: **No.** Better Auth's JWT plugin exclusively uses **asymmetric algorithms**. Supported algorithms:
- **EdDSA** with Ed25519 (default) or Ed448
- **ES256**, **ES512** (ECDSA)
- **RS256**, **PS256** (RSA)
- **ECDH-ES** with P-256, P-384, or P-521

There is a separate concept — the **session cookie cache** — that uses HS256 with `BETTER_AUTH_SECRET` when `session.cookieCache.strategy: "jwt"`. But that is the session data cache cookie, **not** the JWT plugin's token. These are two entirely different mechanisms.

**Decision**: Use **EdDSA (Ed25519)** — Better Auth's default. Fastest asymmetric algorithm, smallest key/signature size.

**Rationale**: The spec assumed HS256, but that's incompatible with Better Auth's JWT plugin. EdDSA is actually more secure (no shared secret to leak) and Better Auth handles all key management automatically.

**Alternatives considered**:
- HS256 via manual token implementation (rejected: defeats purpose of using Better Auth)
- RS256 (viable but slower than EdDSA, larger keys)
- Bearer plugin with session validation (rejected: adds network hop per request)

**Impact on spec**: Spec assumption in line 168 ("HS256 symmetric signing algorithm is acceptable") needs to be updated. Functional requirements FR-016 ("shared secret-based token signing") should be revised to "asymmetric key-based token signing with JWKS verification."

---

### R2: Token Verification from Python/FastAPI

**Question**: How does the FastAPI backend verify Better Auth JWTs without a shared secret?

**Finding**: Better Auth exposes a **JWKS endpoint** at `/api/auth/jwks` that returns the public keys in standard JSON Web Key Set format. Python's `PyJWT` library provides `PyJWKClient` which:
1. Fetches the JWKS from the endpoint
2. Caches the keys locally
3. Matches the token's `kid` (Key ID) header to the correct public key
4. Auto-refreshes if an unknown `kid` appears (supports key rotation)

**Decision**: Use `PyJWT[crypto]` with `PyJWKClient` pointing to `http://localhost:3000/api/auth/jwks`.

**Rationale**: Standard JWKS verification pattern. PyJWT handles caching and rotation automatically. The `[crypto]` extra installs the `cryptography` package, which is required for EdDSA support.

**Code pattern**:
```python
from jwt import PyJWKClient
import jwt

jwks_client = PyJWKClient("http://localhost:3000/api/auth/jwks")

def verify_token(token: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["EdDSA"],
        issuer="http://localhost:3000",
        audience="http://localhost:3000",
        options={"require": ["exp", "sub"]},
    )
```

---

### R3: JWT Claims Structure

**Question**: What claims does Better Auth put in the JWT payload?

**Finding**: By default, the **entire user object** is embedded. Standard registered claims are also added:

| Claim | Source | Default |
|-------|--------|---------|
| `sub` | `user.id` | Configurable via `getSubject` |
| `iss` | `BETTER_AUTH_URL` | Configurable via `issuer` |
| `aud` | `BETTER_AUTH_URL` | Configurable via `audience` |
| `exp` | `now + 15min` | Configurable via `expirationTime` |
| `iat` | `now` | Automatic |
| `id` | `user.id` | From user object |
| `name` | `user.name` | From user object |
| `email` | `user.email` | From user object |
| `emailVerified` | `user.emailVerified` | From user object |
| `image` | `user.image` | From user object |
| `createdAt` | `user.createdAt` | From user object |
| `updatedAt` | `user.updatedAt` | From user object |

**Decision**: Use `definePayload` to limit claims to `id`, `email`, `name` only. Set `expirationTime` to `"1h"`.

**Rationale**: Minimal payload reduces token size and limits exposure if token is intercepted. 60-minute expiry balances security and UX for development.

---

### R4: Client-Side Token Acquisition

**Question**: How does the frontend obtain a JWT bearer token to send to the backend?

**Finding**: Three methods available:

1. **`authClient.token()`** (recommended) — requires `jwtClient()` plugin on the client:
   ```ts
   const { data } = await authClient.token();
   const jwt = data.token; // "eyJ..."
   ```

2. **`set-auth-jwt` response header** — available after `getSession()`:
   ```ts
   authClient.getSession({
     fetchOptions: {
       onSuccess: (ctx) => {
         const jwt = ctx.response.headers.get("set-auth-jwt");
       },
     },
   });
   ```

3. **Direct fetch to `/api/auth/token`**:
   ```ts
   const res = await fetch("/api/auth/token", { credentials: "include" });
   const { token } = await res.json();
   ```

**Decision**: Use Method 1 (`authClient.token()`) via `jwtClient` plugin.

**Rationale**: Cleanest API. Works from any client component. Returns a promise with the current valid token. The `jwtClient` plugin is imported from `better-auth/client/plugins`.

---

### R5: Database Adapter for Neon PostgreSQL

**Question**: Which database adapter should Better Auth use with Neon Serverless PostgreSQL?

**Finding**: Two options:

1. **Drizzle adapter** (`better-auth/adapters/drizzle`) with `@neondatabase/serverless` + `drizzle-orm`:
   - Schema generated by `@better-auth/cli`
   - Migrations via `drizzle-kit`
   - Type-safe schema definitions
   - Recommended by Better Auth docs

2. **Direct Pool adapter** (`pg.Pool`):
   - Simpler setup, no ORM
   - Migrations via `npx @better-auth/cli migrate`
   - Less control over schema

**Decision**: Use Drizzle adapter.

**Rationale**: Better Auth's recommended approach. Provides schema visibility, migration control, and type safety. The Neon serverless driver (`@neondatabase/serverless`) works directly with Drizzle's `neon-http` dialect.

**Packages**: `better-auth`, `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit` (dev), `@better-auth/cli` (dev)

---

### R6: Better Auth + Next.js App Router Integration

**Question**: What is the setup pattern for Better Auth with Next.js 16+ App Router?

**Finding**: Four components needed:

1. **Auth server** (`lib/auth.ts`):
   ```ts
   import { betterAuth } from "better-auth";
   import { drizzleAdapter } from "better-auth/adapters/drizzle";
   import { jwt } from "better-auth/plugins";
   import { nextCookies } from "better-auth/next-js";
   ```

2. **Auth client** (`lib/auth-client.ts`):
   ```ts
   import { createAuthClient } from "better-auth/react";
   import { jwtClient } from "better-auth/client/plugins";
   ```

3. **Catch-all API route** (`app/api/auth/[...all]/route.ts`):
   ```ts
   import { toNextJsHandler } from "better-auth/next-js";
   export const { GET, POST } = toNextJsHandler(auth);
   ```

4. **Middleware** (`middleware.ts`) — cookie-only check, no DB hit:
   ```ts
   import { getSessionCookie } from "better-auth/cookies";
   ```

**All imports come from `better-auth` sub-paths** — no separate packages needed except for the database driver.

---

### R7: Two ORMs on One Database — Risk Assessment

**Question**: Is it safe to have Drizzle ORM (frontend/auth) and SQLModel (backend/todo) operating on the same Neon database?

**Finding**: Safe, with strict table ownership boundaries:

| ORM | Owner | Tables | Migration |
|-----|-------|--------|-----------|
| Drizzle | Frontend (Better Auth) | `user`, `session`, `account`, `jwks` | `drizzle-kit migrate` |
| SQLModel | Backend (FastAPI) | `todo` | `SQLModel.metadata.create_all()` |

**Risks**:
- Table name collision: None — different table names
- Schema conflicts: None — each ORM only touches its own tables
- Connection pool exhaustion: Low risk at development scale
- Foreign key relationships: `todo.user_id` references `user.id`, but the FK is managed at application level (not DB-level FK constraint from SQLModel to Drizzle table)

**Decision**: Acceptable. Maintain strict table ownership. The `todo.user_id` stores the Better Auth user ID as a string but does not create a database-level foreign key constraint.

---

## Summary of Decisions

| # | Topic | Decision | Spec Impact |
|---|-------|----------|-------------|
| 1 | JWT Algorithm | EdDSA (Ed25519) instead of HS256 | Update spec assumption line 168 |
| 2 | Token Verification | JWKS endpoint + PyJWKClient | Update FR-016 (no shared secret needed) |
| 3 | JWT Claims | Minimal: `sub`, `email`, `name` + registered claims | None |
| 4 | Token Acquisition | `authClient.token()` via `jwtClient` plugin | None |
| 5 | Database Adapter | Drizzle ORM with Neon serverless driver | None |
| 6 | Integration Pattern | Standard Next.js App Router with catch-all route | None |
| 7 | Dual ORM Strategy | Drizzle (auth) + SQLModel (todo), strict table ownership | None |
