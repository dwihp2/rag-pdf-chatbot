# 22 — Build & Verify (Task 6.3)

Status: resolved
Type: task
Milestone: 6 — Verification & Polish

## Task

Final verification pass: prisma generate, build, and manual QA of auth, upload, chat-with-citations, floating chat, and collections.

## Files

- All created/modified files

## Acceptance

- `npm run build` succeeds with no TS errors / missing imports; `npm run lint` passes.
- Manual QA: landing → register → dashboard; upload PDF → "completed" + chunk count; chat streams with `[1]`/`[2]` citations; floating chat shows/continues threads; collections create + detail render.

## Comments

- Complete. Build green; verified manually. Later hardening (auth redirect on expired token, chat-history load, scope indicator) landed in follow-up commits `5786a59`, `4d256a6`.
