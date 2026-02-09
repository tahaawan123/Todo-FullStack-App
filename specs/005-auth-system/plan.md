# Implementation Plan: Authentication System — Better Auth + JWT Integration

**Branch**: `005-auth-system` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-auth-system/spec.md`

## Summary

Add multi-user authentication to the Todo full-stack application. The frontend uses **Better Auth** with its **JWT plugin** (asymmetric EdDSA signing) to handle user registration, sign-in, sign-out, and JWT issuance. The backend uses **PyJWT** with **JWKS** verification to validate tokens on every protected endpoint. User tasks are isolated via a `user_id` foreign key on the `Todo` model. Better Auth manages `user`, `session`, `account`, and `jwks` tables; FastAPI owns the `todo` table (extended with `user_id`).

**Key architectural change from spec assumptions**: The spec assumed HS256 (shared secret). Research revealed Better Auth's JWT plugin exclusively uses **asymmetric algorithms** (EdDSA/Ed25519 by default) with a JWKS endpoint. This is more secure and eliminates shared-secret management. See [research.md](./research.md) for full analysis.

## Technical Context

**Language/Version**: TypeScript (Next.js 16+, React 19) / Python 3.11+ (FastAPI)
**Primary Dependencies**:
- Frontend: `better-auth`, `@neondatabase/serverless`, `drizzle-orm`
- Backend: `PyJWT[crypto]` (adds EdDSA support via `cryptography`)
**Storage**: Neon Serverless PostgreSQL (shared instance, separate table ownership)
**Testing**: Manual verification per spec (automated E2E out of scope)
**Target Platform**: Web — Next.js on port 3000, FastAPI on port 8000
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: Sign-up/sign-in < 30s total flow; API auth overhead < 100ms; Health check < 2s
**Constraints**: No OAuth, no MFA, no refresh tokens, no rate limiting (all out of scope per spec)
**Scale/Scope**: Single-developer, development phase; minimal concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-Driven Development | PASS | All work traces to `/specs/005-auth-system/spec.md` |
| Security First | PASS | JWT with asymmetric signing (EdDSA), user isolation at query level, no hardcoded secrets |
| Separation of Concerns | PASS | Frontend: auth + UI; Backend: verification + data; Auth tables vs Task table |
| Clean Code | PASS | Modular auth handler, dependency injection, typed payloads |
| Traceability | PASS | Each implementation task references spec requirements (FR-001 through FR-019) |
| Review-Ready | PASS | No placeholders; all code production-ready with proper error handling |
| No hardcoded secrets | PASS | All secrets via `.env` files; `.env*` in `.gitignore` |
| All API calls through /lib/api.ts | PASS | New `lib/api.ts` utility will attach Bearer token to all backend calls |
| Follow /frontend/CLAUDE.md and /backend/CLAUDE.md | PASS | Will adhere to existing guidelines |

**Gate Result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-auth-system/
├── plan.md              # This file
├── research.md          # Phase 0: technology research and decisions
├── data-model.md        # Phase 1: entity definitions and relationships
├── quickstart.md        # Phase 1: setup and run guide
├── contracts/           # Phase 1: API contract definitions
│   ├── auth-endpoints.md    # Better Auth endpoints (handled by framework)
│   └── task-endpoints.md    # Updated task CRUD with auth
└── tasks.md             # Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # Add BETTER_AUTH_URL env, update CORS
│   ├── auth/                # NEW: auth module
│   │   ├── __init__.py
│   │   ├── jwt_handler.py   # JWKS client, token verification
│   │   └── dependencies.py  # get_current_user FastAPI dependency
│   ├── models/
│   │   └── todo_model.py    # MODIFY: add user_id field to Todo
│   ├── routers/
│   │   └── todo_router.py   # MODIFY: add auth dependency, scope by user_id
│   └── database/
│       └── database.py      # No changes needed
├── .env                     # ADD: BETTER_AUTH_URL
└── requirements.txt         # ADD: PyJWT[crypto]

frontend/
├── app/
│   ├── layout.tsx           # MODIFY: wrap with AuthProvider
│   ├── page.tsx             # MODIFY: redirect to /signin if unauthenticated
│   ├── signin/
│   │   └── page.tsx         # NEW: sign-in page
│   ├── signup/
│   │   └── page.tsx         # NEW: sign-up page
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # NEW: Better Auth catch-all handler
├── components/
│   ├── auth/                # NEW: auth components
│   │   ├── AuthProvider.tsx # Session context provider
│   │   ├── SignInForm.tsx   # Sign-in form component
│   │   └── SignUpForm.tsx   # Sign-up form component
│   └── layout/
│       └── Header.tsx       # MODIFY: add user info + sign-out button
├── db/
│   ├── index.ts             # NEW: Drizzle + Neon connection
│   └── schema.ts            # NEW: generated by @better-auth/cli
├── lib/
│   ├── auth.ts              # NEW: Better Auth server instance
│   ├── auth-client.ts       # NEW: Better Auth client instance
│   ├── api.ts               # NEW: authenticated API utility
│   └── services/
│       └── todoService.ts   # MODIFY: use authenticated api utility
├── middleware.ts             # NEW: route protection middleware
├── .env.local               # NEW: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL
├── drizzle.config.ts        # NEW: Drizzle Kit configuration
└── package.json             # MODIFY: add dependencies
```

**Structure Decision**: Web application (Option 2) — frontend and backend as separate projects in the monorepo, sharing a single Neon PostgreSQL database. Better Auth owns auth tables (user, session, account, jwks) via Drizzle ORM on the frontend. FastAPI owns the todo table via SQLModel on the backend.

## Implementation Phases

### Phase 1: Environment & Database Foundation

**Goal**: Both services can connect to the shared Neon DB; auth tables exist; environment is configured.

| Step | Action | Files | Validates |
|------|--------|-------|-----------|
| 1.1 | Add auth dependencies to frontend `package.json` | `frontend/package.json` | `npm install` succeeds |
| 1.2 | Add `PyJWT[crypto]` to backend `requirements.txt` | `backend/requirements.txt` | `pip install` succeeds |
| 1.3 | Create `frontend/.env.local` with `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL` | `frontend/.env.local` | File exists, not in git |
| 1.4 | Add `BETTER_AUTH_URL` to `backend/.env` | `backend/.env` | Env var accessible |
| 1.5 | Create Drizzle config and DB connection (`db/index.ts`) | `frontend/db/index.ts`, `frontend/drizzle.config.ts` | DB connection succeeds |
| 1.6 | Generate Better Auth schema and run Drizzle migration | `frontend/db/schema.ts`, `frontend/drizzle/` | Tables created in Neon |
| 1.7 | Ensure `.env*` patterns are in all `.gitignore` files | `frontend/.gitignore`, `backend/.gitignore` | `git status` shows no `.env` files |

### Phase 2: Backend — JWT Verification Layer

**Goal**: Backend can verify JWTs from Better Auth's JWKS endpoint and protect all task routes.

| Step | Action | Files | Validates |
|------|--------|-------|-----------|
| 2.1 | Create `auth/jwt_handler.py` with JWKS client and `verify_token()` | `backend/app/auth/jwt_handler.py` | Unit: valid token decoded; invalid token raises |
| 2.2 | Create `auth/dependencies.py` with `get_current_user` dependency | `backend/app/auth/dependencies.py` | Returns `TokenPayload` with `sub`, `email`, `name` |
| 2.3 | Add `user_id` field to `Todo` model | `backend/app/models/todo_model.py` | Migration adds column; existing queries still work |
| 2.4 | Update `todo_router.py`: add auth dependency, scope queries by `user_id`, validate URL `user_id` matches JWT `sub` | `backend/app/routers/todo_router.py` | `GET /api/{user_id}/tasks` requires valid token; cross-user blocked |
| 2.5 | Update CORS in `main.py` to ensure frontend origin allowed | `backend/app/main.py` | No CORS errors from frontend |
| 2.6 | Verify `/health` endpoint remains unauthenticated | `backend/app/main.py` | `GET /health` returns 200 without token |

### Phase 3: Frontend — Better Auth Setup

**Goal**: Better Auth server and client are configured; auth API routes work; JWT can be obtained.

| Step | Action | Files | Validates |
|------|--------|-------|-----------|
| 3.1 | Create auth server instance with JWT plugin + Drizzle adapter | `frontend/lib/auth.ts` | Import resolves; config valid |
| 3.2 | Create auth client with `jwtClient` plugin | `frontend/lib/auth-client.ts` | Client exports `signIn`, `signUp`, `signOut`, `useSession` |
| 3.3 | Create catch-all API route handler | `frontend/app/api/auth/[...all]/route.ts` | `GET /api/auth/get-session` returns 200/401 |
| 3.4 | Test: POST to `/api/auth/sign-up/email` creates user in DB | — | Query Neon `user` table confirms row |
| 3.5 | Test: POST to `/api/auth/sign-in/email` returns session | — | Response includes session token |
| 3.6 | Test: GET `/api/auth/jwks` returns public keys | — | Response contains `keys[]` with `kid`, `kty` |

### Phase 4: Frontend — Auth Pages, Context & API Integration

**Goal**: Users can sign up, sign in, sign out; all API calls include JWT; routes are protected.

| Step | Action | Files | Validates |
|------|--------|-------|-----------|
| 4.1 | Create `AuthProvider` component with `useSession` | `frontend/components/auth/AuthProvider.tsx` | Wraps app; provides session state |
| 4.2 | Build sign-up page with form | `frontend/app/signup/page.tsx`, `frontend/components/auth/SignUpForm.tsx` | Form submits; user created; redirects to signin |
| 4.3 | Build sign-in page with form | `frontend/app/signin/page.tsx`, `frontend/components/auth/SignInForm.tsx` | Form submits; session established; redirects to dashboard |
| 4.4 | Create authenticated API utility | `frontend/lib/api.ts` | Attaches `Authorization: Bearer <jwt>` to all backend calls |
| 4.5 | Update `todoService.ts` to use authenticated API utility | `frontend/lib/services/todoService.ts` | All task API calls include auth header |
| 4.6 | Add route protection middleware | `frontend/middleware.ts` | Unauthenticated users redirected to `/signin` |
| 4.7 | Update `Header.tsx` with user info and sign-out button | `frontend/components/layout/Header.tsx` | Shows user name; sign-out clears session |
| 4.8 | Update `layout.tsx` to wrap with `AuthProvider` | `frontend/app/layout.tsx` | Session available throughout app |

### Phase 5: Integration & Validation

**Goal**: End-to-end auth flow works; all security requirements met.

| Check | Validates | Expected Result |
|-------|-----------|-----------------|
| Sign up → sign in → dashboard | Full auth flow | User sees their (empty) task list |
| Create task as User A | Task ownership | Task stored with User A's `user_id` |
| Sign in as User B → see tasks | User isolation | User B sees only their tasks, not User A's |
| User A's token + User B's `user_id` in URL | Cross-user protection | Backend returns `403 Forbidden` |
| No token → protected endpoint | Auth enforcement | Backend returns `401 Unauthorized` |
| Expired token → protected endpoint | Token expiry | Backend returns `401 Unauthorized` |
| Tampered token → protected endpoint | Signature verification | Backend returns `401 Unauthorized` |
| Sign out → protected endpoint | Session cleanup | Redirected to sign-in; API calls fail |
| `GET /health` without token | Health check | Returns `200 OK` |
| Frontend → backend CORS | Cross-origin config | No CORS errors in browser |

## Key Design Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | JWT signing algorithm | **EdDSA (Ed25519)** via Better Auth JWT plugin | Better Auth's JWT plugin only supports asymmetric algorithms. EdDSA is the default, fastest asymmetric algorithm, and eliminates shared-secret management. The backend fetches public keys via JWKS endpoint. |
| 2 | Token verification method | **JWKS endpoint** (`/api/auth/jwks`) | PyJWT's `PyJWKClient` fetches and caches public keys. Auto-refreshes on key rotation. No secret sharing between services. |
| 3 | Database strategy | **Single Neon DB, separate table ownership** | Better Auth (Drizzle) owns `user`, `session`, `account`, `jwks` tables. FastAPI (SQLModel) owns `todo` table. Single connection string; minimal config. |
| 4 | Database adapter | **Drizzle ORM** with `@neondatabase/serverless` | Better Auth's recommended adapter for PostgreSQL. Provides schema generation and migration tooling. |
| 5 | Token acquisition on client | **`authClient.token()`** via `jwtClient` plugin | Returns a JWT bearer token on demand. Clean API for attaching to external service calls. |
| 6 | User ID validation | **JWT `sub` claim + URL `user_id` match** | Extract `user_id` from JWT `sub` claim. Validate it matches the `{user_id}` in the URL path. Reject mismatches with `403`. |
| 7 | Token expiry | **60 minutes** | Balanced for development. No refresh token needed at this stage. Configurable via Better Auth config. |
| 8 | Route protection | **Next.js middleware** | Checks session cookie existence. Redirects unauthenticated users to `/signin`. Lightweight — no DB hit. |
| 9 | API utility pattern | **Centralized `lib/api.ts`** with token attachment | All backend calls go through one utility that fetches JWT via `authClient.token()` and sets `Authorization: Bearer <token>`. Matches constitution requirement. |
| 10 | Route structure change | **`/api/{user_id}/tasks`** preserved | Maintain URL structure from constitution. Backend validates `user_id` in URL matches JWT `sub`. |

## Complexity Tracking

> No constitution violations detected. All design choices align with established principles.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| Asymmetric JWT (EdDSA) instead of HS256 | Low | Better Auth handles key generation/rotation. Backend uses standard `PyJWKClient`. No manual key management. |
| Drizzle ORM added to frontend | Low | Only used for Better Auth's database adapter. No conflict with backend's SQLModel — separate tables. |
| Two ORMs on one database | Medium | Drizzle (frontend, auth tables) + SQLModel (backend, todo table). Acceptable because each owns distinct tables with no cross-ORM queries. |

## Risk Analysis

1. **JWKS endpoint unreachable**: If the frontend is down, backend cannot verify new tokens. **Mitigation**: PyJWKClient caches keys; cached keys remain valid. Health check can verify connectivity.
2. **Key rotation during active sessions**: New key pair generated while old tokens still valid. **Mitigation**: Better Auth JWKS includes grace period; old keys remain in JWKS response.
3. **Database schema conflicts**: Two ORMs creating tables on the same database. **Mitigation**: Strict table ownership — Drizzle migrations only touch auth tables; SQLModel only touches todo table. Never cross boundaries.

## Follow-ups

- [ ] Consider adding refresh token rotation for production (currently out of scope)
- [ ] Add rate limiting on sign-in endpoint to prevent brute force (out of scope per spec)
- [ ] Evaluate moving to RS256 if additional services need to verify tokens (EdDSA sufficient for now)
