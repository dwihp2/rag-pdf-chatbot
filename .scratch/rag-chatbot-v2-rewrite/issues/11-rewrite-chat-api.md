# 11 — Rewrite Chat API with AI SDK v7 Source Streaming (Task 3.4)

Status: resolved
Type: task
Milestone: 3 — Backend APIs

## Task

Rewrite `POST /api/chat` using AI SDK v7 `createUIMessageStream`/`createUIMessageStreamResponse`. Authenticate, get-or-create chat, save the user message, retrieve context, stream sources as data parts, enforce `[N]` citations via system prompt, and persist the assistant message with sources.

## Files

- Create: `src/app/api/chat/route.ts`
  - Session check via `auth.api.getSession`
  - Get-or-create chat from `chatId` / message title
  - `retrieveContext(latestMessage)` → context + sources
  - Stream `type: "data-sources"` part (and a "no relevant docs" notification) before model text
  - `streamText` with DeepSeek model + citation-enforcing system prompt
  - `onEnd`: persist assistant message with sources; auto-title "New Chat"
  - Respond via `createUIMessageStreamResponse` with `X-Chat-Id` header

## Acceptance

- Chat streams sources as first-class data parts; citations `[N]` enforced; messages persisted.

## Comments

- Complete. Commits `98978cf..6f5c6d9`; review clean after 2 fix rounds.
- Fix round 1: add chatId ownership check (IDOR), correct DeepSeek model ID.
- Fix round 2: model ID → `deepseek-chat`; fix garbled notification string.
