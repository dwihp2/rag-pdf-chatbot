# 18 — Update Root Layout (Task 5.1)

Status: resolved
Type: task
Milestone: 5 — Root Layout & Landing Page

## Task

Simplify the root layout: no auth wrapping (handled by route groups), theme provider, Tailwind globals.

## Files

- Modify: `src/app/layout.tsx` — metadata ("RAG Chat — Document Intelligence"), `ThemeProvider` (next-themes), `globals.css`

## Acceptance

- Root layout renders all route groups; auth is scoped to `(dashboard)` via its own layout.

## Comments

- Complete; shipped with the milestone-5/6 batch. Review clean.
