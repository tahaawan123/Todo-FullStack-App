# Authentication JWT Enforcer Skill

## Purpose
This skill implements, validates, and enforces authentication and authorization rules across frontend (Next.js) and backend (FastAPI) components, ensuring secure access control and proper JWT token management.

## Scope
### In Scope
- Better Auth configuration and setup (frontend)
- JWT token issuance and validation
- JWT verification logic (backend)
- Authorization enforcement mechanisms
- User ownership validation
- Session management
- Token refresh and expiry handling
- Authentication middleware/dependencies
- Secure token storage and transmission

### Out of Scope
- UI design or styling implementation
- Business logic implementation (CRUD operations)
- Database schema design
- Feature-specific functionality beyond auth
- Third-party service integrations (unless auth-related)

## Authentication Model
### Architecture Overview
- Better Auth runs exclusively on the frontend layer
- JWT tokens are issued upon successful login/signup
- JWT tokens are transmitted via `Authorization: Bearer <token>` header
- Backend independently verifies JWT tokens without relying on frontend validation
- Authentication state is maintained consistently across both layers

### Token Lifecycle
- Tokens are issued with appropriate expiration times
- Refresh tokens are managed securely when implemented
- Expired tokens trigger re-authentication flows
- Tokens are validated on each protected request

## JWT Security Standards
### Mandatory Security Requirements
- Use shared secret via environment variable: `BETTER_AUTH_SECRET`
- Same secret must exist in both frontend and backend environments
- Validate token signature integrity
- Verify token expiration (`exp` claim)
- Validate token structure and claims
- Extract authenticated `user_id` ONLY from JWT payload
- Reject missing, invalid, or expired tokens with 401 status

### Secret Management
- Secrets must never be hardcoded in source code
- Use environment variables for secret configuration
- Implement proper secret rotation mechanisms
- Secure environment variable access in production

## Authorization Enforcement
### Ownership Validation Rules
- NEVER trust `user_id` from URL parameters or request body
- Always compare JWT-decoded `user_id` with resource ownership
- Enforce ownership at the database query level
- Return 403 Forbidden for ownership mismatches
- Validate permissions before performing any operations

### Access Control Patterns
- Implement role-based or attribute-based access control as specified
- Define clear authorization policies
- Centralize authorization logic to avoid duplication
- Log authorization decisions for audit purposes

## Frontend Responsibilities
### Better Auth Configuration
- Configure Better Auth with proper JWT plugin settings
- Set up secure token storage (http-only cookies or recommended approach)
- Implement automatic token attachment to all API requests
- Protect authenticated routes using appropriate guards
- Handle token expiry with seamless re-authentication

### Client-Side Security
- Implement secure token storage mechanisms
- Handle token refresh automatically when needed
- Clear tokens securely on logout
- Prevent token leakage in client-side logs
- Implement proper error handling for auth failures

## Backend Responsibilities
### JWT Verification Implementation
- Implement reusable JWT verification dependency/middleware
- Apply authentication dependency to ALL `/api` routes
- Centralize token decoding and validation logic
- Never duplicate authentication logic across individual routes
- Implement proper error handling for invalid tokens

### Middleware Design
- Create reusable authentication decorators/functions
- Support both required and optional authentication
- Handle token extraction from request headers
- Integrate seamlessly with existing API framework

## Error Handling & Responses
### Standard HTTP Status Codes
- `401 Unauthorized`: Missing, invalid, or expired authentication token
- `403 Forbidden`: Valid token but insufficient permissions for requested action
- `422 Unprocessable Entity`: Malformed authentication data

### Error Response Format
- Return consistent error response structure
- Never expose JWT payload details or secrets in error messages
- Provide meaningful error messages for client handling
- Log security-related errors for monitoring

## API Integration Standards
### Header Requirements
- All authenticated requests must include `Authorization: Bearer <token>`
- Token validation occurs before business logic execution
- Handle both uppercase and lowercase authorization headers
- Support alternative authentication methods as specified

### Cross-Layer Consistency
- Ensure authentication state consistency between frontend and backend
- Implement proper session synchronization
- Handle authentication state changes across layers
- Maintain secure communication channels

## Required Specifications to Reference
Always consult these specifications when implementing:
- `@specs/features/authentication.md` - Authentication feature requirements
- `@specs/api/rest-endpoints.md` - API endpoint authentication requirements
- `@specs/security/jwt-policy.md` - JWT token policies and standards
- `@specs/api/error-handling.md` - Authentication error handling standards

## Security Best Practices
### Critical Security Measures
- No secrets stored in source code
- No logging of sensitive token information
- Secure token storage mechanisms
- Deny access by default (principle of least privilege)
- Implement rate limiting for authentication attempts
- Use HTTPS for all authentication flows
- Validate input parameters to prevent injection attacks

### Monitoring and Auditing
- Log authentication events for security monitoring
- Track failed authentication attempts
- Monitor for suspicious authentication patterns
- Implement account lockout mechanisms when appropriate

## Performance Considerations
- Optimize JWT verification performance
- Implement token caching where appropriate
- Minimize authentication overhead on requests
- Consider token introspection vs local validation trade-offs

## Testing Standards
- Test authentication flows with valid/invalid tokens
- Verify authorization enforcement scenarios
- Test token expiration and refresh mechanisms
- Validate error handling for various failure cases
- Test concurrent authentication scenarios
- Verify security against common attack vectors

## Code Quality Standards
- Follow security-focused coding practices
- Implement proper error handling throughout
- Use consistent authentication patterns
- Maintain clear separation of authentication and business logic
- Include comprehensive security-related tests
- Document authentication flows and security decisions

## Compliance Requirements
- Adhere to specified authentication requirements in specs
- Maintain security standards throughout implementation
- Ensure audit trail for authentication events
- Follow industry-standard security practices

## When to Stop and Ask
If ANY authentication or authorization behavior is unclear, underspecified, or involves security trade-offs, STOP immediately and ask for clarification. Never make assumptions when security is involved. If the specification lacks sufficient detail for secure implementation, request specification updates before proceeding.
