# Task 1.1 Report: Delete Dead Code

**Status:** DONE
**Commit:** 746516368d908e4df0209a3d469cdaa01e9c1af2

## Files Deleted

### Page variants
- src/app/page-old.tsx
- src/app/page-new.tsx

### Old chat components
- src/components/chat-interface.tsx
- src/components/chat-layout.tsx
- src/components/chat-sidebar.tsx
- src/components/chatgpt-home.tsx
- src/components/chatgpt-sidebar.tsx
- src/components/chatgpt-sidebar-new.tsx
- src/components/modern-chat-interface.tsx
- src/components/modern-sidebar.tsx

### Old document/citation components
- src/components/document-manager.tsx
- src/components/enhanced-response.tsx
- src/components/enhanced-sources.tsx
- src/components/pdf-upload.tsx
- src/components/source-display-controller.tsx
- src/lib/citation-parser.ts

### Qdrant / Neon / database
- src/lib/qdrant.ts
- src/lib/neon-config.ts
- src/lib/neon-utils.ts
- src/lib/database.ts
- src/app/api/qdrant/route.ts (dir removed)
- src/app/api/vectors/route.ts (dir removed)
- src/app/api/test-db/route.ts (dir removed)

### Test scripts
- test-chat-api.js
- test-db-connection.js
- test-kibo-ui.js
- test-ui.js
- scripts/ (test-db.js, test-messages.js, test-pgvector.js)

### Pages to be rewritten
- src/app/api/documents/ (whole dir)
- src/app/chats/ (whole dir)
- src/app/documents/ (whole dir)

## Packages Uninstalled (14)

@qdrant/js-client-rest, pdf-parse, langchain, @langchain/community,
@ai-sdk/anthropic, @radix-ui/react-collapsible, @radix-ui/react-hover-card,
@radix-ui/react-progress, @radix-ui/react-tabs, streamdown,
@icons-pack/react-simple-icons, date-fns, embla-carousel-react,
use-stick-to-bottom

## globals.css

Removed custom `.prose` utilities, `.message-enter` animation, and mobile
media-query overrides. Kept Tailwind directives, tw-animate-css, theme
tokens, light/dark CSS vars, and base shadcn/ui layer.

## Build Output Summary

`npm run build` fails to compile — as expected, all errors are
"Module not found" from files not yet rewritten:

```
Failed to compile.
Module not found: Can't resolve '@/components/chat-layout'   (src/app/page.tsx)
Module not found: Can't resolve '@/components/chatgpt-home'  (src/app/page.tsx)
Module not found: Can't resolve '@/lib/database'             (src/app/api/chat/route.ts)
Module not found: Can't resolve '@/lib/database'             (src/app/api/chats/[id]/route.ts)
Module not found: Can't resolve '@/lib/database'             (src/app/api/chats/route.ts)
> Build failed because of webpack errors
```

No errors reference deleted files other than the expected importers above
(page.tsx, chat route, chats routes — all scheduled for rewrite).

## Concerns

- `src/app/api/upload/route.ts` may import `pdf-parse` (uninstalled) — will
  be handled when upload route is rewritten in a later task.
- npm audit reports existing vulnerabilities; not addressed (out of scope).
