---
id: "0002"
title: AI Chatbot Implementation Plan
stage: plan
date: 2026-02-10
surface: agent
model: claude-opus-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: /sp.plan
labels: ["ai-chatbot", "plan", "mcp", "openai-agents", "architecture"]
links:
  spec: specs/007-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-ai-chatbot/plan.md
  - specs/007-ai-chatbot/research.md
  - specs/007-ai-chatbot/data-model.md
  - specs/007-ai-chatbot/contracts/chat-api.yaml
  - specs/007-ai-chatbot/quickstart.md
  - CLAUDE.md
tests:
  - none (planning phase — no code written)
---

## Prompt

# /sp.plan – Phase 3: Todo AI Chatbot Integration

## Architecture Sketch

```
┌──────────────────┐       JWT Bearer Token        ┌───────────────────────────────────────┐
│  Next.js Frontend│ ─────────────────────────────▶ │            FastAPI Backend             │
│  (Port 3000)     │                                │                                       │
│                  │                                │  POST /api/{user_id}/chat              │
│  • ChatKit UI    │                                │         │                              │
│  • /chat page    │                                │         ▼                              │
│  • Auth Context  │                                │  ┌─────────────────┐                   │
│                  │◀───────────────────────────────│  │  OpenAI Agent    │                   │
│                  │  { conversation_id,            │  │  (Agents SDK)    │                   │
│                  │    response,                   │  └────────┬────────┘                   │
│                  │    tool_calls }                │           │                             │
└──────────────────┘                                │           ▼                             │
                                                    │  ┌─────────────────┐     ┌───────────┐ │
                                                    │  │   MCP Server     │────▶│  Neon DB  │ │
                                                    │  │   (5 Tools)      │◀────│           │ │
                                                    │  └─────────────────┘     │ • tasks   │ │
                                                    │                          │ • convos  │ │
                                                    │                          │ • messages│ │
                                                    └───────────────────────────└───────────┘ │
```

---

## Implementation Phases

### Phase 1: Database Models
- Create `Conversation` model (id, user_id, created_at, updated_at)
- Create `Message` model (id, user_id, conversation_id FK, role, content, created_at)
- Run migration on Neon DB
- Verify tables created — existing `tasks` table untouched
- **Validation:** Query both tables from DB client → rows insertable and readable

### Phase 2: MCP Server + 5 Tools
- Install Official MCP SDK
- Create `mcp/todo_tools.py` with 5 tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Each tool connects to Neon DB via SQLModel, filters by `user_id`, returns structured JSON
- Handle errors: task not found → return message, never crash
- **Validation:** Call each tool manually with test `user_id` → verify DB operations

### Phase 3: OpenAI Agent Setup
- Install OpenAI Agents SDK
- Create single "Todo Assistant" agent in `agents/todo_agent.py`
- Attach all 5 MCP tools to agent
- Write system prompt: friendly, concise, confirm actions, use tools for tasks, respond directly for greetings
- Configure Runner to execute agent with message history
- Add `OPENAI_API_KEY` to backend `.env`
- **Validation:** Run agent locally with test message → correct tool called → correct response returned

### Phase 4: Chat Endpoint
- Create `POST /api/{user_id}/chat` in `routes/chat.py`
- Protect with existing `get_current_user` JWT dependency
- Implement full flow: JWT verify → fetch/create conversation → save user message → build history → run agent → save assistant response → return JSON
- Validate `user_id` from JWT matches URL `user_id`
- Register route in `main.py`
- **Validation:** curl/Postman test with valid JWT → full round-trip works

### Phase 5: Frontend ChatKit UI
- Install OpenAI ChatKit
- Create `/chat` page (protected route)
- Build chat interface: message list, input box, send button, loading state
- Send messages to backend with JWT Bearer token
- Maintain `conversation_id` in component state
- Add `/chat` link to existing navigation
- Add `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` to frontend `.env.local`
- **Validation:** Sign in → open /chat → send messages → tasks created/listed/updated in DB

### Phase 6: Integration Testing
- End-to-end: signup → signin → chat → all 5 operations → verify in DB
- User isolation: User A chat → User B chat → neither sees other's data
- Conversation persistence: send messages → restart server → old messages load
- Existing REST API still works alongside chatbot
- **Validation:** All success criteria from specify file pass

---

## Decisions Needing Documentation

| Decision | Options | Tradeoff | Choice |
|---|---|---|---|
| MCP transport | stdio vs HTTP SSE | stdio = simpler, in-process; HTTP SSE = separate service, more setup | stdio — agent and MCP server run in same FastAPI process, simpler for Phase 3 |
| Conversation creation | Auto-create vs explicit | Auto = seamless UX; Explicit = user controls sessions | Auto-create when no `conversation_id` sent — better UX |
| Message history limit | All messages vs last N | All = full context but token expensive; Last N = cheaper but loses context | Last 50 messages — balances context and cost |
| Agent model | gpt-4o vs gpt-4o-mini | 4o = smarter, expensive; mini = cheaper, good enough for tool calling | gpt-4o-mini — task operations are simple, mini handles them well |
| Tool error handling | Raise exception vs return error message | Exception = agent crashes; Error message = agent can relay to user | Return error message — agent tells user "task not found" gracefully |

## Response snapshot

Executed `/sp.plan` for feature 007-ai-chatbot. Generated complete implementation plan with 6 phases covering database models, MCP server (5 tools), OpenAI Agent setup, chat endpoint, frontend chat UI, and integration testing.

**Key research finding**: ChatKit requires SSE streaming which conflicts with the spec's "HTTP POST only" constraint. Resolution: use custom React + Tailwind CSS chat UI instead.

**Generated artifacts**:
- `specs/007-ai-chatbot/plan.md` — Full implementation plan with technical context, constitution check, 6 phases, testing strategy, risks
- `specs/007-ai-chatbot/research.md` — Technology research (OpenAI Agents SDK, MCP SDK, ChatKit analysis)
- `specs/007-ai-chatbot/data-model.md` — Database schema for Conversation + Message models
- `specs/007-ai-chatbot/contracts/chat-api.yaml` — OpenAPI 3.1 contract for chat endpoints
- `specs/007-ai-chatbot/quickstart.md` — Developer setup guide
- `CLAUDE.md` — Updated with 007-ai-chatbot technology context

**7 architectural decisions documented** (MCP transport, conversation creation, history limit, agent model, error handling, frontend UI, conversation loading).

## Outcome

- ✅ Impact: Complete implementation plan ready for /sp.tasks generation
- 🧪 Tests: None (planning phase)
- 📁 Files: 6 files created/modified (plan.md, research.md, data-model.md, chat-api.yaml, quickstart.md, CLAUDE.md)
- 🔁 Next prompts: /sp.tasks to generate task breakdown, then /sp.implement for Phase 1
- 🧠 Reflection: ChatKit/SSE conflict caught during research — validated importance of researching libraries before committing to spec assumptions

## Evaluation notes (flywheel)

- Failure modes observed: ChatKit SSE requirement conflicts with spec HTTP POST constraint; resolved by choosing custom UI
- Graders run and results (PASS/FAIL): Constitution check PASS (with documented ChatKit deviation)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Verify MCP stdio transport works with openai-agents by running a minimal proof-of-concept before full implementation
