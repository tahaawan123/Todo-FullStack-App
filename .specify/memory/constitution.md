<!-- SYNC IMPACT REPORT:
Version change: 1.0.0 → 1.1.0 (MINOR — new principles + sections added)
Modified principles:
  - "Security First" expanded to include MCP tool user_id isolation and chat endpoint auth
  - "Separation of Concerns" expanded to include MCP server and Agent SDK layers
Added sections:
  - Core Principles: "Statelessness", "Single Agent Architecture", "Backward Compatibility"
  - Key Standards: "AI Chatbot", "MCP Tools", "Agent Behavior", "Conversation Flow", "Chat API Contract"
  - Constraints: OpenAI Agents SDK, MCP SDK, ChatKit, OPENAI_API_KEY rules
  - Success Criteria: chatbot-specific criteria added
  - Agent & Skill Governance: AI Chatbot Integrator agent added
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (generic template)
  - .specify/templates/spec-template.md ✅ no changes needed (generic template)
  - .specify/templates/tasks-template.md ✅ no changes needed (generic template)
Follow-up TODOs: None
-->

# Full-Stack Todo Web Application Constitution

## Core Principles

### Spec-Driven Development
All features MUST follow /specs before implementation. Every change MUST be traceable to a corresponding specification in the /specs directory.

### Security First
JWT authentication and user isolation MUST be strictly enforced across all layers. Every database query and MCP tool call MUST include `user_id` filter. User A can never access User B's tasks or conversations. `user_id` MUST come from JWT token extraction, never from user input or request body.

### Separation of Concerns
Frontend, Backend, Auth, MCP Server, and Agent SDK responsibilities MUST be strictly divided. Each layer maintains clear boundaries and interfaces with other layers through well-defined contracts.

### Clean Code
Modular, reusable, production-ready code for all layers. Code follows established patterns and conventions with emphasis on maintainability and readability.

### Traceability
Each change MUST be linked to its corresponding spec. All development work MUST reference the relevant specification document for traceability and audit purposes.

### Review-Ready
All outputs MUST be suitable for immediate code review and deployment. Code quality, documentation, and testing standards ensure readiness for peer review and production deployment.

### Statelessness
Server MUST hold ZERO in-memory state. All conversation history, messages, and task data MUST persist in Neon PostgreSQL database. Every request MUST be independent and self-contained. Server restart loses nothing.

### Single Agent Architecture
One "Todo Assistant" agent handles all 5 task operations (add, list, complete, delete, update) via MCP tools. No multi-agent complexity. Agent MUST use tools for task operations and MUST NOT hallucinate task data.

### Backward Compatibility
New phases MUST NOT break existing functionality. Phase 3 (AI Chatbot) adds chatbot functionality WITHOUT breaking Phase 2 REST API endpoints, authentication, or frontend pages.

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
- SQLModel ORM — no raw SQL queries, no SQLAlchemy Core
- Neon Serverless PostgreSQL with `?sslmode=require`
- All routes under /api/
- CRUD endpoints filtered by authenticated user_id
- Use Pydantic models for request/response
- Follow /backend/CLAUDE.md guidelines

### Authentication:
- Better Auth issues JWT tokens on frontend (EdDSA/Ed25519 asymmetric keys)
- JWT token verification on backend via JWKS endpoint (`/api/auth/jwks`)
- Public key verification only — no shared secret needed
- Ownership enforced at query level; user_id from JWT is source of truth
- Reject invalid/missing/expired tokens (401) or ownership violations (403)
- Follow @specs/features/authentication.md

### API Behavior (REST — Task CRUD):
- GET /api/{user_id}/tasks
- POST /api/{user_id}/tasks
- GET /api/{user_id}/tasks/{id}
- PUT /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH /api/{user_id}/tasks/{id}/complete
- All endpoints require JWT; responses filtered by user

### AI Chatbot:
- ChatKit UI at `/chat` route (protected — redirect to signin if unauthenticated)
- Send messages with JWT token in `Authorization: Bearer <token>` header
- Maintain `conversation_id` across turns in component state
- Display both user and assistant messages in chat format
- Show loading state while agent processes

### MCP Tools:
- Exactly 5 tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Built with Official MCP SDK (not custom implementation)
- Every tool receives `user_id` as required parameter
- Every tool returns structured JSON: `{ task_id, status, title }` (or array for list_tasks)
- Tool errors return descriptive message — never crash the agent
- Tools read/write directly to Neon DB — no intermediary cache
- Each MCP tool opens its own DB connection, performs the operation, returns the result, and closes — no shared state between tool calls

### Agent Behavior:
- Framework: OpenAI Agents SDK with Runner
- System prompt MUST instruct agent to: use tools for task operations, confirm actions, be friendly and concise
- Agent MUST use tools for task operations — never hallucinate task data
- Agent can chain multiple tools in one turn (e.g., "add milk and show all tasks")
- Non-task messages (greetings, thanks) get direct response without tool calls

### Conversation Flow (every request follows this exact order):
1. Receive request → verify JWT → extract `user_id`
2. If `conversation_id` provided → verify it belongs to `user_id` → fetch message history from DB
3. If no `conversation_id` → create new Conversation row in DB
4. Save user message to `messages` table
5. Build message array: system prompt + history + new user message
6. Run agent with MCP tools
7. Save assistant response to `messages` table
8. Return `{ conversation_id, response, tool_calls }` to client
9. Server releases all state — ready for any next request

### Chat API Contract:
- Endpoint: `POST /api/{user_id}/chat`
- Request: `{ conversation_id?: integer, message: string }`
- Response: `{ conversation_id: integer, response: string, tool_calls: string[] }`
- No other chat endpoints — single endpoint handles everything
- JWT `user_id` MUST match URL `user_id` — mismatch returns `403 Forbidden`
- Missing/invalid/expired token returns `401 Unauthorized`

### Database Rules:
- ORM: SQLModel only — no raw SQL queries
- Two new tables for chat: `conversations` (id, user_id, created_at, updated_at) and `messages` (id, user_id, conversation_id, role, content, created_at)
- `messages.role` only accepts `"user"` or `"assistant"`
- `messages.conversation_id` is foreign key to `conversations.id`
- Every message row MUST have `user_id` for isolation
- Existing `tasks` table remains unchanged

## Constraints
- No hard-coded secrets or credentials
- No duplication of logic across agents
- No UI code in backend or auth layers
- All components and endpoints MUST comply with specs
- No assumptions beyond specs; clarify if unclear
- OpenAI Agents SDK for AI logic — no LangChain, no custom agent loops
- Official MCP SDK for tools — no custom tool protocol
- OpenAI ChatKit for frontend chat UI
- Python FastAPI for backend — no Node.js backend
- SQLModel ORM — no raw SQL, no SQLAlchemy Core
- Neon Serverless PostgreSQL — no local PostgreSQL, no SQLite
- Better Auth + JWT for authentication — no changes to existing auth setup
- `OPENAI_API_KEY` MUST be in backend `.env` — never exposed to frontend

## Success Criteria
- All agents and skills implement their tasks according to specs
- JWT authentication and user isolation fully enforced
- Frontend UI polished, minimal, responsive, and accessible
- Backend routes clean, modular, secure, and production-ready
- Spec-driven workflow followed: all changes reference /specs
- Code ready for review with zero placeholder or TODO comments
- No security vulnerabilities in authentication or API
- User sends natural language message → agent calls correct MCP tool → task operation executes in Neon DB → agent confirms action
- Conversation history loads from DB on every request — server restart loses nothing
- User A's chatbot cannot access User B's tasks or conversations
- All 5 operations work via chat: add, list, complete, delete, update
- Existing REST API endpoints (`/api/{user_id}/tasks/*`) still work unchanged
- Chat endpoint returns `401` without valid JWT
- Agent handles errors gracefully (e.g., "task not found" → friendly message, no crash)

## Agent & Skill Governance
- Frontend Agent: responsible for UI & UX, uses frontend_ui_builder skill
- Backend Agent: responsible for API & database, uses backend_api_builder skill
- Authentication Agent: responsible for JWT & auth logic, uses authentication_jwt_enforcer skill
- AI Chatbot Integrator Agent: responsible for MCP server, OpenAI Agent SDK integration, chat endpoint, conversation persistence, and ChatKit frontend UI
- Agents MUST NOT override each other's scope
- All actions MUST reference relevant specs before implementation

## Governance

- Spec-Driven Development: All features MUST follow /specs before implementation
- Security First: JWT authentication and user isolation strictly enforced
- Separation of Concerns: Frontend, Backend, Auth, MCP, and Agent responsibilities strictly divided
- Clean Code: Modular, reusable, production-ready code for all layers
- Traceability: Each change linked to its corresponding spec
- Review-Ready: All outputs suitable for immediate code review and deployment
- Statelessness: Server holds zero in-memory state; all data persists in DB
- Single Agent Architecture: One agent, five MCP tools, no multi-agent complexity
- Backward Compatibility: New phases MUST NOT break existing functionality
- Stop and ask for clarification if any spec is ambiguous
- Do not assume or invent behavior
- All work MUST be traceable to specs
- Maintain high-quality, secure, review-ready code

**Version**: 1.1.0 | **Ratified**: 2026-01-21 | **Last Amended**: 2026-02-09
