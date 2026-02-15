---
id: "0001"
title: "Create AI Chatbot Spec"
stage: spec
date: 2026-02-10
surface: agent
model: claude-opus-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: /sp.specify
labels: ["ai-chatbot", "spec", "natural-language", "mcp", "openai-agents"]
links:
  spec: specs/007-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-ai-chatbot/spec.md
  - specs/007-ai-chatbot/checklists/requirements.md
tests:
  - spec quality checklist validation (all items passed)
---

## Prompt

/sp.specify # /sp.specify – Phase 3: Todo AI Chatbot Integration

## Objective

Add an AI chatbot to the existing Todo Full-Stack App (Next.js + FastAPI + Neon PostgreSQL + Better Auth) that manages todos through natural language. User types messages like "add task buy milk" and the agent calls the correct MCP tool to execute it in the database.

---

## What To Build

### Backend – MCP Server (Official MCP SDK)
- Create MCP server exposing 5 stateless tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Every tool receives `user_id` (from JWT, not user input) and operates on Neon DB via SQLModel
- Every tool returns structured JSON: `{ task_id, status, title }` or array for list_tasks
- Tool errors return friendly message, never crash

### Backend – OpenAI Agent (Agents SDK)
- Single agent named "Todo Assistant" with all 5 MCP tools attached
- System prompt: friendly, concise, always confirms actions, uses tools for task operations, responds directly for greetings
- Agent can chain multiple tools in one turn
- Runner executes agent with full message history + new message

### Backend – Chat Endpoint
- `POST /api/{user_id}/chat` protected by existing JWT auth dependency
- Request: `{ conversation_id?: integer, message: string }`
- Response: `{ conversation_id: integer, response: string, tool_calls: string[] }`
- Flow: verify JWT → fetch/create conversation → save user message → run agent → save assistant response → return response
- Server holds NO state after response

### Backend – New Database Models (SQLModel + Neon)
- `Conversation`: id, user_id, created_at, updated_at
- `Message`: id, user_id, conversation_id (FK), role ("user"|"assistant"), content, created_at
- Existing `tasks` table unchanged
- All queries filtered by `user_id`

### Frontend – ChatKit UI
- New page at `/chat` (protected route, redirect to signin if unauthenticated)
- OpenAI ChatKit component for chat interface
- Sends messages to `POST /api/{user_id}/chat` with JWT Bearer token
- Maintains `conversation_id` in state across turns
- Shows loading state while agent processes
- Displays user and assistant messages in chat bubbles

### Environment Variables
- Backend `.env` add: `OPENAI_API_KEY=sk-your-key`
- Frontend `.env.local` add: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key` (for hosted ChatKit)
- All existing env variables remain unchanged

---

## Success Criteria

- "Add task buy groceries" → `add_task` called → task saved in Neon with correct `user_id` → agent confirms
- "Show my tasks" → `list_tasks` called → agent displays user's tasks only
- "Complete task 3" → `complete_task` called → task marked done in DB → agent confirms
- "Delete task 2" → `delete_task` called → task removed → agent confirms
- "Rename task 1 to call doctor" → `update_task` called → task updated → agent confirms
- "Hi" or "thanks" → agent responds directly without tool calls
- "Add milk and show all tasks" → agent chains `add_task` + `list_tasks` in one turn
- Conversation persists in DB — server restart loses nothing, old messages reload
- User A cannot see User B's tasks or conversations via chatbot
- Chat endpoint returns `401` without valid JWT, `403` if `user_id` mismatch
- Existing REST API endpoints `/api/{user_id}/tasks/*` still work unchanged
- `/chat` page redirects to `/signin` if not authenticated

---

## Constraints

- OpenAI Agents SDK only — no LangChain, no custom loops
- Official MCP SDK only — no custom tool protocol
- OpenAI ChatKit for frontend chat UI
- SQLModel ORM — no raw SQL
- Single agent, single chat endpoint — no multi-agent, no multiple endpoints
- `OPENAI_API_KEY` backend only — never exposed to frontend
- Do NOT modify existing auth, REST API routes, or tasks table schema

---

## Not Building

- Voice input or speech-to-text
- File/image attachment in chat
- Streaming/real-time token-by-token responses
- Multiple agents or agent handoff
- Chat history search or export
- Admin panel for viewing all users' chats
- Rate limiting on chat endpoint
- WebSocket connection — HTTP POST only

## Response snapshot

Created feature specification for Todo AI Chatbot Integration (007-ai-chatbot). The spec includes:
- 5 prioritized user stories: core natural language task management (P1), multi-action requests (P2), persistent conversations (P3), authenticated/isolated access (P1), backward compatibility (P1)
- 23 functional requirements covering all 5 task operations, conversation persistence, user isolation, security, and error handling
- 9 measurable success criteria (technology-agnostic)
- 7 edge cases
- 3 key entities (Conversation, Message, existing Task)
- Technology constraints captured from user requirements (OpenAI Agents SDK, MCP SDK, ChatKit, SQLModel)
- Quality checklist: all items passed, zero [NEEDS CLARIFICATION] markers

## Outcome

- ✅ Impact: Feature spec created with full coverage of natural language todo management via AI chatbot
- 🧪 Tests: Spec quality checklist — all 16 items passed
- 📁 Files: 2 files created (spec.md, checklists/requirements.md)
- 🔁 Next prompts: /sp.clarify (optional) or /sp.plan to create architectural plan
- 🧠 Reflection: User provided exceptionally detailed feature description with clear constraints and success criteria, allowing the spec to be written without any clarification questions

## Evaluation notes (flywheel)

- Failure modes observed: None — user input was comprehensive enough to avoid ambiguity
- Graders run and results (PASS/FAIL): Quality checklist PASS (16/16)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
