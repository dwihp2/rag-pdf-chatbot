# 01 — Delete Dead Code (Task 1.1)

Status: resolved
Type: task
Milestone: 1 — Project Cleanup & Foundation

## Task

Delete all dead code from the v1 codebase: old page variants, legacy chat/dashboard components, Qdrant + Neon libs, test scripts, and stale API routes. Remove now-unused dependencies and clean up `globals.css`.

## Files

- Delete: all files in the plan's "Files to delete" list — `page-old.tsx`, `page-new.tsx`, `chat-interface.tsx`, `chat-layout.tsx`, `chat-sidebar.tsx`, `chatgpt-*`, `document-manager.tsx`, `enhanced-*`, `modern-*`, `pdf-upload.tsx`, `source-display-controller.tsx`, `lib/qdrant.ts`, `lib/citation-parser.ts`, `lib/neon-*`, `lib/database.ts`, old API routes (`api/qdrant`, `api/vectors`, `api/test-db`), root test scripts, `scripts/`
- Modify: `globals.css` (remove styles referencing deleted components)
- Modify: `package.json` (uninstall `@qdrant/js-client-rest`, `pdf-parse`, `langchain`, `@langchain/community`, `@ai-sdk/anthropic`, unused radix packages, `streamdown`, `date-fns`, `embla-carousel-react`, `use-stick-to-bottom`, etc.)

## Acceptance

- Clean workspace with only kept files remaining.
- `npm run build` fails only on not-yet-rewritten files (chat route, pages) — never on deleted files.

## Comments

- Complete. Commits `7465163..5b13ddb`; review clean after 1 fix round (carousel/ai-elements/kibo-ui deletion + package reporting).
