# Spec: Abort In-Flight Requests & De-duplicate Reads on Navigation

> **Status:** Ready for implementation (planning only — no code written yet)
> **Scope:** Client-side only. Follows the grilling session on 2026-08-15 (all recommendations accepted).

## Problem Statement

As a user of the RAG chatbot, when I click between menus (Chat, Documents, Collections) while a request is still loading, in-flight API requests keep running in the background. They take 4–8 seconds to complete — especially loading a Chat's history — and they resolve into components that are no longer mounted. Meanwhile the same data is fetched over and over: Chat history, the Document list, and the Collection list each being requested 5–7 times in a single session. This wastes bandwidth and server work, risks stale/unmounted state updates, and makes navigation feel slower and heavier than it needs to be.

## Solution

From the user's perspective, navigation becomes responsive and cheap. Moving to another menu mid-load cancels in-flight requests immediately. Shared read data (my Chat history, Document list, Collection list) is fetched once and reused across surfaces, so switching menus stops re-downloading the same lists. If I leave while the assistant is still generating an answer, generation stops instead of continuing to consume resources.

## User Stories

1. As a user, I want to navigate to another menu while a Chat's history is still loading, so that the slow request is cancelled instead of continuing in the background.
2. As a user, I want the sidebar and the Floating Chat widget to show the same Chat history without firing duplicate network requests, so that opening the app costs one fetch, not two.
3. As a user, I want the Document list shared between the Documents page and a Collection's detail page to be fetched once, so that visiting both surfaces doesn't re-download the same data.
4. As a user, I want the Collection list to be reused when I navigate between the dashboard and the Collections page, so that switching menus is instant and cheap.
5. As a user, I want lists to be fresh after I create or delete a Chat, upload a Document, or create/delete a Collection, so that they always reflect my latest actions.
6. As a user, I want a cancelled request to never overwrite the UI after I've navigated away, so that stale data never pops into a screen I'm no longer looking at.
7. As a user, I want to be able to leave a Chat while the assistant is still streaming an answer, so that generation stops and stops consuming tokens/server work instead of continuing in the background.
8. As a user, I want opening a conversation from either the sidebar or the Floating Chat widget to stay consistent.
9. As a user, I want authentication enforcement (redirect on 401) to keep working after these changes, so that my session is still protected.
10. As a developer, I want the request cache to de-duplicate identical concurrent requests, so that accidental double-mounts (dev StrictMode, shared components) cost a single network call.
11. As a developer, I want cached reads to expire after a short interval, so that stale data cannot persist indefinitely if a mutation is missed.
12. As a developer, I want cancelled requests to be distinguishable from real failures, so that cancelled loads never surface as user-facing errors.

## Implementation Decisions

### Architecture

- **Per-component abort wiring.** Every read fetch moves to an abortable pattern: the effect creates an abort controller, passes its signal to the request, and aborts it in the effect's cleanup. Because route changes in this app unmount the outgoing page, navigating to another menu triggers cleanup and cancels the request automatically. One mechanism covers menu clicks, browser back/forward, and direct URL edits. Cancelled requests are recognised via the abort error and skipped — they never call `setState` on an unmounted component and never surface as errors.
- **A client-side request cache module** de-duplicates and reuses read data:
  - Keyed by URL (and method); concurrent identical reads share one in-flight promise, so they cost a single network call. This neutralises both the double-mounted Thread list and development StrictMode double-effects without code changes.
  - Successful GET results are cached for a short TTL (30 s) as a stale-data backstop.
  - An explicit invalidation API clears a URL or URL prefix so mutations force a fresh read.
  - It routes through the existing global fetch wrapper, so session / 401 handling is unaffected.
- **Cache scope:** the Thread list, the Document list, the Collection list, and a single Collection's detail are cached. Chat history is deliberately **not** cached — it is abortable but always fetched fresh, so a Conversation can never show stale Messages after a cancelled generation.
- **Mutation invalidation:** after create/delete of Chats, Documents, or Collections (including upload and Collection–Document operations), the affected cache keys are invalidated so the next read is fresh. Surfaces are **eventually consistent**: each list re-reads on mount, and the cache keeps that cheap. Live cross-surface synchronisation is out of scope.
- **Cancel-on-navigate for generation.** Leaving mid-stream aborts the stream and discards the generation. A Conversation created by an aborted first Message will contain only the user's Message, with no assistant reply — accepted product behaviour.
- **`chat-home` first Message:** the existing "create Chat → wait for the full stream → redirect" flow is kept, but the stream read is now aborted if the user navigates away. Immediate navigation is explicitly out of scope.

### Interfaces (module-level; no paths)

- Request cache module exposes: a read that de-dupes concurrent calls and caches successful results; an `invalidate(urlOrPrefix)` hook for mutations; and TTL configuration. Reads accept an external abort signal that, when triggered, cancels the underlying request and marks it cancelled (never a failure).
- Read components adopt the abortable effect pattern — using the cache for the list reads and a direct abortable fetch for Chat history.

## Testing Decisions

- **Seam (single):** unit tests against the request cache module. It concentrates the real logic — de-duplication, TTL, invalidation, signal forwarding/abort, error handling — in one place. The per-component abort wiring is thin declarative code verified by build, lint, and a manual navigation check rather than a component test harness.
- **Good test = external behaviour only:** tests mock the fetch boundary and assert observable outcomes — how many network calls occurred for concurrent reads, whether a cached read avoids the network, whether invalidation forces a refetch, whether an aborted signal cancels the underlying request, and whether failures are never cached.
- **Modules tested:** the request cache module only.
- **Prior art:** none — the repo currently has no test runner, no test files, and no `test` script. Neither vitest nor Playwright is installed today (both appear only as peer references in the lockfile), so vitest is added as a devDependency plus a `test` script to realise this seam.
- **Next test case (planned, not this one):** introduce Playwright for a browser-level E2E that verifies the abort-on-navigation behaviour — navigate mid-load and assert the request is cancelled and no stale render lands. The repo's `.gitignore` already reserves `.playwright-mcp/`, but no Playwright config or tests exist yet; a `@playwright/test` devDependency and config would be added when that case is taken on.

## Out of Scope

- Immediate navigation on the first Message (navigate-then-stream) — the current wait-for-stream flow is kept.
- Live cross-surface state synchronisation (shared list state) — eventual consistency is accepted.
- Adopting a data-fetching library (TanStack Query / SWR).
- Aborting Next.js router RSC payloads (`?_rsc=`) — not possible from application code.
- Modifying the assistant-ui streaming transport's own abort handling.
- Server-side request cancellation or coalescing (all of this is client-side).

## Further Notes

- Development StrictMode double-fires effects; the cache's de-duplication neutralises the resulting duplicate network calls without code changes.
- The Thread list component is mounted in two places (persistent sidebar and Floating Chat widget); the cache makes that safe and cheap, and no component restructuring is required.
- An aborted first Message leaves a Conversation with a user Message and no assistant reply — returning to it shows the unanswered question and the user re-asks.
