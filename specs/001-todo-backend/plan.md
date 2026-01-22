# Implementation Plan: Todo App Backend

**Branch**: `001-todo-backend` | **Date**: 2026-01-21 | **Spec**: /specs/001-todo-backend/spec.md
**Input**: Feature specification from `/specs/001-todo-backend/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Backend REST API for Todo application using FastAPI, Python, and Neon PostgreSQL. The API provides full CRUD operations for todo items with proper validation, error handling, and CORS configuration for frontend integration. The system will handle creating, reading, updating, toggling completion status, and deleting todo items with appropriate HTTP status codes and response formats.

## Technical Context

**Language/Version**: Python 3.8+
**Primary Dependencies**: FastAPI, SQLModel, uvicorn, python-dotenv, psycopg2-binary
**Storage**: Neon PostgreSQL database with SQLModel ORM
**Testing**: pytest (for future test implementation)
**Target Platform**: Linux server (backend API server)
**Project Type**: backend web API - determines source structure
**Performance Goals**: Support 100+ concurrent API requests without degradation
**Constraints**: <200ms p95 response time, proper error handling, secure data validation
**Scale/Scope**: Individual todo application backend serving frontend requests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on constitution file:
- ✅ Spec-Driven Development: Following spec from /specs/001-todo-backend/spec.md
- ✅ Security First: Authentication explicitly excluded from scope (per spec)
- ✅ Separation of Concerns: Backend API with clear boundaries for data operations
- ✅ Clean Code: Modular structure with models, schemas, database, and API routes
- ✅ Traceability: All changes will be linked to this specification
- ✅ Review-Ready: Code will be production-ready with proper documentation

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-backend/
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
├── app/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application
│   ├── models/              # Database models (SQLModel)
│   │   ├── __init__.py
│   │   └── todo_model.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   └── todo_schema.py
│   ├── database/            # Database connection
│   │   ├── __init__.py
│   │   └── database.py
│   └── routers/             # API routes
│       ├── __init__.py
│       └── todo_router.py
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── requirements.txt         # Project dependencies
└── venv/                    # Python virtual environment
```

**Structure Decision**: Backend API structure chosen to provide clear separation of concerns between models (data representation), schemas (API request/response validation), database (connection and session management), and routers (API endpoints). This structure follows FastAPI best practices and ensures maintainability.

## High-Level Execution Phases

### Phase 0: Environment Setup
1. Create Python virtual environment
2. Install required dependencies (FastAPI, SQLModel, etc.)
3. Set up .env file with Neon PostgreSQL connection string
4. Initialize project structure

### Phase 1: Project Structure Creation
1. Create app directory structure
2. Implement database connection module
3. Define SQLModel models for Todo entity
4. Create Pydantic schemas for request/response validation
5. Set up CORS middleware for frontend integration

### Phase 2: Database Configuration (Neon)
1. Configure PostgreSQL connection using SQLModel
2. Set up connection pooling and lifecycle management
3. Create database tables (using SQLModel's create_engine and table creation)
4. Implement session management for database operations

### Phase 3: API Development
1. Implement Create Todo endpoint (POST /api/todos)
2. Implement Read Todos endpoints (GET /api/todos and GET /api/todos/{id})
3. Implement Update Todo endpoint (PUT /api/todos/{id})
4. Implement Toggle Completion endpoint (PATCH /api/todos/{id}/complete)
5. Implement Delete Todo endpoint (DELETE /api/todos/{id})

### Phase 4: Validation & Error Handling
1. Add request/response validation using Pydantic schemas
2. Implement centralized exception handlers
3. Add proper HTTP status codes for all responses
4. Create meaningful error messages for different failure scenarios

### Phase 5: Final Testing & Verification
1. Verify server startup with uvicorn
2. Test all API endpoints manually
3. Validate database connectivity and operations
4. Confirm CORS configuration allows frontend communication

## Environment & Tooling Plan

1. **Virtual Environment Creation**:
   - Use `python -m venv venv` to create isolated environment
   - Activate with `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)

2. **Dependency Management**:
   - Core: FastAPI, uvicorn (ASGI server), SQLModel (ORM)
   - Database: psycopg2-binary (PostgreSQL adapter)
   - Environment: python-dotenv (environment variable management)
   - Create requirements.txt with all dependencies

3. **.env Configuration Strategy**:
   - Store DATABASE_URL with Neon PostgreSQL connection string
   - Include other configuration variables as needed
   - Add .env to .gitignore to prevent committing secrets

4. **Local Development Setup**:
   - Use `--reload` flag with uvicorn for hot-reloading during development
   - Implement proper logging for debugging
   - Use FastAPI's automatic API documentation (Swagger UI)

## Backend Folder & File Structure

1. **app/main.py**: Main FastAPI application instance, includes routers, sets up middleware (CORS)
2. **app/models/todo_model.py**: SQLModel definition for Todo entity with all required fields
3. **app/schemas/todo_schema.py**: Pydantic schemas for request/response validation
4. **app/database/database.py**: Database connection setup, engine creation, session management
5. **app/routers/todo_router.py**: All API endpoints for todo operations organized in one router

## Database Planning

1. **PostgreSQL Connection Flow**:
   - Use SQLModel's create_engine with Neon PostgreSQL connection string
   - Configure connection pooling parameters
   - Handle connection lifecycle through FastAPI event handlers (startup/shutdown)

2. **Table Schema Mapping**:
   - Todo table with id (SERIAL PRIMARY KEY), title (VARCHAR), description (TEXT), completed (BOOLEAN), timestamps
   - Proper indexing strategy for efficient queries
   - Handle default values and constraints appropriately

3. **Safe Table Creation/Migration Approach**:
   - Use SQLModel's table creation methods
   - Consider using Alembic for future migration needs
   - Implement safe initialization that won't fail if tables already exist

4. **Connection Lifecycle Handling**:
   - Create database session per request using dependency injection
   - Properly close sessions to prevent connection leaks
   - Handle database connection errors gracefully

## API Implementation Plan

1. **Create Todo Endpoint** (POST /api/todos):
   - Accepts TodoCreate schema in request body
   - Validates input data using Pydantic
   - Creates new Todo record in database
   - Returns created Todo with 201 status

2. **Read Todos Endpoints**:
   - Get All (GET /api/todos): Returns list of all todos with 200 status
   - Get Single (GET /api/todos/{id}): Returns specific todo or 404 if not found

3. **Update Todo Endpoint** (PUT /api/todos/{id}):
   - Accepts TodoUpdate schema in request body
   - Updates existing todo or returns 404 if not found
   - Returns updated todo with 200 status

4. **Toggle Completion Endpoint** (PATCH /api/todos/{id}/complete):
   - Toggles the completed status of a todo
   - Returns updated todo with 200 status or 404 if not found

5. **Delete Todo Endpoint** (DELETE /api/todos/{id}):
   - Deletes todo from database
   - Returns 204 No Content or 404 if not found

6. **Request/Response Validation Strategy**:
   - Separate Pydantic schemas for Create, Read, Update operations
   - Automatic validation by FastAPI based on schema definitions
   - Custom validation when needed using validators

7. **HTTP Status Code Usage**:
   - 200 OK: Successful GET, PUT, PATCH requests
   - 201 Created: Successful POST requests
   - 204 No Content: Successful DELETE requests
   - 400 Bad Request: Validation errors
   - 404 Not Found: Resource doesn't exist
   - 500 Internal Server Error: Unexpected server errors

## Error Handling & Validation

1. **Centralized Error Handling Approach**:
   - Use FastAPI's exception handlers for consistent error responses
   - Create custom exceptions for specific error cases
   - Log errors appropriately for debugging

2. **Pydantic Schema Usage**:
   - Strict validation for all API inputs
   - Automatic serialization for API outputs
   - Custom validators for complex validation rules

3. **Database Error Scenarios**:
   - Handle connection failures gracefully
   - Manage transaction rollbacks when needed
   - Provide meaningful error messages for constraint violations

## CORS & Frontend Integration

1. **CORS Configuration Plan**:
   - Import and configure CORSMiddleware in main app
   - Allow appropriate origins (likely wildcard for development, specific for production)
   - Enable necessary headers and methods for frontend communication

2. **Frontend Compatibility**:
   - Ensure API responses are compatible with frontend data structures
   - Provide consistent response formats
   - Handle preflight requests properly

## Testing & Validation Checklist

1. **API Health Check**:
   - Verify server starts without errors using uvicorn
   - Confirm endpoints are accessible at expected paths
   - Test automatic API documentation at /docs

2. **Manual Endpoint Testing Strategy**:
   - Create todos and verify they're stored correctly
   - Retrieve all todos and individual todos
   - Update todos and confirm changes persist
   - Toggle completion status and verify
   - Delete todos and confirm removal

3. **Database Connectivity Verification**:
   - Confirm successful connection to Neon PostgreSQL
   - Verify data persistence between requests
   - Test database error handling

4. **Server Startup Validation**:
   - Confirm no errors during application initialization
   - Verify all dependencies are properly loaded
   - Test graceful shutdown handling

## Explicit Non-Goals

- No authentication implementation (explicitly out of scope)
- No user system or user isolation
- No authorization mechanisms
- No background workers or job queues
- No caching layers
- No advanced search or filtering beyond basic requirements
- No file uploads or complex media handling

## Success Criteria

- ✅ Server runs successfully with `uvicorn` without initialization errors
- ✅ All API endpoints respond correctly to valid requests with appropriate status codes
- ✅ Neon PostgreSQL connection is stable and supports all CRUD operations
- ✅ Database operations complete successfully without errors
- ✅ CORS is configured to allow frontend communication
- ✅ Request/response validation works properly
- ✅ Error handling returns appropriate status codes and messages
- ✅ Backend is ready for frontend integration and consumption

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
