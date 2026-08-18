# 07 — Create Dashboard Layout with Auth Guard and Zustand (Task 2.4)

Status: resolved
Type: task
Milestone: 2 — Database & Auth

## Task

Create the authenticated dashboard layout (sidebar + auth guard) and the Zustand cross-surface chat store.

## Files

- Create: `src/store/chat-store.ts` — `{ activeThreadId, isFloatingOpen }` + setters (`setActiveThreadId`, `toggleFloating`, `openFloating`, `closeFloating`)
- Create: `src/hooks/use-chat-store.ts` (re-export wrapper)
- Create: `src/components/layout/app-sidebar.tsx` (nav: Chat / Documents / Collections, New Chat, Sign Out)
- Create: `src/app/(dashboard)/layout.tsx` (wraps children in `AuthGuard` + sidebar)

## Acceptance

- Dashboard renders only when authenticated; sidebar navigates between surfaces; store updates propagate.

## Comments

- Complete. Commit `46e9192`; review clean.
