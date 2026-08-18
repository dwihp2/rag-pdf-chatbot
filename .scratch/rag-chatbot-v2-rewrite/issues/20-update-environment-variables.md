# 20 — Update Environment Variables (Task 6.1)

Status: resolved
Type: task
Milestone: 6 — Verification & Polish

## Task

Provide a documented `.env.example` and update `next.config.ts` for the new packages.

## Files

- Create: `.env.example` — `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`
- Modify: `.env.local` (real values)
- Modify: `next.config.ts` — `serverExternalPackages: ["pdf-parse"]`

## Acceptance

- Fresh clones can copy `.env.example` → `.env.local`; server-side `pdf-parse` works.

## Comments

- Complete; review clean. (Later commits switched embeddings to Gemini — see `afdec6b`.)
