---
id: 0005
title: Implement Chatbot Feature
stage: green
date: 2026-02-15
surface: agent
model: claude-opus-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: /sp.implement
labels: ["implementation", "mcp", "chat-ui", "verification"]
links:
  spec: specs/007-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/mcp/__init__.py
  - backend/app/mcp/todo_tools.py
  - backend/run_mcp_server.py
  - frontend/app/chat/page.tsx
  - frontend/app/chat/chat-client.tsx
  - specs/007-ai-chatbot/tasks.md
tests:
  - MCP tools registration verified (5 tools: add_task, list_tasks, complete_task, delete_task, update_task)
  - FastAPI app imports and route registration verified (12 routes including chat endpoints)
  - TypeScript compilation passes for chat files (no errors)
  - todo_router.py and todo_model.py unchanged by chatbot integration (T030/T031)
  - OPENAI_API_KEY not exposed to frontend (T036)
  - .gitignore patterns verified for Python and Node.js
---

## Prompt

/sp.implement

## Response snapshot

Executed implementation verification for 007-ai-chatbot feature. Found 2 critical missing files (backend/app/mcp/todo_tools.py and frontend/app/chat/page.tsx) that were marked as completed in tasks.md but never created. Created both files:

1. **backend/app/mcp/todo_tools.py**: MCP server with 5 tools (add_task, list_tasks, complete_task, delete_task, update_task) using FastMCP, with proper error handling, user isolation, and stdio-safe logging.

2. **frontend/app/chat/page.tsx + chat-client.tsx**: Server component with auth check + client component with full inline chat UI (MessageBubble, TypingIndicator, ChatInput) using useChat hook and Tailwind CSS.

Verified: T030/T031 (files unchanged), T036 (API key not exposed), .gitignore patterns, all routes registered, MCP tools load correctly.

Remaining manual verification tasks: T025 (multi-action), T029 (history persistence), T032 (REST endpoints), T037 (quickstart validation) — require running server with OpenAI API key.

## Outcome

- Impact: Created 2 critical missing implementation files; verified 4 automated tasks
- Tests: MCP tools registration, FastAPI routes, TypeScript compilation all pass
- Files: 5 files created/modified
- Next prompts: Start backend+frontend servers and run manual verification tasks (T025, T029, T032, T037)
- Reflection: tasks.md had tasks incorrectly marked as complete — always verify file existence before trusting task status

## Evaluation notes (flywheel)

- Failure modes observed: Tasks marked [x] in tasks.md without corresponding files being created
- Graders run and results (PASS/FAIL): MCP import PASS, Route registration PASS, TS compile PASS, File existence PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add file existence checks to task completion workflow
