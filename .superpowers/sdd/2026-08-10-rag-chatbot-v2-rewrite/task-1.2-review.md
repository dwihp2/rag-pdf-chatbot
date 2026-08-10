# Task 1.2 Review: Install new dependencies

**Verdict:** APPROVED
**Date:** 2026-08-10
**Findings:** 3 (0 critical, 2 low, 1 informational)

## 1. Spec — required packages

Verified via `npm ls` against live install:

| Package | Required | Installed |
|---|---|---|
| @ai-sdk/deepseek | ✓ | 3.0.26 |
| better-auth | ✓ | 1.6.26 |
| @assistant-ui/react | ✓ | 0.15.13 |
| @assistant-ui/react-ai-sdk | ✓ | 1.4.5 |
| zustand | ✓ | 5.0.14 |

All present in [package.json](package.json). Pass.

## 2. Quality — `.npmrc` legacy-peer-deps

[.npmrc](.npmrc) is one line: `legacy-peer-deps=true`. Acceptable as transient scaffolding — the zod conflict is real (`ai@4.3.16`/`@ai-sdk/openai@1.3.24` pin zod v3; `@ai-sdk/deepseek@3.x` wants `^3.25.76 || ^4.1.8`) and resolves when `ai` is upgraded to v5 in a later task. Without it, the shadcn CLI's internal `npm install` fails, so it was necessary to complete Step 2.

- **Finding 1 (low):** `npm ls zod` shows `invalid` markers for zod@4.4.3 against v3-pinning packages. With `legacy-peer-deps`, npm installs anyway — this is expected and documented in the report, but any schema-validation code written before the `ai` v5 upgrade runs against the wrong-major zod. Transient by design; no action.
- **Finding 2 (low):** `.npmrc` must be deleted (or the flag reverted) when `ai` is upgraded to v5, or the project permanently loses peer-dependency conflict detection — future real conflicts will be silently masked. Recommend adding a checkbox to the `ai` upgrade task: "remove `legacy-peer-deps=true` from .npmrc".

## 3. Scope — shadcn add output

All 10 expected files exist in [src/components/assistant-ui/](src/components/assistant-ui/) and match assistant-ui registry output (uses `AuiIf`, new aui-* class naming, registry pinned in [components.json](components.json) via `registries."@assistant-ui"`). Transitive deps (`@assistant-ui/react-markdown`, `radix-ui`, `tw-shimmer`) correctly added to dependencies. `globals.css` changes (tw-shimmer import, data-open/data-closed variants, collapsible keyframes) are registry-emitted, in scope.

- **Finding 3 (informational):** Registry's `TooltipProvider` reminder intentionally deferred to the UI rewrite tasks per report — correct scoping. Generated components reference it only via `Tooltip` primitives, which work once a provider lands; no breakage now.

## Critical issues

None.

## Notes

- Pre-existing `npm audit` vulnerabilities (20) noted in report — out of scope, correctly not addressed.
- Diff includes 7 touched ui files; spot-checked, all registry-driven reformatting/updates. No manual edits detected.
