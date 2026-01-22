<!-- SYNC IMPACT REPORT:
Version change: N/A (initial version) → 1.0.0
Modified principles: N/A
Added sections: Core Principles (6 principles), Key Standards (Frontend, Backend, Authentication, API Behavior), Constraints, Success Criteria, Agent & Skill Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/commands/*.md ⚠ pending
  - README.md ⚠ pending
Follow-up TODOs: None
-->

# Full-Stack Todo Web Application Constitution

## Core Principles

### Spec-Driven Development
All features must follow /specs before implementation. Every change must be traceable to a corresponding specification in the /specs directory.

### Security First
JWT authentication and user isolation strictly enforced. Security considerations are integrated from the initial design phase through implementation and deployment.

### Separation of Concerns
Frontend, Backend, and Auth responsibilities strictly divided. Each layer maintains clear boundaries and interfaces with other layers through well-defined contracts.

### Clean Code
Modular, reusable, production-ready code for all layers. Code follows established patterns and conventions with emphasis on maintainability and readability.

### Traceability
Each change linked to its corresponding spec. All development work must reference the relevant specification document for traceability and audit purposes.

### Review-Ready
All outputs suitable for immediate code review and deployment. Code quality, documentation, and testing standards ensure readiness for peer review and production deployment.

## Key Standards

### Frontend:
- Next.js 16+ with App Router
- TypeScript & Tailwind CSS only (no inline styles)
- Server components by default; client components only when required
- All API calls go through /lib/api.ts
- Responsive, minimal, accessible UI
- Follow /frontend/CLAUDE.md guidelines

### Backend:
- Python FastAPI
- SQLModel ORM
- Neon Serverless PostgreSQL
- All routes under /api/
- CRUD endpoints filtered by authenticated user_id
- Use Pydantic models for request/response
- Follow /backend/CLAUDE.md guidelines

### Authentication:
- Better Auth issues JWT tokens on frontend
- JWT token verification middleware on backend
- Shared secret via BETTER_AUTH_SECRET environment variable
- Ownership enforced at query level; user_id from JWT is source of truth
- Reject invalid/missing tokens (401) or ownership violations (403)
- Follow @specs/features/authentication.md

### API Behavior:
- GET /api/{user_id}/tasks
- POST /api/{user_id}/tasks
- GET /api/{user_id}/tasks/{id}
- PUT /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH /api/{user_id}/tasks/{id}/complete
- All endpoints require JWT; responses filtered by user

## Constraints
- No hard-coded secrets or credentials
- No duplication of logic across agents
- No UI code in backend or auth layers
- All components and endpoints must comply with specs
- No assumptions beyond specs; clarify if unclear

## Success Criteria
- All agents and skills implement their tasks according to specs
- JWT authentication and user isolation fully enforced
- Frontend UI polished, minimal, responsive, and accessible
- Backend routes clean, modular, secure, and production-ready
- Spec-driven workflow followed: all changes reference /specs
- Code ready for review with zero placeholder or TODO comments
- No security vulnerabilities in authentication or API

## Agent & Skill Governance
- Frontend Agent: responsible for UI & UX, uses frontend_ui_builder skill
- Backend Agent: responsible for API & database, uses backend_api_builder skill
- Authentication Agent: responsible for JWT & auth logic, uses authentication_jwt_enforcer skill
- Agents must not override each other's scope
- All actions must reference relevant specs before implementation

## Governance

- Spec-Driven Development: All features must follow /specs before implementation
- Security First: JWT authentication and user isolation strictly enforced
- Separation of Concerns: Frontend, Backend, and Auth responsibilities strictly divided
- Clean Code: Modular, reusable, production-ready code for all layers
- Traceability: Each change linked to its corresponding spec
- Review-Ready: All outputs suitable for immediate code review and deployment
- Stop and ask for clarification if any spec is ambiguous
- Do not assume or invent behavior
- All work must be traceable to specs
- Maintain high-quality, secure, review-ready code

**Version**: 1.0.0 | **Ratified**: 2026-01-21 | **Last Amended**: 2026-01-21