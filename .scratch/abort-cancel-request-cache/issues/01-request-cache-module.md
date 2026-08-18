# 01 — Build the request cache module

Status: ready-for-agent
Type: task

## Task

Create a client-side request-cache module that de-duplicates identical concurrent reads and caches successful GET results.

- Keyed by URL (and method); concurrent identical reads share one in-flight promise, so they cost a single network call (neutralises double-mounted Thread list + dev StrictMode double-effects).
- Successful GET results cached for a short TTL (30 s) as a stale-data backstop.
- Exposes `invalidate(urlOrPrefix)` so mutations force a fresh read.
- Routes through the existing global fetch wrapper — session / 401 handling unaffected.
- Reads accept an external abort signal; when triggered, cancels the underlying request and marks it **cancelled** (never a failure; never cached).
- **Cache scope:** Thread list, Document list, Collection list, single Collection detail. Chat history is deliberately **not** cached (abortable, always fetched fresh).

## Files

- Create: `src/lib/request-cache.ts` (module-level; no paths required by spec)

## Acceptance

- Concurrent identical reads → one network call; cached read within TTL → no network; `invalidate` → forces refetch; aborted signal cancels the underlying request; failures are never cached; cancelled reads are distinguishable from real failures.

## Comments

- Prerequisite for tickets 02–05. Interface details in `spec.md` → "Interfaces".
