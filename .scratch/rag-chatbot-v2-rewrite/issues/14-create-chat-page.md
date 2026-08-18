# 14 — Create Chat Page with assistant-ui Thread (Task 4.2)

Status: resolved
Type: task
Milestone: 4 — Frontend — Chat

## Task

Create the full-page chat route wired to the RAG chat API via assistant-ui's `useChatRuntime` and `Thread`.

## Files

- Create: `src/components/chat/chat-page.tsx` — `useChatRuntime({ api: "/api/chat", body: { chatId }, initialMessages })`; syncs `activeThreadId` into the Zustand store; renders `<Thread />`
- Create: `src/app/(dashboard)/chat/[id]/page.tsx` — async route passing `id` + `initialMessage` from search params

## Acceptance

- `/chat/[id]` renders a working Thread; sources/citations render; store tracks the active thread.

## Comments

- Complete. Commit `63f207b` (with `a5c7377`); review clean.
