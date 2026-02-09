---
id: "0001"
title: "Auth System JWT Specification"
stage: spec
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 005-auth-system
branch: 005-auth-system
user: developer
command: /sp.specify
labels: ["authentication", "jwt", "better-auth", "full-stack", "spec"]
links:
  spec: specs/005-auth-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-auth-system/spec.md
  - specs/005-auth-system/checklists/requirements.md
tests:
  - none
---

## Prompt

/sp.specify Authentication System – Better Auth + JWT Integration

## Project Context
Analyze The Project First
Todo Full-Stack Web Application (Phase II) requiring multi-user authentication.

- **Frontend:** Next.js 16+ (App Router) — hosted separately
- **Backend:** Python FastAPI — hosted separately
- **Database:** Neon Serverless PostgreSQL
- **ORM:** SQLModel
- **Auth Library:** Better Auth (runs on Next.js frontend)
- **Token Strategy:** JWT (JSON Web Tokens) for cross-service authentication

## Objective

Implement a complete authentication system where Better Auth handles user signup/signin on the Next.js frontend and issues JWT tokens. The FastAPI backend verifies these JWT tokens on every protected API request to identify the user. Both services must be correctly connected, and environment variables must be properly configured for local development and production.

## What To Build

### Frontend (Next.js 16+)
- Better Auth with JWT plugin, signup/signin pages, auth context, route protection, signout

### Backend (FastAPI)
- JWT verification dependency, protected endpoints, user_id matching, health check

### Environment Configuration
- Frontend and backend .env files with shared JWT secret, documented with .env.example files

### CORS Setup
- FastAPI CORS middleware for frontend-backend communication

### Database
- Better Auth manages user/session/account tables; backend manages tasks table with user_id FK

## Response snapshot

Generated comprehensive feature specification at `specs/005-auth-system/spec.md` with:
- 6 prioritized user stories (3 P1, 2 P2, 1 P3) covering signup, signin, authenticated task access, route protection, signout, and health check
- 19 functional requirements (FR-001 through FR-019), all testable and unambiguous
- 5 key entities: User, Session, Account, Task, Authentication Token
- 10 measurable success criteria (SC-001 through SC-010), all technology-agnostic
- 7 edge cases covering token manipulation, database failures, and connectivity issues
- 10 documented assumptions as reasonable defaults
- Clear scope boundaries: 11 in-scope items, 9 out-of-scope items
- Quality checklist passed all 16 validation items with no clarification markers needed

## Outcome

- Impact: Created authoritative feature specification for auth system, establishing clear requirements for Better Auth + JWT integration across frontend and backend
- Tests: No tests at spec stage; acceptance scenarios defined for each user story
- Files: specs/005-auth-system/spec.md, specs/005-auth-system/checklists/requirements.md
- Next prompts: /sp.clarify or /sp.plan to proceed to architecture planning
- Reflection: User description was exceptionally detailed, enabling a complete spec with zero clarification markers. All functional requirements map directly to acceptance scenarios.

## Evaluation notes (flywheel)

- Failure modes observed: None — user input was comprehensive
- Graders run and results (PASS/FAIL): Quality checklist 16/16 PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
