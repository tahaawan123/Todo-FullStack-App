# Tasks: Frontend ↔ Backend Integration of the Todo App

## Feature Overview
Connect existing Next.js frontend with FastAPI backend for seamless todo operations. Enable CRUD operations between frontend UI and backend database with proper error handling and loading states.

## Implementation Strategy
- **MVP Scope**: Focus on User Story 1 (View and Manage Todos) for initial working integration
- **Incremental Delivery**: Build foundational components first, then enhance with error handling and UX features
- **Parallel Execution**: API service and CORS setup can be developed in parallel
- **Independent Testing**: Each user story should be independently testable

## Dependencies
- User Story 1 (P1) must be completed before User Story 2 (P2) and User Story 3 (P3)
- Foundational tasks must complete before any user story tasks

## Parallel Execution Examples
- Backend CORS setup can run parallel to Frontend API service creation
- Environment configuration can run parallel to API endpoint implementation
- Loading state implementation can run parallel to error handling implementation

---

## Phase 1: Setup

- [x] T001 Create frontend environment file with NEXT_PUBLIC_BACKEND_URL in frontend/.env.local
- [x] T002 Verify backend server is running and accessible on localhost:8000
- [x] T003 Verify frontend development server runs without errors on localhost:3000

## Phase 2: Foundational

- [x] T004 [P] Configure CORS middleware in backend to allow frontend origin at http://localhost:3000
- [x] T005 [P] Create centralized API service in frontend/src/services/apiService.js
- [x] T006 [P] Create todo-specific API functions in frontend/src/services/todoService.js
- [x] T007 [P] Define todo data model interface in frontend/src/types/todo.ts

## Phase 3: User Story 1 - View and Manage Todos (Priority: P1)

**Goal**: Enable users to view, create, update, and delete todos with data persistence in backend database.

**Independent Test**: The user can successfully add a new todo, see it appear in the list, mark it as complete, and delete it. All data persists between sessions and is stored in the backend database.

- [x] T008 [US1] Implement GET /api/todos endpoint to retrieve all todos from database
- [x] T009 [US1] Implement frontend hook to fetch todos on component mount in frontend/src/hooks/useTodos.js
- [x] T010 [US1] Update frontend UI to display todos from backend instead of local state
- [x] T011 [US1] Implement POST /api/todos endpoint to create new todo in database
- [x] T012 [US1] Implement frontend function to create todo via API in frontend/src/services/todoService.js
- [x] T013 [US1] Update frontend UI to create todo via API call
- [x] T014 [US1] Implement PUT /api/todos/{id} endpoint to update todo in database
- [x] T015 [US1] Implement frontend function to update todo via API in frontend/src/services/todoService.js
- [x] T016 [US1] Update frontend UI to update todo via API call (toggle completion)
- [x] T017 [US1] Implement DELETE /api/todos/{id} endpoint to delete todo from database
- [x] T018 [US1] Implement frontend function to delete todo via API in frontend/src/services/todoService.js
- [x] T019 [US1] Update frontend UI to delete todo via API call
- [x] T020 [US1] Verify data persists between page reloads by fetching from backend

## Phase 4: User Story 2 - Handle Network Issues and Loading States (Priority: P2)

**Goal**: Show appropriate loading indicators and error messages when connecting to the backend to provide feedback during operations.

**Independent Test**: When network requests are made, the UI shows loading states, and when network errors occur, appropriate error messages are displayed to the user.

- [x] T021 [US2] Add loading state management to todo service in frontend/src/services/todoService.js
- [x] T022 [US2] Update frontend UI components to show loading indicators during API requests
- [x] T023 [US2] Add error handling to API service for network failures
- [x] T024 [US2] Display user-friendly error messages when API requests fail
- [x] T025 [US2] Handle validation errors from backend and display to user
- [x] T026 [US2] Implement timeout handling for API requests
- [x] T027 [US2] Test error handling by temporarily stopping backend server

## Phase 5: User Story 3 - Environment Configuration for Local Development (Priority: P3)

**Goal**: Enable seamless communication between frontend and backend during local development without CORS or configuration issues.

**Independent Test**: The frontend can successfully make API requests to the backend without CORS errors, and environment variables are properly configured for local development.

- [x] T028 [US3] Verify CORS configuration handles all necessary HTTP methods (GET, POST, PUT, DELETE)
- [x] T029 [US3] Test API communication with various endpoints using browser dev tools
- [x] T030 [US3] Document environment setup process in README.md
- [x] T031 [US3] Create startup script to coordinate backend and frontend servers
- [x] T032 [US3] Verify no CORS errors appear in browser console during normal operation

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T033 Add proper HTTP status code validation in API service responses
- [x] T034 Optimize API response format consistency across all endpoints
- [x] T035 Add request/response logging for debugging purposes
- [x] T036 Update frontend error boundary handling for API failures
- [x] T037 Test complete end-to-end workflow with all CRUD operations
- [x] T038 Verify all success criteria from specification are met
- [x] T039 Document API contract in OpenAPI/Swagger format
- [x] T040 Clean up temporary files and finalize integration code