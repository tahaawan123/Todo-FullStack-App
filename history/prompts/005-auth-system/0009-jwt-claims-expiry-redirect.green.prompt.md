---
id: "0009"
title: JWT Claims Validation and Expiry Redirect
stage: green
date: 2026-02-17
surface: agent
model: claude-opus-4-6
feature: 005-auth-system
branch: 007-ai-chatbot
user: tahaawan123
command: direct prompt
labels: ["jwt", "claims", "expiry", "redirect", "auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/auth/jwt_handler.py
  - backend/app/auth/dependencies.py
  - backend/.env
  - backend/.env.example
  - frontend/lib/api.ts
tests:
  - "Valid token with sub, email, iat, exp decodes successfully"
  - "Token missing iat claim raises MissingRequiredClaimError"
  - "Token missing email passes jwt_handler but rejected by dependencies"
  - "Expired token raises ExpiredSignatureError (401 Token expired)"
  - "Tampered token raises InvalidSignatureError (401)"
---

## Prompt

Ensure JWT tokens have proper user_id, email, iat (issued at), and exp (expiry) claims. Add ACCESS_TOKEN_EXPIRE_MINUTES=60 to backend .env and read it in jwt_handler.py. Frontend: if backend returns 401 "Token expired", redirect user to signin page. That's it — no refresh tokens, no blacklist.

## Response snapshot

Added proper JWT claim enforcement and token-expired redirect:
- **jwt_handler.py**: Added `ACCESS_TOKEN_EXPIRE_MINUTES` config (read from env, default 60), added `iat` to required claims (`["exp", "iat", "sub"]`)
- **dependencies.py**: Now requires both `sub` and `email` in payload (rejects if either missing)
- **backend .env/.env.example**: Added `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- **frontend api.ts**: On 401, parses response body; if `detail === "Token expired"`, calls `signOut()` to clear session before redirecting to `/signin`
- All 5 test scenarios pass

## Outcome

- ✅ Impact: Stricter JWT claim validation; clean signout on token expiry
- 🧪 Tests: 5/5 scenarios pass (valid, missing-iat, missing-email, expired, tampered)
- 📁 Files: 5 files modified
- 🔁 Next prompts: None specified
- 🧠 Reflection: Layered validation — jwt_handler enforces structural claims (sub, iat, exp), dependencies enforces business claims (email required)

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual inline verification PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
