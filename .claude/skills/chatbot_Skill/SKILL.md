# CLAUDE.md – Phase 3: AI Chatbot Skills & Instructions

## Project Context
This is a Todo Full-Stack App with Next.js 16+ frontend, FastAPI backend, Neon Serverless PostgreSQL, and Better Auth + JWT authentication. You are adding an AI chatbot that manages todos through natural language.

---

## How The Chatbot Works (Complete Flow)

### Step-by-Step Request Cycle
1. User types a message in ChatKit UI (e.g., "Add a task to buy groceries")
2. Frontend sends `POST /api/{user_id}/chat` with JWT token in `Authorization: Bearer <token>` header
3. FastAPI receives the request → JWT dependency extracts `user_id` → validates it matches URL `user_id`
4. If `conversation_id` is provided, fetch that conversation's message history from Neon DB. If not, create a new Conversation row in DB
5. Store the user's message in the `messages` table (role: "user")
6. Build the full message array: system prompt + all previous messages + new user message
7. Pass this message array to the OpenAI Agents SDK Runner with MCP tools attached
8. Agent reads the message, decides which MCP tool to call (or responds directly)
9. MCP tool executes → reads/writes to Neon DB → returns result to agent
10. Agent generates a friendly response based on tool result
11. Store the assistant's response in the `messages` table (role: "assistant")
12. Return JSON: `{ conversation_id, response, tool_calls }` to frontend
13. Server forgets everything — NO in-memory state kept

---

## How User Identity Works

- User logs in via Better Auth on frontend → gets JWT token
- Every chat request includes JWT in header
- FastAPI's `get_current_user` dependency decodes JWT → extracts `user_id`
- This `user_id` is passed to EVERY MCP tool call so tools only access that user's tasks
- The `user_id` in URL must match JWT's `user_id` — otherwise return `403`
- Conversations and messages are also scoped by `user_id` — a user can never see another user's chats

---

## Database Models (Neon PostgreSQL via SQLModel)

### Existing Table
```
tasks: id, user_id, title, description, completed, created_at, updated_at
```

### New Tables To Create
```
conversations: id, user_id, created_at, updated_at
messages: id, user_id, conversation_id (FK → conversations.id), role ("user" | "assistant"), content, created_at
```

### Rules
- Every message belongs to a conversation
- Every conversation belongs to a user
- When fetching history, query messages WHERE conversation_id = X ORDER BY created_at ASC
- Never fetch messages from other users' conversations

---

## MCP Server Setup (Official MCP SDK)

### What Is MCP Server
A local server that exposes your app's operations as "tools" the AI agent can call. Think of it as a menu of actions the agent can pick from.

### 5 Tools To Expose

**1. add_task**
- Input: `user_id` (string), `title` (string), `description` (string, optional)
- Action: INSERT into tasks table
- Output: `{ task_id, status: "created", title }`

**2. list_tasks**
- Input: `user_id` (string), `status` (string: "all" | "pending" | "completed")
- Action: SELECT from tasks table with filter
- Output: Array of task objects

**3. complete_task**
- Input: `user_id` (string), `task_id` (integer)
- Action: UPDATE tasks SET completed = true WHERE id = task_id AND user_id = user_id
- Output: `{ task_id, status: "completed", title }`

**4. delete_task**
- Input: `user_id` (string), `task_id` (integer)
- Action: DELETE from tasks WHERE id = task_id AND user_id = user_id
- Output: `{ task_id, status: "deleted", title }`

**5. update_task**
- Input: `user_id` (string), `task_id` (integer), `title` (string, optional), `description` (string, optional)
- Action: UPDATE tasks SET title/description WHERE id = task_id AND user_id = user_id
- Output: `{ task_id, status: "updated", title }`

### Critical Rules For MCP Tools
- Every tool MUST receive `user_id` — never operate without it
- Every DB query MUST include `WHERE user_id = user_id` — prevents cross-user access
- Tools are stateless — they open DB connection, do work, close connection
- If task not found, return error message (don't crash)
- Tools connect directly to Neon DB using `DATABASE_URL` from env

---

## OpenAI Agents SDK Setup

### Agent Configuration
```
- Single agent named "Todo Assistant"
- System prompt: "You are a helpful todo manager. Use the provided tools to manage the user's tasks. Always confirm what you did. Be friendly and concise."
- Tools: All 5 MCP tools attached
- Model: Use default or gpt-4o-mini
```

### How Agent Decides Which Tool To Call
- User says "add/create/remember" → agent calls `add_task`
- User says "show/list/what are my" → agent calls `list_tasks`
- User says "done/complete/finished" → agent calls `complete_task`
- User says "delete/remove/cancel" → agent calls `delete_task`
- User says "change/update/rename/edit" → agent calls `update_task`
- User says "hello/hi/thanks" → agent responds directly without tools
- Agent can chain multiple tools in one turn (e.g., "add milk and show all tasks")

### Runner Execution
```
1. Create Agent with system prompt + MCP tools
2. Call Runner.run(agent, messages=full_message_history)
3. Runner returns agent's response + list of tool calls made
4. Extract response text and tool_calls from result
```

---

## FastAPI Chat Endpoint

### Endpoint: `POST /api/{user_id}/chat`

**Protected by:** `get_current_user` JWT dependency

**Request Body:**
```json
{
  "conversation_id": 5,       // optional — omit to start new conversation
  "message": "Add task buy milk"  // required
}
```

**Response Body:**
```json
{
  "conversation_id": 5,
  "response": "Done! I've added 'buy milk' to your tasks.",
  "tool_calls": ["add_task"]
}
```

**Endpoint Logic (in order):**
1. Verify JWT → extract user_id → match with URL user_id
2. If conversation_id provided → verify it belongs to this user_id → fetch messages
3. If no conversation_id → create new Conversation row → use empty message history
4. Save user message to messages table
5. Build messages array: system prompt + history + new message
6. Run agent with messages + MCP tools
7. Save assistant response to messages table
8. Return response JSON

---

## Frontend ChatKit UI

### Page: `/chat` (protected route)

**Components Needed:**
- Chat message list (scrollable, auto-scroll to bottom)
- Input box with send button
- Conversation selector/new chat button
- Loading indicator while agent is thinking

**How Frontend Sends Messages:**
```
POST {NEXT_PUBLIC_API_URL}/api/{user_id}/chat
Headers: { Authorization: "Bearer <jwt_token>" }
Body: { conversation_id: currentConversationId, message: userInput }
```

**How Frontend Handles Response:**
1. Show user message immediately in chat
2. Show loading spinner
3. Receive response → display assistant message
4. Store conversation_id from response for next message
5. If tool_calls present, optionally show what tools were used

---

## Environment Variables Needed

### Backend `.env` (add to existing)
```
OPENAI_API_KEY=sk-your-openai-api-key
```

### Frontend `.env.local` (already exists)
```
# No new env needed — uses existing NEXT_PUBLIC_API_URL and auth token
```

---

## File Structure (New Files Only)

```
backend/
├── app/
│   ├── agents/
│   │   └── todo_agent.py        # Agent definition + system prompt + runner
│   ├── mcp/
│   │   └── todo_tools.py        # MCP server with 5 tools
│   ├── models/
│   │   ├── conversation.py      # Conversation SQLModel
│   │   └── message.py           # Message SQLModel
│   ├── routes/
│   │   └── chat.py              # POST /api/{user_id}/chat endpoint
│   └── main.py                  # Register new chat route

frontend/
├── src/app/
│   └── chat/
│       └── page.tsx             # ChatKit UI page
```

---

## Common Mistakes To Avoid

1. **Forgetting user_id in MCP tools** — every tool MUST filter by user_id
2. **Storing state in memory** — server must be stateless, all state goes to Neon DB
3. **Not loading conversation history** — agent needs past messages to understand context
4. **Not saving messages to DB** — both user and assistant messages must be saved
5. **Missing JWT auth on chat endpoint** — chat endpoint must be protected
6. **Not handling empty conversations** — first message should create a new conversation
7. **Agent without system prompt** — agent needs clear instructions to behave correctly
8. **Not passing user_id from JWT to tools** — user_id comes from JWT, NOT from user input
9. **Cross-user access** — always verify conversation belongs to the authenticated user
10. **Not adding OPENAI_API_KEY to env** — agent won't work without it

---

## Testing Checklist

- [ ] New user signs in → opens chat → sends first message → conversation created in DB
- [ ] "Add task buy milk" → add_task tool called → task appears in tasks table with correct user_id
- [ ] "Show my tasks" → list_tasks tool called → agent lists user's tasks only
- [ ] "Complete task 1" → complete_task called → task marked completed in DB
- [ ] "Delete task 1" → delete_task called → task removed from DB
- [ ] "Rename task 2 to call doctor" → update_task called → task updated in DB
- [ ] Conversation history persists → close browser → reopen → old messages load
- [ ] User A cannot see User B's conversations or tasks
- [ ] Invalid/expired JWT → chat endpoint returns 401
- [ ] Server restart → conversations resume from DB (no state lost)