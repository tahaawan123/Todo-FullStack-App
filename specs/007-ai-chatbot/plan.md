# Implementation Plan: Todo AI Chatbot Integration

**Branch**: `007-ai-chatbot` | **Date**: 2026-02-10 | **Spec**: [specs/007-ai-chatbot/spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-ai-chatbot/spec.md`

## Summary

Add an AI chatbot to the existing Todo Full-Stack App that manages todos through natural language. Users type messages like "add task buy milk" and a single OpenAI-powered agent calls the correct MCP tool to execute the operation in Neon PostgreSQL. The backend exposes a single `POST /api/{user_id}/chat` endpoint protected by existing JWT auth. The frontend adds a `/chat` page with a custom chat UI. All conversation history persists in the database, and existing REST endpoints remain unchanged.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript (Frontend, Next.js 16+, React 19)
**Primary Dependencies**:
- Backend: FastAPI 0.104.1, SQLModel 0.0.16, PyJWT[crypto] 2.11.0, `openai-agents` (Agents SDK), `mcp` (MCP SDK)
- Frontend: Next.js 16.1.4, React 19.2.3, Tailwind CSS, Better Auth 1.4.18
**Storage**: Neon Serverless PostgreSQL (shared instance, `?sslmode=require`)
**Testing**: Manual integration testing (curl/Postman + frontend E2E)
**Target Platform**: Linux server (WSL2 development), web browsers
**Project Type**: Web application (monorepo: `frontend/` + `backend/`)
**Performance Goals**: AI response within 10s under normal conditions; loading indicator within 200ms of send
**Constraints**: HTTP POST only (no WebSocket/SSE/streaming), single agent architecture, single chat endpoint
**Scale/Scope**: Single-user conversations, last 50 messages context window per request

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| Spec-Driven Development | PASS | All work traces to `specs/007-ai-chatbot/spec.md` |
| Security First | PASS | JWT auth on chat endpoint, `user_id` from token only, user isolation on all queries and MCP tools |
| Separation of Concerns | PASS | MCP server (tools), Agent SDK (reasoning), FastAPI (endpoint), React (UI) — clear boundaries |
| Clean Code | PASS | Modular structure: `mcp/`, `agents/`, `routers/`, frontend `chat/` page |
| Traceability | PASS | Plan, data-model, contracts, tasks all linked to spec |
| Statelessness | PASS | Zero in-memory state; all conversation/message data in Neon PostgreSQL |
| Single Agent Architecture | PASS | One "Todo Assistant" agent, 5 MCP tools, no multi-agent routing |
| Backward Compatibility | PASS | New `chat` route + 2 new tables; existing `todo` routes and table unchanged |

### Post-Design Re-Check

| Principle | Status | Note |
|---|---|---|
| ChatKit Constraint | DEVIATION | Spec mandates ChatKit but also mandates "no SSE/streaming". ChatKit requires SSE. Resolution: custom chat UI built with React + Tailwind. See ADR recommendation below. |

## Project Structure

### Documentation (this feature)

```text
specs/007-ai-chatbot/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: database schema design
├── quickstart.md        # Phase 1: developer setup guide
├── contracts/           # Phase 1: API contracts
│   └── chat-api.yaml    # OpenAPI schema for chat endpoint
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                    # Add chat router registration
│   ├── models/
│   │   ├── todo_model.py          # UNCHANGED
│   │   ├── conversation_model.py  # NEW: Conversation SQLModel
│   │   └── message_model.py       # NEW: Message SQLModel
│   ├── routers/
│   │   ├── todo_router.py         # UNCHANGED
│   │   └── chat_router.py         # NEW: POST /api/{user_id}/chat
│   ├── mcp/
│   │   └── todo_tools.py          # NEW: MCP server with 5 tools
│   ├── agents/
│   │   └── todo_agent.py          # NEW: OpenAI Agent setup + Runner
│   ├── auth/
│   │   ├── dependencies.py        # UNCHANGED (reuse get_current_user)
│   │   └── jwt_handler.py         # UNCHANGED
│   └── database/
│       └── database.py            # UNCHANGED (reuse engine + get_session)
├── requirements.txt               # Add openai-agents, mcp
└── .env                           # Add OPENAI_API_KEY

frontend/
├── app/
│   └── chat/
│       └── page.tsx               # NEW: /chat page (protected)
├── components/
│   └── chat/
│       ├── ChatContainer.tsx      # NEW: Main chat layout
│       ├── MessageList.tsx        # NEW: Message display
│       ├── MessageBubble.tsx      # NEW: Individual message
│       └── ChatInput.tsx          # NEW: Input box + send button
├── lib/
│   ├── api.ts                     # UNCHANGED (reuse fetchWithAuth)
│   ├── services/
│   │   └── chatService.ts         # NEW: sendMessage(), getHistory()
│   ├── hooks/
│   │   └── useChat.ts             # NEW: Chat state management hook
│   └── types/
│       └── chat.ts                # NEW: Chat TypeScript types
├── middleware.ts                   # UPDATE: Add "/chat" to matcher
└── .env.local                     # UNCHANGED (no new frontend env vars)
```

**Structure Decision**: Web application monorepo (Option 2). Backend and frontend are separate directories at repo root. New files added within existing directory conventions. No new top-level directories.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Custom chat UI instead of ChatKit | ChatKit requires SSE streaming, which conflicts with spec's "HTTP POST only" constraint | Using ChatKit would violate spec constraint; custom UI is simpler and fully controllable |

## Research Findings Summary

Full details in [research.md](./research.md).

### R1: OpenAI Agents SDK
- **Decision**: Use `openai-agents` v0.8.1 with `Agent` + `Runner.run()` pattern
- **Rationale**: Official SDK, supports MCP server integration via `MCPServerStdio`, lightweight
- **Key pattern**: `result = await Runner.run(agent, input_messages)` → `result.final_output` for response text
- **Conversation history**: Manual mode — build input list from DB messages, pass to `Runner.run()`

### R2: MCP SDK
- **Decision**: Use `mcp` (official SDK) with FastMCP approach for tool definitions
- **Rationale**: Official, well-documented, decorator-based tool definitions
- **Key pattern**: `@mcp.tool()` decorator, tool receives `user_id` parameter, returns structured JSON
- **Transport**: stdio — MCP server runs as subprocess spawned by the Agent SDK
- **Critical rule**: Never `print()` to stdout in MCP server (corrupts JSON-RPC over stdio)

### R3: Frontend Chat UI
- **Decision**: Custom React + Tailwind CSS chat component (NOT ChatKit)
- **Rationale**: ChatKit requires SSE streaming which violates spec constraint "HTTP POST only — no SSE/streaming". Custom UI gives full control over the request/response cycle with our JWT auth pattern.
- **Alternatives rejected**: ChatKit (requires SSE), third-party chat libraries (unnecessary dependency)

### R4: ChatKit Constraint Conflict
- **Conflict**: Constitution says "ChatKit for frontend chat UI" but spec says "HTTP POST only — no SSE/streaming"
- **Resolution**: Spec constraint takes precedence (HTTP POST only). Build a clean, minimal chat UI with existing stack (React 19 + Tailwind CSS). This maintains the spirit of using well-designed UI while respecting the communication constraint.
- **Impact**: No `@openai/chatkit-react` dependency needed. No `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` env var needed.

### R5: Agent Model Selection
- **Decision**: `gpt-4o-mini` for the Todo Assistant agent
- **Rationale**: Task operations are simple (5 CRUD tools); mini handles tool calling well at lower cost
- **Alternative rejected**: `gpt-4o` (more expensive, no quality benefit for simple tool routing)

### R6: MCP Transport
- **Decision**: stdio transport (agent spawns MCP server as subprocess)
- **Rationale**: Simplest deployment — no separate server process, no HTTP overhead, in-process communication
- **Alternative rejected**: HTTP SSE transport (separate service, more infrastructure, not needed for single-agent)

### R7: Conversation Management
- **Decision**: Auto-create conversation when no `conversation_id` sent; last 50 messages for context
- **Rationale**: Seamless UX for new conversations; 50-message limit balances context quality and token cost
- **Alternative rejected**: Explicit creation (worse UX), unlimited history (too expensive)

## Implementation Phases

### Phase 1: Database Models (Conversation + Message)
- Create `Conversation` model: id, user_id, created_at, updated_at
- Create `Message` model: id, user_id, conversation_id (FK), role, content, created_at
- Tables auto-created via `SQLModel.metadata.create_all()` on startup (existing pattern)
- Existing `todo` table untouched
- **Validation**: Start backend → tables created → insert/query rows manually

### Phase 2: MCP Server (5 Tools)
- Install `mcp` SDK
- Create `backend/app/mcp/todo_tools.py` with 5 tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Each tool: receives `user_id` param, opens DB session, performs operation, returns JSON, closes session
- Error handling: task not found → return `{"error": "Task not found"}`, never raise
- **Validation**: Run MCP server standalone, call each tool, verify DB operations

### Phase 3: OpenAI Agent Setup
- Install `openai-agents` SDK
- Create `backend/app/agents/todo_agent.py` — configure Agent with system prompt + MCP server
- System prompt: friendly, concise, confirm actions, use tools for task operations, respond directly for greetings
- Runner pattern: build message list from DB history + new message → `Runner.run()` → extract `final_output`
- Add `OPENAI_API_KEY` to `backend/.env`
- **Validation**: Run agent with test message → correct tool called → correct response

### Phase 4: Chat Endpoint
- Create `backend/app/routers/chat_router.py` with `POST /api/{user_id}/chat`
- Protect with existing `get_current_user` dependency
- Full flow: verify JWT → validate user_id match → fetch/create conversation → save user message → load history (last 50) → run agent → save assistant response → return JSON
- Register router in `main.py`
- **Validation**: curl with valid JWT → full round-trip works

### Phase 5: Frontend Chat Page
- Create `/chat` page at `frontend/app/chat/page.tsx`
- Build chat components: ChatContainer, MessageList, MessageBubble, ChatInput
- Use `fetchWithAuth` for API calls to chat endpoint
- Maintain `conversation_id` in component state (persisted across messages)
- Add loading state (spinner while agent processes)
- Update middleware matcher to protect `/chat` route
- **Validation**: Sign in → open /chat → send messages → tasks created/updated in DB

### Phase 6: Integration Testing
- End-to-end: signup → signin → chat → all 5 operations → verify in DB
- User isolation: User A chat → User B chat → neither sees other's data
- Conversation persistence: send messages → refresh page → old messages load
- Backward compatibility: existing REST API still works unchanged
- **Validation**: All success criteria from spec pass

## Key Architectural Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | MCP transport | stdio | Agent spawns MCP server as subprocess; simplest for single-agent architecture |
| 2 | Conversation creation | Auto-create on first message | No conversation_id sent → create new; seamless UX |
| 3 | Message history limit | Last 50 messages | Balances context quality and token cost |
| 4 | Agent model | gpt-4o-mini | Simple tool routing; mini handles it well at lower cost |
| 5 | Tool error handling | Return error message | Agent relays "task not found" gracefully; never crashes |
| 6 | Frontend chat UI | Custom React + Tailwind | ChatKit requires SSE (conflicts with HTTP POST only constraint) |
| 7 | Conversation loading | Load on page mount | Fetch existing conversation + messages via separate GET or include in first POST response |

## Testing Strategy

| Check | Validates | Method |
|---|---|---|
| "Add task buy milk" | `add_task` tool + DB insert | Send message → query tasks table → row exists with correct user_id |
| "Show my tasks" | `list_tasks` tool + user isolation | Create tasks for User A and B → User A lists → only sees own tasks |
| "Complete task 3" | `complete_task` tool + DB update | Send message → query task → `completed = true` |
| "Delete task 2" | `delete_task` tool + DB delete | Send message → query task → row gone |
| "Rename task 1 to call doctor" | `update_task` tool + DB update | Send message → query task → title changed |
| "Add milk and show all" | Multi-tool chaining | Send message → response contains new task + full list |
| "Hello" | Direct response without tools | Send message → response has no tool_calls |
| No JWT sent | Auth rejection | POST without token → `401 Unauthorized` |
| Wrong user_id in URL | User mismatch | JWT user_id ≠ URL user_id → `403 Forbidden` |
| Page refresh | Conversation persistence | Send messages → refresh → messages reload from DB |
| Existing REST API | Backward compatibility | `GET /api/{user_id}/tasks` still returns tasks |

## Risks and Mitigations

1. **MCP stdio reliability**: If the MCP server subprocess crashes, the agent fails silently. **Mitigation**: Wrap agent execution in try/catch; return user-friendly error on failure.
2. **OpenAI API availability**: If OpenAI API is down, chat endpoint hangs. **Mitigation**: Set timeout on `Runner.run()`; return "service temporarily unavailable" message within 10s.
3. **Token cost growth**: Unbounded conversation history increases OpenAI token usage. **Mitigation**: Cap at 50 messages; older messages excluded from agent context (still in DB for display).
