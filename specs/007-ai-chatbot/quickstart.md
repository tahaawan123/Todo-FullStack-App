# Quickstart: Todo AI Chatbot Integration

**Feature**: 007-ai-chatbot | **Date**: 2026-02-10

## Prerequisites

- Python 3.11+
- Node.js 18+
- Running Neon PostgreSQL instance (existing from 005-auth-system)
- OpenAI API key with access to `gpt-4o-mini`

## 1. Backend Setup

### Install new dependencies

```bash
cd backend
pip install openai-agents mcp
```

Or add to `requirements.txt`:
```
openai-agents
mcp
```

### Add environment variable

Add to `backend/.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Verify database

New tables (`conversation`, `message`) are auto-created on FastAPI startup via `SQLModel.metadata.create_all()`. No manual migration needed.

### Start backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Check logs for:
```
Database tables created successfully
```

## 2. Frontend Setup

### No new dependencies required

The chat UI is built with existing React + Tailwind CSS. No new npm packages needed.

### Start frontend

```bash
cd frontend
npm run dev
```

## 3. Verify Integration

### Test chat endpoint (curl)

```bash
# Replace USER_ID and TOKEN with actual values from your auth session

# Send a chat message
curl -X POST http://localhost:8000/api/{USER_ID}/chat \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "add task buy groceries"}'

# Expected response:
# {
#   "conversation_id": 1,
#   "response": "I've added 'buy groceries' to your task list! (Task #1)",
#   "tool_calls": ["add_task"]
# }
```

### Test conversation history

```bash
curl http://localhost:8000/api/{USER_ID}/chat/history \
  -H "Authorization: Bearer {TOKEN}"

# Expected: conversation_id + array of messages
```

### Test via frontend

1. Open `http://localhost:3000/signin` and sign in
2. Navigate to `http://localhost:3000/chat`
3. Type "add task buy milk" and send
4. Verify the assistant confirms the task was added
5. Type "show my tasks" to verify the task appears

## 4. Project Structure (New Files)

```
backend/app/
├── models/conversation_model.py   # Conversation SQLModel
├── models/message_model.py        # Message SQLModel
├── routers/chat_router.py         # POST /api/{user_id}/chat + GET history
├── mcp/todo_tools.py              # MCP server with 5 tools
└── agents/todo_agent.py           # OpenAI Agent configuration

frontend/
├── app/chat/page.tsx              # /chat page
├── components/chat/               # Chat UI components
├── lib/services/chatService.ts    # API client for chat
├── lib/hooks/useChat.ts           # Chat state hook
└── lib/types/chat.ts              # TypeScript types
```

## 5. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` on chat endpoint | Expired or missing JWT token | Re-authenticate; check `authClient.token()` |
| `503 Service Unavailable` | OpenAI API key invalid or API down | Verify `OPENAI_API_KEY` in `.env`; check OpenAI status |
| Tables not created | Models not imported before `create_all()` | Ensure model imports in `main.py` |
| MCP server crashes | `print()` to stdout in MCP tools | Use `logging` or `print(..., file=sys.stderr)` instead |
| Chat page redirects to sign-in | Not authenticated or session expired | Sign in first; check middleware matcher includes `/chat` |
