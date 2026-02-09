---
id: 2
title: Phase 3 Chatbot Constitution Update
stage: constitution
date: 2026-02-09
surface: agent
model: claude-opus-4-6
feature: none
branch: 005-auth-system
user: user
command: /sp.constitution
labels: ["constitution", "chatbot", "phase3", "mcp", "openai-agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

# /sp.constitution – Phase 3: Todo AI Chatbot

## Project
AI-powered chatbot integration into existing Todo Full-Stack Application (Next.js + FastAPI + Neon PostgreSQL + Better Auth) using OpenAI Agents SDK and MCP Server architecture.

## Core Principles
- **Statelessness:** Server holds ZERO in-memory state — all conversation history, messages, and task data persists in Neon PostgreSQL database. Every request is independent and self-contained.
- **Single Agent Architecture:** One "Todo Assistant" agent handles all 5 task operations (add, list, complete, delete, update) via MCP tools — no multi-agent complexity.
- **User Isolation:** Every database query and MCP tool call MUST include `user_id` filter. User A can never access User B's tasks or conversations. `user_id` comes from JWT token, never from user input.
- **Stateless MCP Tools:** Each MCP tool opens its own DB connection, performs the operation, returns the result, and closes — no shared state between tool calls.
- **Backward Compatibility:** Phase 3 adds chatbot functionality WITHOUT breaking existing Phase 2 REST API endpoints, authentication, or frontend pages.

## Key Standards

### Authentication & Security
- Chat endpoint `POST /api/{user_id}/chat` MUST be protected by existing JWT auth dependency
- JWT `user_id` MUST match URL `user_id` — mismatch returns `403 Forbidden`
- Missing/invalid/expired token returns `401 Unauthorized`
- `user_id` passed to MCP tools MUST come from JWT extraction, never from request body

### Database Rules
- ORM: SQLModel only — no raw SQL queries
- Two new tables: `conversations` (id, user_id, created_at, updated_at) and `messages` (id, user_id, conversation_id, role, content, created_at)
- `messages.role` only accepts `"user"` or `"assistant"`
- `messages.conversation_id` is foreign key to `conversations.id`
- Every message row MUST have `user_id` for isolation
- Existing `tasks` table remains unchanged
- Connection string: Neon serverless with `?sslmode=require`

### MCP Tools Standard
- Exactly 5 tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Built with Official MCP SDK (not custom implementation)
- Every tool receives `user_id` as required parameter
- Every tool returns structured JSON: `{ task_id, status, title }` (or array for list_tasks)
- Tool errors return descriptive message — never crash the agent
- Tools read/write directly to Neon DB — no intermediary cache

### Agent Behavior Standard
- Framework: OpenAI Agents SDK with Runner
- System prompt must instruct agent to: use tools for task operations, confirm actions, be friendly and concise
- Agent MUST use tools for task operations — never hallucinate task data
- Agent can chain multiple tools in one turn (e.g., "add milk and show all tasks")
- Non-task messages (greetings, thanks) get direct response without tool calls

### Conversation Flow Standard (every request follows this exact order)
1. Receive request → verify JWT → extract `user_id`
2. If `conversation_id` provided → verify it belongs to `user_id` → fetch message history from DB
3. If no `conversation_id` → create new Conversation row in DB
4. Save user message to `messages` table
5. Build message array: system prompt + history + new user message
6. Run agent with MCP tools
7. Save assistant response to `messages` table
8. Return `{ conversation_id, response, tool_calls }` to client
9. Server releases all state — ready for any next request

### Frontend Standard
- ChatKit UI at `/chat` route (protected — redirect to signin if unauthenticated)
- Send messages with JWT token in `Authorization: Bearer <token>` header
- Maintain `conversation_id` across turns in component state
- Display both user and assistant messages in chat format
- Show loading state while agent processes

### API Contract
- Endpoint: `POST /api/{user_id}/chat`
- Request: `{ conversation_id?: integer, message: string }`
- Response: `{ conversation_id: integer, response: string, tool_calls: string[] }`
- No other chat endpoints — single endpoint handles everything

## Constraints
- OpenAI Agents SDK for AI logic — no LangChain, no custom agent loops
- Official MCP SDK for tools — no custom tool protocol
- OpenAI ChatKit for frontend chat UI
- Python FastAPI for backend — no Node.js backend
- SQLModel ORM — no raw SQL, no SQLAlchemy Core
- Neon Serverless PostgreSQL — no local PostgreSQL, no SQLite
- Better Auth + JWT for authentication — no changes to existing auth setup
- `OPENAI_API_KEY` must be in backend `.env` — never exposed to frontend

## Success Criteria
- User sends natural language message → agent calls correct MCP tool → task operation executes in Neon DB → agent confirms action
- Conversation history loads from DB on every request — server restart loses nothing
- User A's chatbot cannot access User B's tasks or conversations
- All 5 operations work via chat: add, list, complete, delete, update
- Existing REST API endpoints (`/api/{user_id}/tasks/*`) still work unchanged
- Chat endpoint returns `401` without valid JWT
- Agent handles errors gracefully (e.g., "task not found" → friendly message, no crash)

## Response snapshot

Updated constitution from v1.0.0 to v1.1.0 (MINOR bump). Added 3 new core principles (Statelessness, Single Agent Architecture, Backward Compatibility). Expanded Security First and Separation of Concerns principles. Added 6 new Key Standards sections: AI Chatbot, MCP Tools, Agent Behavior, Conversation Flow, Chat API Contract, Database Rules. Added chatbot-specific constraints (OpenAI Agents SDK, MCP SDK, ChatKit, OPENAI_API_KEY). Added AI Chatbot Integrator Agent to governance. All templates checked — no updates needed (generic templates). No remaining placeholders.

## Outcome

- ✅ Impact: Constitution amended to v1.1.0 covering Phase 3 AI Chatbot architecture
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: /sp.specify for chatbot feature spec, /sp.plan for implementation plan
- 🧠 Reflection: User isolation principle correctly extended to cover conversation and message tables, not just tasks

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
