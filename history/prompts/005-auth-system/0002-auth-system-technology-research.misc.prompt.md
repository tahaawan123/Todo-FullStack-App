---
id: "0002"
title: "Auth System Technology Research"
stage: misc
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 005-auth-system
branch: 005-auth-system
user: user
command: research
labels: ["better-auth", "jwt", "pyjwt", "fastapi", "neon", "drizzle", "authentication"]
links:
  spec: specs/005-auth-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/005-auth-system/0002-auth-system-technology-research.misc.prompt.md
tests:
  - none
---

## Prompt

Research the following topics for a full-stack authentication system. Use web search and web fetch:

1. **Better Auth** (https://www.better-auth.com/):
   - How to set up Better Auth with Next.js 16+ (App Router)
   - The JWT plugin (@better-auth/jwt or built-in JWT support) - how to issue JWTs that can be verified externally
   - Database adapter for PostgreSQL (Neon serverless)
   - How the auth client works (session management, signUp, signIn, signOut methods)
   - API route handler setup for Next.js App Router (`/api/auth/[...all]/route.ts`)

2. **PyJWT** (Python):
   - How to decode and verify HS256 JWT tokens
   - Best practices for FastAPI JWT middleware/dependency
   - How to create a `get_current_user` dependency that extracts user_id from token

3. **Better Auth + External JWT verification**:
   - What claims does Better Auth put in the JWT? (sub, exp, iat, etc.)
   - How to extract the JWT bearer token from Better Auth's session for API calls to external services
   - Does Better Auth's JWT plugin expose a bearer token that can be sent in Authorization header?

Provide detailed findings with code examples where possible.

## Response snapshot

Comprehensive research completed across all three topics. Key findings:

1. Better Auth integrates with Next.js 16+ via toNextJsHandler, uses proxy.ts (replacing middleware.ts), and supports Drizzle+Neon PostgreSQL. Auth client provides signUp.email(), signIn.email(), signOut(), useSession() methods.

2. Better Auth JWT plugin uses asymmetric signing (EdDSA by default) with JWKS endpoint -- NOT HS256. This diverges from the spec assumption. Tokens obtained via authClient.token() or /api/auth/token endpoint.

3. PyJWT supports JWKS-based verification via PyJWKClient for asymmetric tokens, and direct jwt.decode() for HS256. FastAPI get_current_user dependency pattern well-established.

4. Critical architectural decision identified: spec assumes HS256 shared secret, but Better Auth JWT plugin only supports asymmetric algorithms. Two approaches documented with tradeoffs.

## Outcome

- Impact: Research completed; architectural decision surfaced regarding HS256 vs asymmetric JWT signing
- Tests: none
- Files: PHR created
- Next prompts: Create implementation plan (sp.plan), resolve HS256 vs asymmetric decision
- Reflection: Better Auth's JWT plugin design strongly favors asymmetric signing with JWKS, which is more secure but diverges from the spec's HS256 assumption. This needs an architectural decision before implementation.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
