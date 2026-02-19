---
id: "0008"
title: Switch JWT to HS256 Shared Secret
stage: green
date: 2026-02-17
surface: agent
model: claude-opus-4-6
feature: 005-auth-system
branch: 007-ai-chatbot
user: tahaawan123
command: direct prompt
labels: ["jwt", "hs256", "auth", "shared-secret"]
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
  - frontend/lib/auth.ts
tests:
  - "Valid HS256 token decodes successfully"
  - "Expired token raises ExpiredSignatureError (401)"
  - "Tampered token (wrong secret) raises InvalidSignatureError (401)"
  - "Tampered token (modified payload) raises InvalidSignatureError (401)"
---

## Prompt

Switch backend from JWKS verification to shared JWT secret approach. Add JWT_SECRET to backend .env with exact same value as frontend's BETTER_AUTH_SECRET. Update jwt_handler.py to decode tokens using jwt.decode(token, JWT_SECRET, algorithms=["HS256"]). Remove BETTER_AUTH_URL dependency from backend. Set token expiry: access token expires in 60 minutes, if expired return 401 Token expired. Also configure Better Auth on frontend to issue JWTs with expiry claim (exp). Make sure every protected endpoint (tasks + chat) uses updated JWT verification. Test: valid token works, expired token returns 401, tampered token returns 401.

## Response snapshot

Switched JWT verification from asymmetric EdDSA/JWKS to symmetric HS256 shared secret:
- **Backend jwt_handler.py**: Replaced `PyJWKClient`/JWKS with `jwt.decode(token, JWT_SECRET, algorithms=["HS256"])`, removed `BETTER_AUTH_URL` dependency
- **Backend dependencies.py**: Added specific `jwt.ExpiredSignatureError` handling → 401 "Token expired", `jwt.InvalidTokenError` → 401 "Could not validate credentials"
- **Backend .env**: Added `JWT_SECRET` matching frontend `BETTER_AUTH_SECRET`, removed `BETTER_AUTH_URL`
- **Frontend auth.ts**: Added custom `sign` function using jose `SignJWT` with HS256 and `BETTER_AUTH_SECRET`
- All 8 protected endpoints (6 task + 2 chat) already use `get_current_user` dependency — no router changes needed
- All 4 test scenarios pass: valid token, expired token, wrong-secret token, modified-payload token

## Outcome

- ✅ Impact: Backend fully decoupled from frontend URL; simpler shared-secret JWT verification
- 🧪 Tests: 4/4 scenarios pass (valid, expired, tampered-secret, tampered-payload)
- 📁 Files: 5 files modified
- 🔁 Next prompts: End-to-end integration test with running frontend+backend
- 🧠 Reflection: Better Auth's core crypto/jwt.mjs already uses HS256 with signJWT(); the JWT plugin defaults to EdDSA via JWKS but supports custom sign functions

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual inline verification PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
