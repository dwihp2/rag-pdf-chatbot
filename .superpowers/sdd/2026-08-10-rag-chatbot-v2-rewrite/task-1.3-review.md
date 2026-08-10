# Task 1.3 Review: Configure TypeScript types

**Verdict: APPROVE** — 0 critical, 2 minor

## 1. Spec match

[src/types/index.ts](../../../src/types/index.ts) is byte-identical to the plan
([plan](2026-08-10-rag-chatbot-v2-rewrite.md), Task 1.3 Step 1): `AppSource`, `MyUIMessage`
(`UIMessage<never, { sources, notification }>`), `CreateChatInput`, `CreateDocumentInput`,
`CreateCollectionInput`. All five "Produces" satisfied. Consumers confirmed downstream:
`AppSource` in `retrieval.ts` (plan line 1184) and `chat/route.ts` (line 1243),
`MyUIMessage` in `createUIMessageStream<MyUIMessage>` (line 1300).

## 2. `ai` 4→7 bump

Appropriate — required, not optional. `UIMessage` is non-generic in `ai@4`; plan's
`UIMessage<never, {...}>` fails with `TS2315`. Verified locally:

- `npm ls ai` → single `ai@7.0.58`, deduped (nested copy under `@assistant-ui/react-ai-sdk` removed).
- `npx tsc --noEmit` → 0 errors referencing `types/index`.
- Node v22.14.0 satisfies `ai@7`'s `node >= 22` engine.

The bump actually *reduces* the tree (drops `jsondiffpatch`, `@opentelemetry/api`,
`diff-match-patch`). Report flags the v5+ API shift for Milestone 3+ backend tasks —
correct and worth keeping in mind (e.g. `convertToModelMessages` in the chat route).

### Minor findings

1. **Engine floor is now Node ≥ 22.** [vercel.json](../../../vercel.json)/deployment docs
   don't pin a Node version; if the deploy target is Node 18/20 this will break at runtime.
   Non-blocking for this task; flag for deployment config.
2. **Report cites Task 1.1 Step 8 as justification for pre-existing tsc errors, but the
   quoted text is Task 1.2 Step 8's spirit** — cosmetic, claim itself verified true.

## 3. Scope gaps

None. Task interface scan (all "Consumes/Produces" lines) shows no later task imports a
type from `@/types` beyond the five defined here. Other tasks produce their own interfaces
(`vectorService`, `retrieveContext`, `auth`) inline. Nothing missing.

## Summary

| Check | Result |
|---|---|
| File matches plan exactly | ✅ |
| `ai` bump justified & verified | ✅ (minor: Node ≥ 22 floor) |
| Missing types for later tasks | ✅ none |

**Findings: 2 minor, 0 critical.**
