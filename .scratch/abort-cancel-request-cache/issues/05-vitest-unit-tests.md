# 05 — Add vitest + unit tests for the request cache module

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

Add vitest as a devDependency plus a `test` script, and unit-test the request cache module (the single seam — it concentrates all real logic).

- Mock the fetch boundary; assert observable outcomes only:
  - concurrent reads → how many network calls occurred (one)
  - cached read within TTL → avoids the network
  - `invalidate` → forces a refetch
  - aborted signal → cancels the underlying request
  - failures → never cached
- Per-component abort wiring is verified by build/lint/manual navigation, **not** a component test harness.

## Files

- Modify: `package.json` (vitest devDependency, `test` script)
- Create: config + `src/lib/request-cache.test.ts` (or `__tests__/`)

## Acceptance

- `npm test` passes; tests cover de-duplication, TTL, invalidation, signal forwarding/abort, and error handling.

## Comments

- Prior art: none — no test runner/files/script today. Next test case (planned, not this one): Playwright E2E for abort-on-navigation; `.gitignore` already reserves `.playwright-mcp/`.
