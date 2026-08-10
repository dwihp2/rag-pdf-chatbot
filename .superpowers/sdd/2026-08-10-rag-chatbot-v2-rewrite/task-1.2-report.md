# Task 1.2 Report: Install new dependencies

**Status:** ✅ Complete
**Date:** 2026-08-10

## Packages installed

| Package | Version |
|---|---|
| @ai-sdk/deepseek | 3.0.26 |
| better-auth | 1.6.26 |
| @assistant-ui/react | 0.15.13 |
| @assistant-ui/react-ai-sdk | 1.4.5 |
| zustand | 5.0.14 |

Installed transitively by shadcn add: `@assistant-ui/react-markdown@0.14.10`, `radix-ui`, `tw-shimmer`.

## Installation errors / warnings

- Initial `npm install` failed with ERESOLVE: old `ai@4.3.16` / `@ai-sdk/openai@1.3.24` pin `zod@3.25.46`, while `@ai-sdk/deepseek@3.x` (AI SDK v5) requires `zod@^3.25.76 || ^4.1.8`. This conflict is transient — later tasks upgrade `ai` to v5.
- Worked around with `--legacy-peer-deps`; then set `legacy-peer-deps=true` in project `.npmrc` so the shadcn CLI's internal `npm install` inherits it.
- `npm audit` reports 20 vulnerabilities (5 low, 5 moderate, 8 high, 2 critical) — pre-existing, not addressed per task scope.

## shadcn add command

**Succeeded** (after `.npmrc` fix). Created 10 files in `src/components/assistant-ui/`:
`thread.tsx`, `thread-list.tsx`, `assistant-modal.tsx`, `attachment.tsx`, `markdown-text.tsx`, `reasoning.tsx`, `tool-fallback.tsx`, `tool-group.tsx`, `tooltip-icon-button.tsx`, `follow-up-suggestions.tsx`. Also updated `src/app/globals.css` and 7 existing ui files.

Note: shadcn printed a reminder to wrap the root layout in `TooltipProvider` — not applied here; belongs to the UI rewrite tasks.

## Verification

`npm ls @ai-sdk/deepseek better-auth zustand @assistant-ui/react` — all listed with versions (see above).
