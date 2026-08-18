# 02 — Install New Dependencies (Task 1.2)

Status: resolved
Type: task
Milestone: 1 — Project Cleanup & Foundation

## Task

Install the new core packages and assistant-ui shadcn components.

## Files

- Modify: `package.json`
- Install: `@ai-sdk/deepseek`, `better-auth`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `zustand`
- Add: `@assistant-ui/thread`, `@assistant-ui/thread-list`, `@assistant-ui/assistant-modal` shadcn components

## Acceptance

- `npm ls @ai-sdk/deepseek better-auth zustand @assistant-ui/react` lists all with version numbers.

## Comments

- Complete. Commit `bd8d2f8`; review clean.
- Minor (deferred): `.npmrc` `legacy-peer-deps=true` — remove when upgrading `ai` to v5.
