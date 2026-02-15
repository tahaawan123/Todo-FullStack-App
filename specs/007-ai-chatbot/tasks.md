# Tasks: Todo AI Chatbot Integration

**Input**: Design documents from `/specs/007-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/chat-api.yaml, research.md, quickstart.md

**Tests**: Not explicitly requested in spec — test tasks omitted. Manual validation at each checkpoint.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and create directory structure

- [x] T001 Add `openai-agents` and `mcp` to backend/requirements.txt and install
- [x] T002 Add `OPENAI_API_KEY` placeholder to backend/.env (never commit actual key)
- [x] T003 [P] Create backend directory structure: `backend/app/mcp/` and `backend/app/agents/` with `__init__.py` files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models and schemas that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create Conversation SQLModel in backend/app/models/conversation_model.py per data-model.md (id, user_id, created_at, updated_at)
- [x] T005 [P] Create Message SQLModel in backend/app/models/message_model.py per data-model.md (id, conversation_id FK, user_id, role, content, created_at)
- [x] T006 [P] Create request/response schemas (ChatRequest, ChatResponse, ChatHistoryResponse, MessageRead) in backend/app/schemas/chat_schema.py per contracts/chat-api.yaml
- [x] T007 Import Conversation and Message models in backend/app/main.py so SQLModel.metadata.create_all() auto-creates tables on startup
- [x] T008 Start backend server and verify `conversation` and `message` tables are created in Neon DB — existing `todo` table untouched

**Checkpoint**: Database ready — conversation and message tables exist, schemas defined

---

## Phase 3: User Story 1 — Manage Todos via Natural Language Chat (Priority: P1) MVP

**Goal**: User sends natural language messages, AI agent calls MCP tools to manage tasks in DB, returns confirmation

**Independent Test**: Send "add task buy milk" via curl with valid JWT → task created in DB → response confirms it

### Backend Implementation

- [x] T009 [US1] Create MCP server with 5 tools (add_task, list_tasks, complete_task, delete_task, update_task) in backend/app/mcp/todo_tools.py — each tool receives user_id, opens DB session via SQLModel, performs operation, returns structured JSON, handles errors gracefully (return message, never raise)
- [x] T010 [US1] Create Todo Assistant agent in backend/app/agents/todo_agent.py — configure Agent with name, system prompt (friendly, concise, confirm actions, use tools for tasks, respond directly for greetings), model gpt-4o-mini, and function to create MCPServerStdio pointing to todo_tools.py
- [x] T011 [US1] Create POST /api/{user_id}/chat endpoint in backend/app/routers/chat_router.py — full flow: get_current_user JWT dependency, verify user_id match (403 if mismatch), fetch or create Conversation, save user Message, load last 50 messages as history, run agent via Runner.run(), save assistant Message, return ChatResponse with conversation_id + response + tool_calls
- [x] T012 [US1] Register chat router in backend/app/main.py with `app.include_router(chat_router.router, prefix="/api", tags=["chat"])`

### Frontend Implementation

- [x] T013 [P] [US1] Create TypeScript chat types (ChatMessage, ChatResponse, ChatRequest) in frontend/lib/services/chatService.ts (inline with service)
- [x] T014 [P] [US1] Create sendMessage() function in frontend/lib/services/chatService.ts — uses fetchWithAuth to POST to /api/{user_id}/chat with message and optional conversation_id, returns typed ChatResponse
- [x] T015 [US1] Create useChat hook in frontend/lib/hooks/useChat.ts — manages messages array, conversation_id, isLoading state, error state; exposes sendMessage function that adds user message optimistically, calls chatService.sendMessage, appends assistant response, updates conversation_id
- [x] T016-T019 [US1] Chat UI components built inline in /chat page (MessageBubble, ChatInput, MessageList, ChatContainer functionality combined in page.tsx)
- [x] T020 [US1] Create /chat page in frontend/app/chat/page.tsx — client component, gets user session, full-height layout with inline chat components

**Checkpoint**: Core chat working — user can send messages and manage tasks via natural language. Validate with curl + frontend.

---

## Phase 4: User Story 4 — Authenticated and Isolated Chat Access (Priority: P1)

**Goal**: Only authenticated users access /chat; each user isolated to own tasks and conversations

**Independent Test**: Access /chat without auth → redirect to /signin; User A cannot see User B's tasks via chat

- [x] T021 [US4] Update middleware matcher in frontend/middleware.ts — "/chat" already in matcher array alongside "/dashboard"
- [x] T022 [US4] Add /chat link to existing navigation component — "AI Chat" link added to Header.tsx nav
- [x] T023 [US4] Verify user isolation: MCP tools filter by user_id, chat_router.py verifies JWT user_id matches URL user_id with 403 on mismatch via _verify_user_access()

**Checkpoint**: Auth complete — unauthenticated users redirected, user isolation enforced on backend and frontend

---

## Phase 5: User Story 2 — Multi-Action Requests in a Single Message (Priority: P2)

**Goal**: User sends "add milk and show all tasks" → agent chains both tool calls in one turn

**Independent Test**: Send "add task milk and show all tasks" → response confirms both task creation and full list

- [x] T024 [US2] Agent system prompt already instructs: "When multiple operations are requested in one message, call tools sequentially and combine results into one response"
- [ ] T025 [US2] Manually test multi-action messages ("add milk and show all tasks", "complete task 1 and delete task 2") via curl to verify agent chains tool calls correctly — document results

**Checkpoint**: Multi-action working — agent handles chained requests in single turn

---

## Phase 6: User Story 3 — Persistent Conversation History (Priority: P3)

**Goal**: Chat history survives page refreshes and server restarts; users see previous messages on return

**Independent Test**: Send messages → refresh page → previous messages displayed

### Backend Implementation

- [x] T026 [US3] GET /api/{user_id}/chat/history endpoint already in chat_router.py — protected by get_current_user, verifies user_id match, finds user's most recent Conversation, returns all Messages ordered by created_at

### Frontend Implementation

- [x] T027 [US3] getHistory() function already in frontend/lib/services/chatService.ts — calls GET /api/{user_id}/chat/history via fetchWithAuth
- [x] T028 [US3] useChat hook loads history on mount (useEffect with loadHistory), populates messages and conversation_id
- [ ] T029 [US3] Manually verify: send messages → refresh page → messages reload from DB → send new message → appends to same conversation

**Checkpoint**: History persistent — messages survive page refresh and server restart

---

## Phase 7: User Story 5 — Backward Compatibility (Priority: P1)

**Goal**: All existing REST endpoints and UI continue to work identically after chatbot integration

**Independent Test**: Call GET /api/{user_id}/tasks and all CRUD endpoints → identical responses to pre-chatbot state

- [x] T030 [US5] Verify existing todo_router.py is UNCHANGED — no file modifications to backend/app/routers/todo_router.py
- [x] T031 [US5] Verify existing todo_model.py is UNCHANGED — no file modifications to backend/app/models/todo_model.py
- [ ] T032 [US5] Manually test all existing REST endpoints: GET /api/{user_id}/tasks, POST /api/{user_id}/tasks, PUT /api/{user_id}/tasks/{id}, DELETE /api/{user_id}/tasks/{id}, PATCH /api/{user_id}/tasks/{id}/complete — all return expected results

**Checkpoint**: Zero regressions — all existing functionality intact

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and production readiness

- [x] T033 [P] Error handling for AI service unavailability in chat_router.py — try/except wraps run_agent(), returns 503 for OpenAI/API errors
- [x] T034 [P] Message length validation in chat_schema.py — ChatRequest.message has max_length=10000
- [x] T035 [P] Empty message handling in chat_router.py — returns "Please type a message to get started!"
- [x] T036 Verify OPENAI_API_KEY is not exposed to frontend — confirm no frontend env var references, key only in backend/.env
- [ ] T037 Run quickstart.md validation — follow all steps in specs/007-ai-chatbot/quickstart.md end-to-end and verify each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — the MVP; must complete first
- **US4 (Phase 4)**: Depends on Phase 3 (chat endpoint must exist) — auth-specific additions
- **US2 (Phase 5)**: Depends on Phase 3 (agent must be working) — primarily system prompt tuning + verification
- **US3 (Phase 6)**: Depends on Phase 3 (chat endpoint must exist) — adds history retrieval
- **US5 (Phase 7)**: Can start after Phase 2 (independent verification) — but best done after all code changes
- **Polish (Phase 8)**: Depends on Phases 3–6 — refinements to completed code

### Within Each Phase

```
Phase 2: T004 ∥ T005 ∥ T006 → T007 → T008
Phase 3 backend: T009 → T010 → T011 → T012
Phase 3 frontend: T013 ∥ T014 → T015 → T016 ∥ T017 → T018 → T019 → T020
Phase 4: T021 ∥ T022 → T023
Phase 5: T024 → T025
Phase 6: T026 → T027 → T028 → T029
Phase 7: T030 ∥ T031 → T032
Phase 8: T033 ∥ T034 ∥ T035 → T036 → T037
```

### Parallel Opportunities

- **Phase 2**: T004, T005, T006 all create different files — run in parallel
- **Phase 3 backend + frontend**: Backend (T009–T012) and frontend types/service (T013–T014) can run in parallel since they're different codebases; frontend components (T016, T017) can run in parallel
- **Phase 4**: T021 and T022 modify different files — run in parallel
- **Phase 8**: T033, T034, T035 modify different aspects of the same file but can be combined or run sequentially

---

## Parallel Example: Phase 3 (US1)

```bash
# Backend chain (sequential — each depends on previous):
T009: MCP tools → T010: Agent setup → T011: Chat endpoint → T012: Router registration

# Frontend parallel batch 1 (independent files):
T013: Chat types (frontend/lib/types/chat.ts)
T014: Chat service (frontend/lib/services/chatService.ts)

# Frontend parallel batch 2 (independent components):
T016: MessageBubble (frontend/components/chat/MessageBubble.tsx)
T017: ChatInput (frontend/components/chat/ChatInput.tsx)

# Frontend chain (each depends on previous):
T015: useChat hook → T018: MessageList → T019: ChatContainer → T020: /chat page
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T008)
3. Complete Phase 3: US1 Core Chat (T009–T020)
4. **STOP and VALIDATE**: curl test + frontend test — user can chat and manage tasks
5. This alone delivers the core value proposition

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Core Chat) → Test → **MVP deployed!** (Phases 1–3)
3. US4 (Auth & Isolation) → Test → Secure chat (Phase 4)
4. US2 (Multi-Action) → Test → Power user support (Phase 5)
5. US3 (Persistent History) → Test → Full conversation continuity (Phase 6)
6. US5 (Backward Compat) → Verify → Confidence check (Phase 7)
7. Polish → Production ready (Phase 8)

Each increment adds value without breaking previous stories.

---

## Task Summary

| Phase | Story | Task Count | Key Output |
|-------|-------|-----------|------------|
| Phase 1: Setup | — | 3 | Dependencies installed, directory structure |
| Phase 2: Foundational | — | 5 | DB models, schemas, tables created |
| Phase 3: US1 Core Chat | US1 (P1) | 12 | MCP tools, agent, endpoint, full frontend UI |
| Phase 4: Auth & Isolation | US4 (P1) | 3 | Middleware, nav link, isolation verification |
| Phase 5: Multi-Action | US2 (P2) | 2 | System prompt tuning, manual verification |
| Phase 6: History | US3 (P3) | 4 | History endpoint, frontend loading |
| Phase 7: Backward Compat | US5 (P1) | 3 | Verification of zero regressions |
| Phase 8: Polish | — | 5 | Error handling, edge cases, quickstart validation |
| **Total** | | **37** | |

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MCP tools use stdio transport — never `print()` to stdout in todo_tools.py
- All `user_id` comes from JWT `get_current_user` dependency, never from request body
