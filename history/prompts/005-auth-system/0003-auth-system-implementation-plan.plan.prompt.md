---
id: 0003
title: Auth System Implementation Plan
stage: plan
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 005-auth-system
branch: 005-auth-system
user: developer
command: /sp.plan
labels: ["authentication", "better-auth", "jwt", "planning", "architecture"]
links:
  spec: specs/005-auth-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-auth-system/plan.md
  - specs/005-auth-system/research.md
  - specs/005-auth-system/data-model.md
  - specs/005-auth-system/quickstart.md
  - specs/005-auth-system/contracts/auth-endpoints.md
  - specs/005-auth-system/contracts/task-endpoints.md
tests:
  - none (planning phase — no code written)
---

## Prompt

 # /sp.plan Authentication System – Better Auth + JWT Integration

## Architecture Sketch

```
┌─────────────────────┐         JWT Bearer Token         ┌─────────────────────┐
│   Next.js Frontend  │ ──────────────────────────────▶  │   FastAPI Backend    │
│   (Port 3000)       │                                   │   (Port 8000)        │
│                     │                                   │                      │
│  • Better Auth      │                                   │  • JWT Verification  │
│  • JWT Plugin       │                                   │  • get_current_user  │
│  • Auth Pages       │                                   │  • Protected Routes  │
│  • Auth Context     │                                   │  • CORS Middleware   │
└────────┬────────────┘                                   └──────────┬───────────┘
         │                                                           │
         │              Shared Neon PostgreSQL DB                     │
         └──────────────────────┬────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Neon Serverless DB    │
                    │  • user table (Auth)   │
                    │  • session table       │
                    │  • account table       │
                    │  • tasks table (API)   │
                    └───────────────────────┘
```

## Implementation Phases

### Phase 1: Environment & Database Setup
- Configure `.env.local` (frontend) and `.env` (backend) with shared JWT secret
- Verify Neon PostgreSQL connection from both services
- Add `.env*` to `.gitignore`

### Phase 2: Backend – JWT Verification Layer
- Create `jwt_handler.py` with token decode logic (PyJWT, HS256)
- Build `get_current_user` FastAPI dependency
- Configure CORS middleware to allow frontend origin
- Add `/api/health` unprotected endpoint
- Wire auth dependency into all `/api/{user_id}/tasks` routes
- Validate URL `user_id` matches JWT `user_id`

### Phase 3: Frontend – Better Auth Setup
- Install `better-auth` and `@better-auth/jwt`
- Create auth server instance (`lib/auth.ts`) with JWT plugin + DB adapter
- Create auth client instance (`lib/auth-client.ts`)
- Set up API route handler at `/api/auth/[...all]/route.ts`

### Phase 4: Frontend – Auth Pages & Context
- Build `/signup` and `/signin` pages with forms
- Create auth context/provider for app-wide auth state
- Build API utility (`utils/api.ts`) that attaches `Authorization: Bearer <token>` to every backend call
- Protect routes — redirect unauthenticated users to `/signin`
- Add signout functionality

### Phase 5: Integration & Validation
- End-to-end test: signup → signin → JWT issued → API call → task CRUD
- Verify unauthorized access is blocked
- Verify cross-user access is blocked
- Test token expiry handling

## Decisions Needing Documentation

| Decision | Options | Tradeoff | Choice |
|---|---|---|---|
| JWT storage on frontend | Cookie vs Memory vs localStorage | Cookie = auto-sent but CSRF risk; Memory = secure but lost on refresh; localStorage = persistent but XSS risk | Better Auth manages via httpOnly cookie + JWT plugin extracts token for API calls |
| Shared DB vs Separate DBs | Single Neon DB vs two databases | Single = simpler, shared connection string; Separate = isolation but more config | Single Neon DB — Better Auth owns user tables, FastAPI owns tasks table |
| JWT algorithm | HS256 vs RS256 | HS256 = shared secret, simpler; RS256 = key pair, more secure for distributed | HS256 — both services are ours, shared secret is sufficient |
| User ID source of truth | URL param vs JWT claim | URL only = spoofable; JWT only = need to restructure routes; Both = validate match | Both — extract from JWT AND validate it matches URL `user_id` |
| Token expiry duration | Short (15min) vs Long (24hr) | Short = more secure, needs refresh; Long = better UX, higher risk | 60 minutes — balanced for dev phase, no refresh token needed yet |

## Testing Strategy

| Check | Validates | Method |
|---|---|---|
| Signup creates user in DB | Better Auth + DB connection | Sign up → query Neon `user` table |
| Signin returns JWT | Better Auth JWT plugin | Sign in → inspect response for access token |
| Protected route rejects no token | Backend auth dependency | `GET /api/{user_id}/tasks` without header → expect `401` |
| Protected route rejects bad token | JWT verification | Send tampered/expired token → expect `401` |
| User can only access own tasks | user_id match validation | User A's token + User B's user_id in URL → expect `403` |
| CORS allows frontend origin | CORS middleware config | Frontend fetch to backend → no CORS error |
| Signout clears session | Frontend auth context | Sign out → subsequent API call → expect `401` |
| Health endpoint is open | No auth on `/api/health` | `GET /api/health` without token → expect `200` |

## Technical Details

- **Approach:** Phase-sequential — each phase must pass validation before moving to next
- **Shared secret:** `BETTER_AUTH_SECRET` (frontend) = `JWT_SECRET` (backend) — identical value
- **Token flow:** Better Auth issues JWT → frontend stores → frontend sends as Bearer → FastAPI verifies with PyJWT
- **Error responses:** `401` for missing/invalid/expired tokens, `403` for user_id mismatch

## Response snapshot

Generated a complete implementation plan for the 005-auth-system feature. Key outputs:

1. **plan.md** — Full implementation plan with 5 phases, 10 key design decisions, constitution check (all PASS), project structure with file-level change annotations, and risk analysis.

2. **research.md** — 7 research findings. Critical discovery: Better Auth's JWT plugin uses **asymmetric EdDSA (Ed25519)** signing exclusively, not HS256 as originally assumed in the spec. Backend verification uses JWKS endpoint via PyJWKClient instead of shared secret.

3. **data-model.md** — 5 entities defined: User, Session, Account, JWKS (managed by Better Auth/Drizzle), and Todo (managed by FastAPI/SQLModel, extended with `user_id` field). State transition diagrams included.

4. **contracts/** — Two API contract documents:
   - `auth-endpoints.md`: 6 Better Auth endpoints (signup, signin, signout, session, token, JWKS)
   - `task-endpoints.md`: 7 task CRUD endpoints with auth requirements, error responses, and CORS config

5. **quickstart.md** — Step-by-step setup guide for both frontend and backend, including dependency installation, environment config, database migration, and end-to-end verification commands.

6. **Agent context updated** — CLAUDE.md now includes new technologies from this plan.

## Outcome

- Impact: Complete architectural plan ready for task generation (/sp.tasks)
- Tests: No code tests — planning phase only. Validation checks defined in plan.
- Files: 6 artifacts created in specs/005-auth-system/
- Next prompts: Run `/sp.tasks` to generate implementation tasks from the plan
- Reflection: Research phase uncovered a critical spec assumption mismatch (HS256 vs EdDSA). Always research library capabilities before finalizing spec assumptions. The JWKS-based approach is actually simpler (no shared secret management) and more secure.

## Evaluation notes (flywheel)

- Failure modes observed: Spec assumed HS256 but Better Auth JWT plugin only supports asymmetric algorithms. Caught during research phase before any code was written.
- Graders run and results (PASS/FAIL): Constitution check PASS (all 9 principles). Gate check PASS.
- Prompt variant (if applicable): User provided detailed architecture sketch with phases, decisions table, and testing strategy — high-quality input that accelerated planning.
- Next experiment (smallest change to try): Run /sp.tasks to convert plan phases into executable, dependency-ordered tasks.
