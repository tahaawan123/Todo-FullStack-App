---
id: "0006"
title: Fix Signout 401 Token Error
stage: green
date: 2026-02-18
surface: agent
model: claude-sonnet-4-6
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: fix signout 401 error
labels: ["bug-fix","auth","signout","jwt","navigation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/layout/Header.tsx
tests:
  - manual: sign out from dashboard — no 401 in terminal
---

## Prompt

mene abhe frontend and backend dono ko locally chalaya sahi chal raha hai but but signout karty hoi koi error ata hai ussy achy sy resolve karo and than terminal mai ye error aata hai signout karty waqt GET /api/auth/token 401 in 258ms (compile: 177ms, render: 80ms)

## Response snapshot

Root cause identified: `router.push('/signin')` (soft navigation) was used after `authClient.signOut()`. During soft navigation the page stays mounted, so the `jwtClient` plugin detects the session-cleared state change and auto-fires `GET /api/auth/token` to refresh the token — but the session cookie is already gone, causing the 401.

Fix: changed `handleSignOut` in `Header.tsx` to use `window.location.href = '/signin'` (hard navigation). The page unloads immediately, preventing any React re-renders or `jwtClient` token-refresh hooks from firing after signout.

Also removed the now-unused `useRouter` import and `router` variable.

## Outcome

- ✅ Impact: Eliminated spurious 401 on signout; hard navigation matches the same pattern already used in SignInForm.tsx after sign-in
- 🧪 Tests: Manual — sign out should redirect to /signin with no 401 in terminal
- 📁 Files: frontend/components/layout/Header.tsx
- 🔁 Next prompts: none
- 🧠 Reflection: Soft vs hard navigation is a recurring pattern in Better Auth + jwtClient. Always use window.location.href when navigating after auth state changes (signout, token expiry) to prevent stale hook firing.

## Evaluation notes (flywheel)

- Failure modes observed: jwtClient auto-refresh hook fires after signout during soft navigation window
- Graders run and results (PASS/FAIL): manual only
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none needed
