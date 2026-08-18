# 06 — Create Auth UI (Task 2.3)

Status: resolved
Type: task
Milestone: 2 — Database & Auth

## Task

Create the login/register pages and the client-side auth guard.

## Files

- Create: `src/components/auth/login-form.tsx` (email/password form, `signIn.email`)
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx` (name + email + password, `signUp.email`)
- Create: `src/components/auth/auth-guard.tsx` (redirects to `/login` when unauthenticated; spinner while pending)

## Acceptance

- Sign-in / sign-up flows redirect to the dashboard; unauthenticated dashboard access redirects to `/login`.

## Comments

- Complete. Commit `52efc23`; review clean.
