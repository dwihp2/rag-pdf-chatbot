# 05 — Set Up Better Auth Server (Task 2.2)

Status: resolved
Type: task
Milestone: 2 — Database & Auth

## Task

Set up the Better Auth backend: Prisma client singleton, server config with email/password, client for client components, and the Next.js API handler.

## Files

- Create: `src/lib/db.ts` (Prisma singleton)
- Create: `src/lib/auth-server.ts` (`betterAuth` with `prismaAdapter`, `emailAndPassword` enabled, 30-day sessions)
- Create: `src/lib/auth.ts` (`createAuthClient` → `signIn`, `signUp`, `signOut`, `useSession`)
- Create: `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`)

## Acceptance

- `POST /api/auth/sign-up-email` returns 200 with user + session token.

## Comments

- Complete. Commit `fabbb4e`; review clean.
- Minor (deferred): `BETTER_AUTH_SECRET` is a placeholder — rotate before deploy; test user `test@test.com` exists in dev DB.
