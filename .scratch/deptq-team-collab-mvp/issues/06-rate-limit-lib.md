# 06 — Add `rate-limit` lib + wire into chat and upload (Task 6)

Status: ready-for-agent
Type: task

## Task

Add `src/lib/rate-limit.ts` — in-memory fixed-window `Map<string, { count, resetAt }>` keyed by `userId:route`; `checkRateLimit(userId, key, { max, windowMs })` with window cleanup. Wire it into:

- `POST /api/chat` — `checkRateLimit(userId, "chat", { max: 30, windowMs: 60_000 })` after auth.
- `POST /api/upload` — `checkRateLimit(userId, "upload", { max: 10, windowMs: 3_600_000 })`.

## Files

- Create: `src/lib/rate-limit.ts`
- Modify: `src/app/api/chat/route.ts` (POST)
- Modify: `src/app/api/upload/route.ts` (POST)

## Acceptance

- 31st chat request within a minute → 429; 11th upload within an hour → 429. No new dependencies; single-instance caveat accepted.

## Comments

- Independent of tickets 01–05.
