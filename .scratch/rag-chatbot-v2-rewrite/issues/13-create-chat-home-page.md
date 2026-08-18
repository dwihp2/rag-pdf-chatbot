# 13 — Create Chat Home Page (Task 4.1)

Status: resolved
Type: task
Milestone: 4 — Frontend — Chat

## Task

Create the ChatGPT-style landing page with suggestion prompts that create a chat and navigate to it.

## Files

- Create: `src/components/chat/chat-home.tsx` — suggestion cards + `PromptInput`; `handleSend` POSTs `/api/chats`, redirects to `/chat/{id}?initialMessage=...`
- Modify: `src/app/(dashboard)/page.tsx` → render `<ChatHome />`

## Acceptance

- Dashboard home shows suggestion prompts; sending navigates to the new chat with the message pre-loaded.

## Comments

- Complete. Commits `7d33e05..a22e2ff`; review clean after 1 fix round (restored public landing page instead of redirecting authenticated users).
