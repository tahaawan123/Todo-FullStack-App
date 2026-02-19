---
id: "0007"
title: Fix Wrong Timestamp on Task Create
stage: green
date: 2026-02-18
surface: agent
model: claude-sonnet-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: fix wrong time on task creation
labels: ["bug-fix","datetime","timezone","utc","backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/models/todo_model.py
  - backend/app/routers/todo_router.py
tests:
  - manual: create a task and verify displayed time matches local clock
  - manual: edit/toggle a task and verify updated_at changes
---

## Prompt

time glt save ho raha hai task add krty hoy

## Response snapshot

Two bugs identified and fixed:

**Bug 1 — Naive UTC datetime (todo_model.py)**
`datetime.utcnow()` returns a naive datetime with no timezone info. FastAPI/Pydantic serializes it as `"2026-02-18T05:30:00"` (no `Z` or `+00:00`). JavaScript's `new Date()` parses naive strings as **local time** in many browsers, causing the displayed time to be off by the user's UTC offset.

Fix: changed to `datetime.now(timezone.utc)` — produces timezone-aware UTC datetimes, serialized as `"2026-02-18T05:30:00+00:00"`. JavaScript correctly interprets this as UTC and converts to local time.

**Bug 2 — `updated_at` never updated (todo_router.py)**
PUT and PATCH handlers set field values but never updated `updated_at`, so it always showed the original creation time.

Fix: added `db_todo.updated_at = datetime.now(timezone.utc)` in both PUT and PATCH handlers before commit.

## Outcome

- ✅ Impact: Task creation time now displays correct local time; updated_at reflects actual last-modified time
- 🧪 Tests: Manual — create task, compare displayed time with system clock
- 📁 Files: backend/app/models/todo_model.py, backend/app/routers/todo_router.py
- 🔁 Next prompts: none
- 🧠 Reflection: Always use timezone-aware datetimes (datetime.now(timezone.utc)) in Python backends — datetime.utcnow() is deprecated in Python 3.12+ and causes JS parsing bugs.

## Evaluation notes (flywheel)

- Failure modes observed: naive UTC datetimes parsed as local time by JS browsers; updated_at not refreshed on mutations
- Graders run and results (PASS/FAIL): manual only
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none needed
