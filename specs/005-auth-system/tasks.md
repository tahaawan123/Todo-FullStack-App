# Tasks: Authentication System — Better Auth + JWT Integration

**Input**: Design documents from `/specs/005-auth-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not included — spec explicitly states "Automated end-to-end test suite (manual verification is sufficient for this phase)" and tests were not requested.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure environment, and prepare database for auth tables.

- [X] T001 [P] Install frontend auth dependencies (`better-auth`, `@neondatabase/serverless`, `drizzle-orm`) and dev dependencies (`drizzle-kit`, `@better-auth/cli`) in `frontend/package.json`
- [X] T002 [P] Add `PyJWT[crypto]` to `backend/requirements.txt` and install into virtualenv
- [X] T003 [P] Create `frontend/.env.local` with `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, and `DATABASE_URL` (same Neon connection string as backend). Create `frontend/.env.example` with placeholder values per FR-018
- [X] T004 [P] Add `BETTER_AUTH_URL=http://localhost:3000` to `backend/.env`. Create `backend/.env.example` with placeholder values per FR-018
- [X] T005 [P] Verify `.env*` patterns (`.env`, `.env.local`, `.env*.local`) are in both `frontend/.gitignore` and `backend/.gitignore` per FR-019
- [X] T006 Create Drizzle database connection in `frontend/db/index.ts` using `@neondatabase/serverless` neon-http driver with schema import
- [X] T007 Create Drizzle configuration in `frontend/drizzle.config.ts` pointing to `./db/schema.ts` with PostgreSQL dialect and `DATABASE_URL`
- [X] T008 Generate Better Auth schema by running `npx @better-auth/cli@latest generate` to create `frontend/db/schema.ts` with user, session, account, and jwks table definitions
- [X] T009 Generate and apply Drizzle migrations by running `npx drizzle-kit generate` then `npx drizzle-kit migrate` to create auth tables (user, session, account, jwks) in Neon database

**Checkpoint**: Both services have dependencies installed. Auth tables exist in Neon. Environment configured. No secrets in version control.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth infrastructure that MUST be complete before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

### Better Auth Server & Client

- [X] T010 Create Better Auth server instance in `frontend/lib/auth.ts` with Drizzle adapter (`provider: "pg"`), `emailAndPassword: { enabled: true }`, JWT plugin (EdDSA default, `expirationTime: "1h"`, `definePayload` limited to `id`, `email`, `name`), and `nextCookies()` plugin
- [X] T011 [P] Create Better Auth client instance in `frontend/lib/auth-client.ts` using `createAuthClient` from `better-auth/react` with `jwtClient()` plugin. Export `signIn`, `signUp`, `signOut`, `useSession`, `getSession`, and `authClient`
- [X] T012 [P] Create catch-all API route handler in `frontend/app/api/auth/[...all]/route.ts` exporting `GET` and `POST` from `toNextJsHandler(auth)`

### Backend JWT Verification

- [X] T013 Create `backend/app/auth/__init__.py` (empty init file for auth module)
- [X] T014 Create JWT verification handler in `backend/app/auth/jwt_handler.py` with `PyJWKClient` pointing to `BETTER_AUTH_URL/api/auth/jwks`, `verify_token()` function that decodes with `algorithms=["EdDSA"]`, validates `issuer` and `audience` against `BETTER_AUTH_URL`, and requires `exp` and `sub` claims
- [X] T015 Create `get_current_user` FastAPI dependency in `backend/app/auth/dependencies.py` with `OAuth2PasswordBearer` scheme, `TokenPayload` Pydantic model (`sub: str`, `email: str | None`, `name: str | None`), returning 401 with `WWW-Authenticate: Bearer` header on any token validation failure per FR-008, FR-011

### Data Model Updates

- [X] T016 Add `user_id: str = Field(index=True)` to `Todo` model in `backend/app/models/todo_model.py`. Add `user_id` to `TodoRead` response model. Handle existing table migration (drop and recreate or `ALTER TABLE`) per FR-017
- [X] T017 Update `TodoCreate` schema in `backend/app/models/todo_model.py` — ensure `user_id` is NOT accepted from request body (it comes from JWT `sub` claim only)

### Backend Route Updates

- [X] T018 Refactor `backend/app/routers/todo_router.py`: change route prefix from `/api/todos` to `/api/{user_id}/tasks`. Add `get_current_user` dependency to all endpoints. Add `user_id` path parameter validation — if `user_id` does not match `current_user.sub`, return 403 Forbidden per FR-010. Scope all queries with `WHERE user_id = current_user.sub` per FR-009
- [X] T019 Update all CRUD operations in `backend/app/routers/todo_router.py`: POST sets `user_id` from JWT `sub` (not request body), GET filters by `user_id`, PUT/PATCH/DELETE verify task belongs to `user_id` before modifying
- [X] T020 Update `backend/app/main.py`: ensure router is mounted with new prefix, verify CORS allows `http://localhost:3000` origin with credentials and `Authorization` header per FR-015. Verify `/health` and `/` endpoints remain unauthenticated per FR-014

**Checkpoint**: Backend rejects requests without valid JWT (401). Backend rejects cross-user access (403). Better Auth endpoints respond at `/api/auth/*`. JWKS endpoint returns public keys. Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 — New User Registration (Priority: P1) MVP

**Goal**: New users can create an account with name, email, and password via the `/signup` page.

**Independent Test**: Navigate to `/signup`, fill form with valid data, submit. Verify user row exists in Neon `user` table. Verify duplicate email shows error. Verify short password shows error.

**Acceptance**: FR-001, FR-002, FR-003, FR-004

### Implementation

- [X] T021 [P] [US1] Create `SignUpForm` component in `frontend/components/auth/SignUpForm.tsx` as a client component using React Hook Form with fields: name (required), email (required, email format), password (required, min 8 chars). Call `authClient.signUp.email()` on submit. Display validation errors inline. Display server errors (duplicate email). On success, redirect to `/signin`
- [X] T022 [US1] Create sign-up page in `frontend/app/signup/page.tsx` rendering `SignUpForm` component. Include link to `/signin` for existing users. Functional layout — no design system required per spec

**Checkpoint**: User can navigate to `/signup`, register with valid credentials, see validation errors for invalid input, and be redirected to sign-in. Account persisted in database.

---

## Phase 4: User Story 2 — User Sign In and Token Issuance (Priority: P1)

**Goal**: Returning users can sign in with email/password, receive a session, and be redirected to the dashboard.

**Independent Test**: Sign in with valid credentials at `/signin`. Verify session cookie is set. Verify `authClient.token()` returns a JWT. Verify invalid credentials show error.

**Acceptance**: FR-005, FR-006

**Dependencies**: US1 (need a registered user to sign in)

### Implementation

- [X] T023 [P] [US2] Create `SignInForm` component in `frontend/components/auth/SignInForm.tsx` as a client component using React Hook Form with fields: email (required), password (required). Call `authClient.signIn.email()` on submit. Display validation errors inline. Display server error ("Invalid credentials"). On success, redirect to `/` (dashboard)
- [X] T024 [US2] Create sign-in page in `frontend/app/signin/page.tsx` rendering `SignInForm` component. Include link to `/signup` for new users. Functional layout

**Checkpoint**: User can sign in with valid credentials and be redirected to dashboard. Invalid credentials show error message. Session established with cookie.

---

## Phase 5: User Story 3 — Authenticated Task Access (Priority: P1)

**Goal**: Signed-in users can create, read, update, and delete tasks. All API calls include JWT. Tasks are scoped per user — no cross-user access.

**Independent Test**: Sign in as User A, create tasks, verify tasks appear. Sign in as User B, verify User B sees only their tasks. Manually send User A's token with User B's user_id — verify 403.

**Acceptance**: FR-007, FR-008, FR-009, FR-010, FR-011, FR-017

**Dependencies**: US2 (need signed-in user with session), Phase 2 (backend auth layer)

### Implementation

- [X] T025 [US3] Create authenticated API utility in `frontend/lib/api.ts` that: fetches JWT via `authClient.token()`, attaches `Authorization: Bearer <token>` header to all requests, includes `Content-Type: application/json`, handles 401 responses (redirect to `/signin`), handles network errors with user-friendly messages, uses `NEXT_PUBLIC_BACKEND_URL` as base URL per FR-007
- [X] T026 [US3] Refactor `frontend/lib/services/todoService.ts` to use the authenticated API utility from `frontend/lib/api.ts`. Update all function signatures to accept `userId` parameter. Update all endpoint URLs from `/api/todos` to `/api/{userId}/tasks`. Maintain existing timeout, error handling, and response transformation logic
- [X] T027 [US3] Update `frontend/lib/hooks/useTodos.ts` to get `userId` from auth session and pass it to all `todoService` calls. Ensure optimistic updates and error handling still work with new API paths
- [X] T028 [US3] Update `frontend/lib/types/todo.ts` to add `userId: string` field to the `Task` interface matching the backend `user_id` response field

**Checkpoint**: Signed-in user sees only their tasks. Task CRUD works through authenticated API calls. Backend rejects unauthorized access (401) and cross-user access (403).

---

## Phase 6: User Story 4 — Route Protection and Redirection (Priority: P2)

**Goal**: Unauthenticated users are redirected to `/signin` when accessing protected pages. Authenticated users access pages normally.

**Independent Test**: Clear cookies/session, navigate to `/` (dashboard) — verify redirect to `/signin`. Sign in — verify dashboard loads.

**Acceptance**: FR-012

**Dependencies**: US2 (sign-in must work for redirect target)

### Implementation

- [X] T029 [US4] Create Next.js middleware in `frontend/middleware.ts` using `getSessionCookie` from `better-auth/cookies` for lightweight cookie-only check (no DB hit). Redirect to `/signin` if no session cookie. Apply to protected routes (`/`). Exclude `/signin`, `/signup`, `/api/auth/*` from protection
- [X] T030 [US4] Update dashboard page `frontend/app/page.tsx` to get session server-side using `auth.api.getSession({ headers: await headers() })`. If no session, redirect to `/signin`. Pass user info to components for display

**Checkpoint**: Unauthenticated visitors to `/` are redirected to `/signin`. Signed-in users see the dashboard normally. Public routes (`/signin`, `/signup`) remain accessible.

---

## Phase 7: User Story 5 — User Sign Out (Priority: P2)

**Goal**: Signed-in users can click sign out, clearing their session and token, and are redirected to `/signin`.

**Independent Test**: Sign in, verify dashboard access, click sign out, verify redirect to `/signin`, verify API calls fail without re-authentication.

**Acceptance**: FR-013

**Dependencies**: US2 (need active session to sign out), US4 (redirect behavior after sign out)

### Implementation

- [X] T031 [US5] Create `AuthProvider` component in `frontend/components/auth/AuthProvider.tsx` as a client component wrapping children with session context using `authClient.useSession()`. Export session state and loading state for child components
- [X] T032 [US5] Update `frontend/app/layout.tsx` to wrap the application with `AuthProvider` so session state is available throughout the component tree
- [X] T033 [US5] Update `frontend/components/layout/Header.tsx` to display the signed-in user's name from session context. Add a sign-out button that calls `authClient.signOut()` and redirects to `/signin` on success. Show sign-in link when no session

**Checkpoint**: User sees their name in the header. Clicking sign out clears session, redirects to `/signin`. Subsequent access to protected routes redirects to `/signin`.

---

## Phase 8: User Story 6 — Health Check Connectivity (Priority: P3)

**Goal**: The `/health` endpoint responds with 200 OK without authentication.

**Independent Test**: `curl http://localhost:8000/health` without any token — verify 200 response.

**Acceptance**: FR-014

**Dependencies**: None (already exists, just verify)

### Implementation

- [X] T034 [US6] Verify `/health` endpoint in `backend/app/main.py` returns `{"status": "healthy"}` with 200 status and does NOT require authentication. Update response format if needed to match contract (`status` field). Ensure `/` root endpoint also remains unauthenticated

**Checkpoint**: Health check works without authentication. Response matches contract specification.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Environment documentation, security verification, and final integration validation.

- [X] T035 [P] Create `frontend/.env.example` (if not done in T003) and `backend/.env.example` with all required variables using placeholder values per FR-018. Ensure no real secrets in example files
- [X] T036 [P] Verify CORS configuration in `backend/app/main.py` allows all task CRUD operations (GET, POST, PUT, PATCH, DELETE) from `http://localhost:3000` with credentials and `Authorization` header per FR-015, SC-006
- [ ] T037 Perform end-to-end manual validation following `specs/005-auth-system/quickstart.md` section 3 (E2E Verification): sign up User A → sign in → create tasks → sign out → sign in as User B → verify isolation → verify cross-user rejection (403) → verify expired/tampered token rejection (401) per SC-003, SC-004, SC-010
- [ ] T038 Run `specs/005-auth-system/quickstart.md` validation to confirm all setup steps work from scratch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3 (US1 Registration)**: Depends on Phase 2 (needs Better Auth server running)
- **Phase 4 (US2 Sign In)**: Depends on Phase 2 + US1 (need registered user)
- **Phase 5 (US3 Task Access)**: Depends on Phase 2 + US2 (need signed-in user with token)
- **Phase 6 (US4 Route Protection)**: Depends on Phase 2 + US2 (redirect target must work)
- **Phase 7 (US5 Sign Out)**: Depends on US2 + US4 (need session and redirect behavior)
- **Phase 8 (US6 Health Check)**: Depends on Phase 2 only (backend must be running)
- **Phase 9 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational)
        ├── US1 (Registration) ─── P1
        │     └── US2 (Sign In) ─── P1
        │           ├── US3 (Task Access) ─── P1
        │           ├── US4 (Route Protection) ─── P2
        │           │     └── US5 (Sign Out) ─── P2
        │           └──────────── US5 (also depends on US2)
        └── US6 (Health Check) ─── P3 (independent)
```

### Within Each User Story

1. Models/entities before services
2. Services before UI components
3. Core implementation before integration
4. Story complete and testable before moving to next

### Parallel Opportunities

**Phase 1** (all [P] tasks): T001, T002, T003, T004, T005 can all run in parallel
**Phase 2**: T011 and T012 can run in parallel after T010. T014 and T015 can overlap (different files). T016 and T017 together. T018 and T019 are sequential (same file).
**US1**: T021 (component) is independent
**US3**: T025 must complete before T026 (dependency). T028 can overlap with T025.
**US6**: Can run in parallel with any user story (independent)
**Phase 9**: T035 and T036 can run in parallel

---

## Parallel Example: Phase 1 Setup

```bash
# All setup tasks target different files — run in parallel:
Task T001: "Install frontend auth dependencies in frontend/package.json"
Task T002: "Add PyJWT[crypto] to backend/requirements.txt"
Task T003: "Create frontend/.env.local and frontend/.env.example"
Task T004: "Add BETTER_AUTH_URL to backend/.env and create backend/.env.example"
Task T005: "Verify .gitignore patterns in both projects"
```

## Parallel Example: Phase 2 Auth Infrastructure

```bash
# After T010 (auth server), these target different files:
Task T011: "Create auth client in frontend/lib/auth-client.ts"
Task T012: "Create catch-all route in frontend/app/api/auth/[...all]/route.ts"

# Backend auth module (different files):
Task T014: "Create jwt_handler.py in backend/app/auth/"
Task T015: "Create dependencies.py in backend/app/auth/"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Registration
4. Complete Phase 4: US2 — Sign In
5. Complete Phase 5: US3 — Authenticated Task Access
6. **STOP and VALIDATE**: Users can register, sign in, and manage their own tasks with full isolation
7. This is the MVP — delivers core auth value proposition

### Full Delivery

8. Complete Phase 6: US4 — Route Protection
9. Complete Phase 7: US5 — Sign Out
10. Complete Phase 8: US6 — Health Check
11. Complete Phase 9: Polish & Validation
12. Full feature complete

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 38 |
| **Phase 1 (Setup)** | 9 tasks (T001–T009) |
| **Phase 2 (Foundational)** | 11 tasks (T010–T020) |
| **US1 (Registration)** | 2 tasks (T021–T022) |
| **US2 (Sign In)** | 2 tasks (T023–T024) |
| **US3 (Task Access)** | 4 tasks (T025–T028) |
| **US4 (Route Protection)** | 2 tasks (T029–T030) |
| **US5 (Sign Out)** | 3 tasks (T031–T033) |
| **US6 (Health Check)** | 1 task (T034) |
| **Polish** | 4 tasks (T035–T038) |
| **Parallel opportunities** | 14 tasks marked [P] |
| **MVP scope** | Phases 1–5 (US1+US2+US3) = 28 tasks |
| **Tests** | Not included (manual verification per spec) |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- The spec's HS256 assumption has been corrected to EdDSA per research.md — all tasks use JWKS/EdDSA pattern
