---
id: 002
title: Plan Frontend Backend Connect
stage: plan
date: 2026-01-22
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-frontend-backend-connect
branch: 002-frontend-backend-connect
user: claude
command: "/sp.plan"
labels: [integration, frontend, backend, todo-app, planning]
links:
  spec: specs/002-frontend-backend-connect/spec.md
  plan: specs/002-frontend-backend-connect/plan.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-frontend-backend-connect/plan.md
 - specs/002-frontend-backend-connect/research.md
 - specs/002-frontend-backend-connect/data-model.md
 - specs/002-frontend-backend-connect/quickstart.md
 - specs/002-frontend-backend-connect/contracts/todo-api-contract.yaml
tests:
 - plan verification
 - research documentation
 - data model validation
---

## Prompt

You are a Senior Full-Stack Engineer and Integration Planner.

Using SpeckitPlus, generate a complete and execution-ready `/sp.plan`
for **Frontend ↔ Backend Integration of the Todo App**.

IMPORTANT:
- You MUST strictly follow the existing
  `/sp.specify – Frontend ↔ Backend Integration (Todo App)`.
- Frontend and Backend already exist and run successfully.
- This plan is ONLY for connecting them together.
- Authentication is explicitly excluded.

GOAL OF `/sp.plan`:
Provide a clear, step-by-step execution roadmap
to connect the Next.js frontend with the FastAPI backend
without introducing errors or scope creep.

WHAT THE PLAN MUST INCLUDE:

1. **Integration phases**
   - Pre-integration checks
   - Environment configuration
   - Backend CORS alignment
   - Frontend API wiring
   - Data flow validation
   - Error handling verification

2. **Environment variable strategy**
   - Backend base URL definition
   - Frontend `NEXT_PUBLIC_*` usage
   - Localhost port coordination
   - Safe environment loading checks

3. **Backend-side integration steps**
   - CORS configuration adjustments
   - API endpoint verification
   - Response consistency validation

4. **Frontend-side integration steps**
   - Central API service setup
   - Mapping UI actions to API calls
   - Handling async states (loading, error, success)

5. **End-to-end data flow plan**
   - Create Todo → DB → UI refresh
   - Fetch Todos on initial load
   - Update / toggle Todo status
   - Delete Todo and sync UI state

6. **Error handling & edge cases**
   - Network failures
   - Validation errors
   - Empty responses
   - Backend downtime handling

7. **Testing & verification checklist**
   - Browser network tab validation
   - Console error checks
   - Manual API testing alignment
   - UI behavior verification

8. **Rollback & safety**
   - How to isolate frontend or backend issues
   - Non-destructive testing approach

9. **Explicit non-goals**
   - No authentication
   - No backend refactors
   - No UI redesign
   - No new features

10. **Success criteria**
    - Frontend communicates with backend without errors
    - Data persists correctly
    - UI reflects backend state accurately
    - No CORS or runtime issues

FORMAT & STYLE RULES:
- Output ONLY the `/sp.plan` content
- Use clear headings and bullet points
- Be concise, structured, and unambiguous
- Do NOT write actual code
- Do NOT redefine requirements
- Do NOT include `/sp.tasks`

Think carefully and produce a professional `/sp.plan`
that a Full-Stack Agent can execute step by step with confidence.

## Response snapshot

# Implementation Plan: Frontend ↔ Backend Integration of the Todo App

**Branch**: `002-frontend-backend-connect` | **Date**: 2026-01-22 | **Spec**: specs/002-frontend-backend-connect/spec.md
**Input**: Feature specification from `/specs/002-frontend-backend-connect/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Establish seamless API communication between the existing Next.js frontend and FastAPI backend for the Todo App. The plan encompasses environment configuration, CORS setup, centralized API service implementation, and end-to-end data flow validation to ensure todos persist correctly between frontend UI and backend database.

## Technical Context

**Language/Version**: JavaScript/TypeScript (Next.js 16+), Python (FastAPI)
**Primary Dependencies**: Next.js, React 18+, FastAPI, Neon PostgreSQL
**Storage**: Neon PostgreSQL database (backend persistence)
**Testing**: Manual verification and browser dev tools (network/console)
**Target Platform**: Web application (localhost development)
**Project Type**: Web application (frontend + backend integration)
**Performance Goals**: API requests complete within 2 seconds under normal network conditions
**Constraints**: Zero CORS errors, 100% validation error display, no authentication implementation
**Scale/Scope**: Single-user development environment integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ No new dependencies introduced beyond existing stack
- ✅ No authentication or security complexity added (per spec constraints)
- ✅ Minimal scope creep - only connecting existing components
- ✅ Architecture remains simple - no new frameworks or patterns

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-backend-connect/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application structure selected based on existing "frontend" and "backend" directories detected in repository.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [Not Applicable] | [Not Applicable] | [Not Applicable] |

## Phase 0: Research & Preparation

### Research Tasks
1. Identify existing backend API endpoints for todo operations
2. Map current frontend UI actions to backend API requirements
3. Determine appropriate localhost ports for frontend (likely 3000) and backend (likely 8000)
4. Verify existing todo data model in backend
5. Assess current frontend state management approach

### Expected Outcomes
- Clear understanding of current API contracts
- Identified any discrepancies between frontend expectations and backend capabilities
- Confirmed CORS configuration requirements
- Determined environment variable requirements

## Phase 1: Integration Design

### 1. Environment Configuration
- Set up `.env.local` in frontend with `NEXT_PUBLIC_BACKEND_URL`
- Configure appropriate localhost URL based on backend server port
- Ensure safe environment variable loading with fallbacks

### 2. Backend CORS Setup
- Configure CORS middleware to allow frontend origin
- Enable necessary HTTP methods (GET, POST, PUT, DELETE)
- Allow credentials if needed (though authentication is excluded per spec)

### 3. Frontend API Service Architecture
- Create centralized `api/todoService.js` or similar
- Implement HTTP client wrapper with error handling
- Establish consistent request/response patterns
- Add loading and error state management

### 4. API Contract Definition
- Define endpoints: GET /todos, POST /todos, PUT /todos/:id, DELETE /todos/:id
- Specify request/response data structures
- Define error response formats
- Map to existing backend implementations

## Phase 2: Implementation Strategy

### 2.1 Pre-integration Checks
- Verify backend server is running and accessible
- Test backend API endpoints independently (using curl or API client)
- Confirm frontend development server runs without errors
- Document current frontend behavior (local state only)

### 2.2 Backend Integration Steps
- Configure CORS settings in FastAPI application
- Verify existing todo endpoints match frontend requirements
- Test backend endpoints with sample data
- Ensure proper HTTP status codes are returned

### 2.3 Frontend Integration Steps
- Create API service module with centralized functions
- Replace local state operations with API calls
- Implement loading states for UI feedback
- Add error handling and user-facing messages
- Update UI components to consume API service

### 2.4 Data Flow Implementation
- **Create Todo**: Frontend form → API call → Backend → Database → Refresh UI
- **Read Todos**: Component mount → API call → Backend → Database → UI display
- **Update Todo**: UI interaction → API call → Backend → Database → UI sync
- **Delete Todo**: UI action → API call → Backend → Database → UI removal

### 2.5 Error Handling & Edge Cases
- Network failure detection and user notification
- Validation error mapping from backend to frontend
- Empty state handling
- Timeout configurations
- Graceful degradation when backend is unavailable

## Phase 3: Verification & Testing

### 3.1 Manual Testing Checklist
- [ ] All CRUD operations work end-to-end
- [ ] Data persists in database between page reloads
- [ ] Loading states display appropriately
- [ ] Error messages show for failed operations
- [ ] No CORS errors in browser console
- [ ] Network tab shows successful API requests
- [ ] Backend validation errors properly displayed

### 3.2 Success Criteria Verification
- [ ] Users can create, read, update, delete todos with 100% persistence
- [ ] API requests complete within 2 seconds
- [ ] Zero CORS errors occur
- [ ] All validation errors displayed in UI
- [ ] Loading states shown during operations
- [ ] Network errors handled gracefully
- [ ] Connection to Neon PostgreSQL maintained

### 3.3 Rollback Strategy
- Frontend can temporarily switch back to local state management
- Backend remains unchanged and functional
- Environment variables can be toggled to disable API integration
- Git stash can preserve integration work for future implementation

## Non-Goals Confirmation
- ❌ No authentication implementation
- ❌ No backend refactoring
- ❌ No UI redesign
- ❌ No new features beyond integration
- ❌ No deployment configuration
- ❌ No real-time updates

## Outcome

- ✅ Impact: Created comprehensive implementation plan for frontend-backend integration
- 🧪 Tests: All required plan artifacts generated and validated
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, contracts/
- 🔁 Next prompts: Ready for task generation phase (/sp.tasks)
- 🧠 Reflection: Plan addresses all integration requirements with clear execution phases

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to task generation phase