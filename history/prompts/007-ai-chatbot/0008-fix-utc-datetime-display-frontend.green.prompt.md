---
id: "0008"
title: Fix UTC Datetime Display Frontend
stage: green
date: 2026-02-18
surface: agent
model: claude-sonnet-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: fix wrong time display (UTC shown as local)
labels: ["bug-fix","datetime","timezone","utc","frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/hooks/useTodos.ts
tests:
  - manual: create task at 2:02 PM PKT — should display 2:02 PM not 9:02 AM
---

## Prompt

ye dekho task add kia hai or wo ye time dal raha hai jab kai abhe 2:02 ho rahy han
Created: 2/18/2026 at 09:01 AM

## Response snapshot

Root cause (deeper than previous fix): Python `datetime.utcnow()` stores naive UTC. PostgreSQL column is `TIMESTAMP WITHOUT TIME ZONE`. Even with `datetime.now(timezone.utc)`, after `session.refresh()` the DB driver (psycopg2) strips tzinfo and returns a naive datetime again. FastAPI serializes naive datetimes as `"2026-02-18T09:01:00"` (no `Z`).

JavaScript's `new Date("2026-02-18T09:01:00")` in Chrome treats naive ISO strings as **local time** — so 09:01 UTC gets displayed as 09:01 AM local (PKT), 5 hours early.

Fix: added `parseUTC()` helper in `useTodos.ts` that appends `'Z'` to naive strings before passing to `new Date()`. `new Date("2026-02-18T09:01:00Z")` is treated as UTC → `toLocaleTimeString()` converts to 2:01 PM PKT correctly.

Applied to all 4 datetime parse sites: loadTodos, createTask, updateTask, toggleTaskCompletion.

## Outcome

- ✅ Impact: All task timestamps now display in the user's correct local timezone
- 🧪 Tests: Manual — create task, verify displayed time matches system clock
- 📁 Files: frontend/lib/hooks/useTodos.ts
- 🔁 Next prompts: For a permanent backend fix, change column to TIMESTAMPTZ (requires migration)
- 🧠 Reflection: psycopg2 always returns naive datetimes for TIMESTAMP WITHOUT TIME ZONE columns even if you store timezone-aware values. Frontend parseUTC() is the safe, migration-free fix.

## Evaluation notes (flywheel)

- Failure modes observed: DB driver stripping tzinfo on read; JS treating naive ISO strings as local time
- Graders run and results (PASS/FAIL): manual only
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): change column to TIMESTAMPTZ + migration for a clean backend fix
