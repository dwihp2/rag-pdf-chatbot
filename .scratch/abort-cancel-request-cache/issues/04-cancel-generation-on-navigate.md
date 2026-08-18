# 04 — Cancel assistant generation on navigation

Status: ready-for-agent
Type: task
Blocked by: 01, 02

## Task

Leaving mid-stream aborts the stream and discards the generation. A Conversation created by an aborted first Message contains only the user's Message with no assistant reply — accepted product behaviour.

- Keep the existing "create Chat → wait for the full stream → redirect" flow in `chat-home`, but abort the stream read if the user navigates away. Immediate navigation (navigate-then-stream) is explicitly out of scope.
- Do not modify the assistant-ui streaming transport's own abort handling.

## Files

- Modify: `src/components/chat/chat-home.tsx` (first-Message flow abort)
- Modify: generation surfaces in the chat page / floating chat (stream abort on unmount)

## Acceptance

- Leaving while generating stops the stream (no further tokens/server work); returning to an aborted first Message shows the unanswered question; no stale assistant reply renders after navigation.

## Comments

- Depends on ticket 01 (abortable reads) and ticket 02 (abort wiring pattern).
