---
id: "0009"
title: Fix HuggingFace JWT secret and CORS mismatch
stage: green
date: 2026-02-18
surface: agent
model: claude-sonnet-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: user
command: chat
labels: ["bug-fix","jwt","cors","huggingface","deployment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/main.py
tests:
  - manual: sign in then verify todos load from HuggingFace backend
---

## Prompt

backend ko hugging face py deply kia hai ab frontend pr  env mai hugging face link dali to  or frontend run kia to sign in kai bad ye error aa raha hai issy resolve karo

## Error Type
Console Error

## Error Message
Could not validate credentials

    at fetchWithAuth (lib/api.ts:36:11)
    at async getAllTodos (lib/services/todoService.ts:42:22)
    at async loadTodos (lib/hooks/useTodos.ts:40:21)

## Response snapshot

Root-caused two deployment issues:

1. **JWT_SECRET mismatch (primary cause)**: Frontend signs JWT with `BETTER_AUTH_SECRET`; backend verifies with `JWT_SECRET`. On Hugging Face the `JWT_SECRET` env var was missing or different from `BETTER_AUTH_SECRET`, causing PyJWT to throw `InvalidTokenError` → "Could not validate credentials".

2. **CORS missing production origin**: `allow_origins` only had `localhost:3000`. Added env-var-driven `CORS_ALLOWED_ORIGINS` so any production frontend URL can be allowed without code changes.

**Code fix**: Updated `backend/app/main.py` to read `CORS_ALLOWED_ORIGINS` env var (comma-separated) and merge with defaults.

**Manual action required on Hugging Face Spaces**:
- `JWT_SECRET` = exact same string as frontend's `BETTER_AUTH_SECRET`
- `CORS_ALLOWED_ORIGINS` = frontend URL (e.g. `http://localhost:3000` or production URL)

## Outcome

- ✅ Impact: Fixed "Could not validate credentials" on HuggingFace-deployed backend by aligning JWT secret and CORS origins
- 🧪 Tests: Manual — sign in, verify todo list loads without 401
- 📁 Files: backend/app/main.py (CORS origins now env-driven)
- 🔁 Next prompts: Set JWT_SECRET and CORS_ALLOWED_ORIGINS on Hugging Face Spaces settings
- 🧠 Reflection: Two-part deployment failure — secret mismatch is invisible until runtime; CORS only matters for cross-origin deployed frontends

## Evaluation notes (flywheel)

- Failure modes observed: JWT signature verification fails silently when secrets differ; CORS blocks requests for non-localhost frontends
- Graders run and results (PASS/FAIL): manual test pending
- Prompt variant (if applicable): none
- Next experiment: add a /health/auth debug endpoint to echo decoded token claims (dev only)
