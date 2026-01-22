---
id: 1
title: Update Constitution
stage: constitution
date: 2026-01-21
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution,spec-driven-development,security,separation-of-concerns,clean-code,traceability,review-ready]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```text
/sp.constitution

Project: Full-Stack Todo Web Application (Hackathon II, Phase 2)

Core Principles:
- Spec-Driven Development: All features must follow /specs before implementation
- Security First: JWT authentication and user isolation strictly enforced
- Separation of Concerns: Frontend, Backend, and Auth responsibilities strictly divided
- Clean Code: Modular, reusable, production-ready code for all layers
- Traceability: Each change linked to its corresponding spec
- Review-Ready: All outputs suitable for immediate code review and deployment

Key Standards:
- Frontend:
  - Next.js 16+ with App Router
  - TypeScript & Tailwind CSS only (no inline styles)
  - Server components by default; client components only when required
  - All API calls go through /lib/api.ts
  - Responsive, minimal, accessible UI
  - Follow /frontend/CLAUDE.md guidelines

- Backend:
  - Python FastAPI
  - SQLModel ORM
  - Neon Serverless PostgreSQL
  - All routes under /api/
  - CRUD endpoints filtered by authenticated user_id
  - Use Pydantic models for request/response
  - Follow /backend/CLAUDE.md guidelines

- Authentication:
  - Better Auth issues JWT tokens on frontend
  - JWT token verification middleware on backend
  - Shared secret via BETTER_AUTH_SECRET environment variable
  - Ownership enforced at query level; user_id from JWT is source of truth
  - Reject invalid/missing tokens (401) or ownership violations (403)
  - Follow @specs/features/authentication.md

- API Behavior:
  - GET /api/{user_id}/tasks
  - POST /api/{user_id}/tasks
  - GET /api/{user_id}/tasks/{id}
  - PUT /api/{user_id}/tasks/{id}
  - DELETE /api/{user_id}/tasks/{id}
  - PATCH /api/{user_id}/tasks/{id}/complete
  - All endpoints require JWT; responses filtered by user

Constraints:
- No hard-coded secrets or credentials
- No duplication of logic across agents
- No UI code in backend or auth layers
- All components and endpoints must comply with specs
- No assumptions beyond specs; clarify if unclear

Success Criteria:
- All agents and skills implement their tasks according to specs
- JWT authentication and user isolation fully enforced
- Frontend UI polished, minimal, responsive, and accessible
- Backend routes clean, modular, secure, and production-ready
- Spec-driven workflow followed: all changes reference /specs
- Code ready for review with zero placeholder or TODO comments
- No security vulnerabilities in authentication or API

Agent & Skill Governance:
- Frontend Agent: responsible for UI & UX, uses frontend_ui_builder skill
- Backend Agent: responsible for API & database, uses backend_api_builder skill
- Authentication Agent: responsible for JWT & auth logic, uses authentication_jwt_enforcer skill
- Agents must not override each other's scope
- All actions must reference relevant specs before implementation

References:
- Specs: /specs/features/task-crud.md, /specs/features/authentication.md, /specs/api/rest-endpoints.md, /specs/database/schema.md, /specs/ui/components.md, /specs/ui/pages.md
- CLAUDE.md files: /CLAUDE.md, /frontend/CLAUDE.md, /backend/CLAUDE.md

Final Rule:
- Stop and ask for clarification if any spec is ambiguous
- Do not assume or invent behavior
- All work must be traceable to specs
- Maintain high-quality, secure, review-ready code
```

## Response snapshot

Updated the project constitution file (.specify/memory/constitution.md) with concrete values for the Full-Stack Todo Web Application, replacing all placeholder tokens with the specified principles, standards, constraints, and governance rules. The new constitution establishes 6 core principles: Spec-Driven Development, Security First, Separation of Concerns, Clean Code, Traceability, and Review-Ready. It also defines detailed standards for frontend, backend, authentication, and API behavior, plus constraints, success criteria, and agent governance rules.

## Outcome

- ✅ Impact: Created initial project constitution with comprehensive principles and standards for the todo app
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md with new constitution content
- 🔁 Next prompts: Implement features following the established constitution
- 🧠 Reflection: The constitution provides clear guidance for all development work going forward

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A