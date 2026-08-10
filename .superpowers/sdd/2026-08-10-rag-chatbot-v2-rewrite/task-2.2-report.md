# Task 2.2 Report: Set up Better Auth server

**Status:** ✅ Complete
**Commit:** `fabbb4e`
**Summary:** Better Auth wired in — Prisma singleton, server config (email/password, 30-day DB sessions, 24h refresh), React client, and catch-all API route; sign-up endpoint verified with curl (200, user + session token + cookie).

## Files created

- `src/lib/db.ts` — Prisma client singleton (global-cached in dev)
- `src/lib/auth-server.ts` — `betterAuth` with `prismaAdapter` (postgresql), `emailAndPassword.enabled`, session `expiresIn: 30d`, `updateAge: 24h`
- `src/lib/auth.ts` — `createAuthClient` (better-auth/react), exports `signIn`, `signUp`, `signOut`, `useSession`
- `src/app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)` → `GET`, `POST`

## Verification

- `npx prisma generate` — OK
- No TS/lint errors in any new file
- Dev server started; curl test:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","name":"Test"}'
```

→ `HTTP/1.1 200 OK`, JSON `{token, user{...}}`, `set-cookie: better-auth.session_token=...; Max-Age=2592000; HttpOnly` (Max-Age 2592000 = 30 days, matches config). User row persisted in Postgres via Prisma adapter.

Note: plan's curl path `sign-up-email` 404s on better-auth 1.6.x; correct path is `/api/auth/sign-up/email` (used above).

## Env

`BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` already present in `.env.local` — no placeholder needed.

## Concerns

- **Weak secret:** server logs warn `BETTER_AUTH_SECRET` is <32 chars / low-entropy. Fine for dev; regenerate with `openssl rand -base64 32` before production.
- **Test user left in DB:** `test@test.com` created during verification; harmless in fresh dev DB, delete if unwanted.
- `emailVerified` defaults false and no email verification flow is configured — acceptable for Phase 1 per plan (no verification requirement stated).
