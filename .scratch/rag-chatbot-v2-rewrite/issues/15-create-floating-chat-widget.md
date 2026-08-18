# 15 — Create Floating Chat Widget (Task 4.3)

Status: resolved
Type: task
Milestone: 4 — Frontend — Chat

## Task

Create the Help Scout-style floating chat widget (`AssistantModal`) with a shared thread list, wired to the Zustand store.

## Files

- Create: `src/components/chat/thread-list.tsx` — fetches `/api/chats`, renders summaries with delete; highlights `activeThreadId`
- Create: `src/components/chat/floating-chat.tsx` — floating trigger button + `AssistantModal` with `useChatRuntime`; open/close driven by `isFloatingOpen`
- Modify: `src/app/(dashboard)/layout.tsx` — mount `<FloatingChat />`

## Acceptance

- Floating button opens the modal; thread list shows conversations; selecting continues a chat; minimize → reopen shows thread list.

## Comments

- Complete. Commits `bf9dec9`, `63f207b`; review clean.
