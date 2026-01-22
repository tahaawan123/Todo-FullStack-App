# Backend API Builder Skill

## Purpose
This skill implements or refines Backend APIs and data logic in a Spec-Driven Full-Stack project following best practices for FastAPI, SQLModel, and PostgreSQL applications.

## Scope
### In Scope
- FastAPI route implementation and middleware
- SQLModel database models and relationships
- CRUD operations (Create, Read, Update, Delete)
- Request/response Pydantic schemas
- HTTP status code handling and error responses
- Database connection management
- Input validation and sanitization
- Pagination and filtering logic
- API documentation (OpenAPI/Swagger)

### Out of Scope
- Frontend code implementation
- Authentication configuration or JWT token issuance
- UI or page design
- Infrastructure setup
- DevOps configurations
- Direct client-side JavaScript
- Authentication middleware implementation

## Tech Stack
- Python 3.11+
- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- Neon Serverless PostgreSQL
- Pydantic for data validation
- Uvicorn for ASGI server
- Spec-Kit Plus

## Implementation Rules
1. **Spec Compliance**: Always read relevant specs before writing code
2. **Route Structure**: All routes MUST live under `/api` base path
3. **Pydantic Models**: Use Pydantic models for all request/response validation
4. **SQLModel**: Use SQLModel for all database operations and ORM interactions
5. **Modular Logic**: Keep business logic modular and readable
6. **Security**: No hard-coded secrets or configurations
7. **Type Safety**: Use proper type hints throughout
8. **Documentation**: Include proper docstrings and API documentation

## Authentication & Security Boundary
- Assume JWT is already verified by authentication middleware
- Receive authenticated `user_id` from dependency injection
- NEVER trust `user_id` from request body or URL parameters alone
- Enforce ownership in EVERY database query
- Always filter queries by authenticated user's data
- Validate user permissions for each operation

Note: Actual JWT verification is handled by the Auth Agent/auth layer

## Endpoint Behavior Standards
### Required Behaviors for Every Endpoint
- Validate all input data using Pydantic models
- Filter data by authenticated user's `user_id`
- Return correct HTTP status codes consistently
- Return JSON responses only
- Handle "not found" and "forbidden" scenarios properly
- Implement proper error responses with meaningful messages

### HTTP Status Code Guidelines
- `200 OK`: Successful GET, PUT, PATCH operations
- `201 Created`: Successful POST operations (with created resource)
- `204 No Content`: Successful DELETE operations
- `400 Bad Request`: Invalid input data or malformed requests
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions/ownership violation
- `404 Not Found`: Resource does not exist
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Unexpected server errors

## Database Design Standards
- Follow schema defined in `@specs/database/schema.md`
- Use proper indexing as specified in the schema
- Implement correct timestamp handling (created_at, updated_at)
- Use foreign key relationships appropriately
- Prefer SQLAlchemy/SQLModel queries over raw SQL
- Implement proper transaction handling when needed
- Use connection pooling efficiently

## API Design Patterns
### Route Structure
```
/api/{user_id}/tasks          # GET all user's tasks
/api/{user_id}/tasks/{id}     # GET specific task
/api/{user_id}/tasks          # POST create new task
/api/{user_id}/tasks/{id}     # PUT/PATCH update task
/api/{user_id}/tasks/{id}     # DELETE task
```

### Response Format
- Use consistent JSON response structures
- Include appropriate metadata for paginated responses
- Return complete resource objects after creation/modification
- Use null values appropriately for optional fields

## Error Handling
- Implement custom exception handlers
- Return consistent error response format
- Log errors appropriately for debugging
- Never expose sensitive system information in error messages
- Use HTTPException for standard error responses

## Required Specifications to Reference
Always consult these specifications when implementing:
- `@specs/features/task-crud.md` - Task management API requirements
- `@specs/api/rest-endpoints.md` - REST API endpoint definitions
- `@specs/database/schema.md` - Database schema and relationships
- `@specs/api/error-handling.md` - Error response standards

## Performance Considerations
- Implement proper database indexing
- Use pagination for large datasets
- Optimize queries with proper joins and eager loading
- Cache frequently accessed data when appropriate
- Monitor query performance and optimize slow queries

## Testing Standards
- Write unit tests for business logic
- Write integration tests for API endpoints
- Test error scenarios and edge cases
- Validate request/response schemas
- Test authentication and authorization flows
- Include performance benchmarks where applicable

## Security Measures
- Validate and sanitize all user inputs
- Prevent SQL injection through ORM usage
- Implement rate limiting where appropriate
- Protect against common web vulnerabilities
- Secure sensitive data transmission
- Implement proper session management

## Documentation Requirements
- Include OpenAPI/Swagger documentation
- Add proper endpoint descriptions
- Document request/response schemas
- Include example requests and responses
- Document error codes and meanings
- Maintain up-to-date API documentation

## Code Quality Standards
- Follow PEP 8 style guidelines
- Use meaningful variable and function names
- Keep functions focused and single-purpose
- Implement proper error logging
- Include comprehensive test coverage
- Write maintainable and extensible code

## When to Stop and Ask
If the specification does not clearly define API behavior, database relationships, or security requirements, stop and ask for clarification. Do NOT assume or invent API patterns, data models, or security measures that aren't specified.
