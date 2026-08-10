# Graph Report - rag-pdf-chatbot  (2026-08-11)

## Corpus Check
- 91 files · ~122,305 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 576 nodes · 988 edges · 63 communities (25 shown, 38 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5c7377a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RAG Chatbot v2 Full Rewrite Plan
- collections/[id]/page.tsx
- auth-server.ts
- devDependencies
- attachment.tsx
- cn
- compilerOptions
- assistant-ui/thread-list.tsx
- thread.tsx
- components.json
- tool-fallback.tsx
- RAG PDF Chat Application
- utils.ts
- reasoning.tsx
- tool-group.tsx
- dependencies
- select.tsx
- sheet.tsx
- SidebarProvider
- app/layout.tsx
- markdown-text.tsx
- eslint.config.mjs
- floating-chat.tsx
- @ai-sdk/openai
- @ai-sdk/react
- @assistant-ui/react
- @assistant-ui/react-ai-sdk
- @assistant-ui/react-markdown
- better-auth
- class-variance-authority
- clsx
- lucide-react
- next
- next.config.ts
- next-themes
- pdf-parse
- pg
- pgvector
- prisma
- @prisma/client
- radix-ui
- @radix-ui/react-avatar
- @radix-ui/react-dialog
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-tooltip
- @radix-ui/react-use-controllable-state
- react
- react-dom
- react-dropzone
- remark-gfm
- shiki
- @shikijs/transformers
- sonner
- tailwind-merge
- tw-shimmer
- zustand
- postcss.config.mjs
- vercel.json
- { signIn, signUp, signOut, useSession }
- document-list.tsx
- assistant-modal.tsx
- avatar.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 138 edges
2. `Button()` - 19 edges
3. `RAG Chatbot v2 Full Rewrite Plan` - 18 edges
4. `compilerOptions` - 16 edges
5. `prisma` - 13 edges
6. `auth` - 12 edges
7. `README.md — RAG PDF Chatbot Overview` - 11 edges
8. `scripts` - 10 edges
9. `useChatStore` - 9 edges
10. `Input()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `COMPLETE_DATABASE_FIX.md — Prepared Statement Error Resolution` --semantically_similar_to--> `DATABASE_FIX.md — Database Connection Fix Summary`  [INFERRED] [semantically similar]
  COMPLETE_DATABASE_FIX.md → DATABASE_FIX.md
- `DeepSeek v4 Pro` --semantically_similar_to--> `Claude 3 Haiku (Anthropic)`  [INFERRED] [semantically similar]
  docs/superpowers/plans/2026-08-10-rag-chatbot-v2-rewrite.md → README.md
- `UI_IMPROVEMENTS.md — UI Enhancements Summary` --semantically_similar_to--> `UI-improvement-vercel-ai-elements.md — Kibo-UI to Vercel AI Elements Migration`  [INFERRED] [semantically similar]
  UI_IMPROVEMENTS.md → UI-improvement-vercel-ai-elements.md
- `Neon Serverless PostgreSQL` --semantically_similar_to--> `Supabase PostgreSQL`  [INFERRED] [semantically similar]
  NEON_CONFIGURATION.md → DATABASE_PRISMA.md
- `pgvector Retrieval Config (v2)` --conceptually_related_to--> `PGVECTOR_MIGRATION.md — Qdrant to pgvector Migration`  [INFERRED]
  docs/superpowers/plans/2026-08-10-rag-chatbot-v2-rewrite.md → PGVECTOR_MIGRATION.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Prepared Statement 42P05 Error Fix Pattern** — complete_database_fix, database_fix, pgbouncer_pooler, prepared_statement_error_42p05, supabase_postgres, deployment_global_prisma_instance [INFERRED 0.85]
- **Vector Search Evolution: Qdrant → pgvector → v2 Config** — pgvector_migration, pgvector_migration_qdrantservice, pgvector_migration_vectorservice, pgvector_migration_pgvector, docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite_pgvector_retrieval, pgvector_migration_text_embedding_3_small [INFERRED 0.85]
- **v2 Rewrite Target Architecture** — docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite, docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite_better_auth, docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite_assistant_ui, docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite_deepseek_v4_pro, docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite_zustand, docs_superpowers_plans_2026_08_10_rag_chatbot_v2_rewrite_floating_chat [EXTRACTED 1.00]
- **Dark Theme Design System** — public_home_page_screenshot, public_chat_conversation_screenshot, public_chat_document_sources_screenshot, public_knowledge_management_screenshot, public_pdf_upload_screenshot [INFERRED 0.95]
- **RAG PDF Chat Application User Flow** — public_home_page_screenshot, public_pdf_upload_screenshot, public_knowledge_management_screenshot, public_chat_conversation_screenshot, public_chat_document_sources_screenshot [INFERRED 0.85]

## Communities (63 total, 38 thin omitted)

### Community 0 - "RAG Chatbot v2 Full Rewrite Plan"
Cohesion: 0.06
Nodes (53): COMPLETE_DATABASE_FIX.md — Prepared Statement Error Resolution, DATABASE_FIX.md — Database Connection Fix Summary, DATABASE_PRISMA.md — Prisma + Supabase Setup, Chat Model (Prisma), DatabaseService, Message Model (Prisma), Role Enum, DEPLOYMENT.md — Vercel + Prisma + Supabase Deployment (+45 more)

### Community 1 - "collections/[id]/page.tsx"
Cohesion: 0.06
Nodes (32): Chat, Collection, Doc, Collection, AuthGuard(), LoginForm(), ChatHome(), suggestions (+24 more)

### Community 2 - "auth-server.ts"
Cohesion: 0.09
Nodes (14): { GET, POST }, messageText(), POST(), auth, globalForPrisma, prisma, documentProcessor, retrieveContext() (+6 more)

### Community 3 - "devDependencies"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss (+30 more)

### Community 4 - "attachment.tsx"
Cohesion: 0.18
Nodes (15): AttachmentPreview(), AttachmentPreviewDialog(), AttachmentPreviewProps, AttachmentThumb(), AttachmentUI(), ComposerAddAttachment(), ComposerAttachments(), useAttachmentSrc() (+7 more)

### Community 5 - "cn"
Cohesion: 0.13
Nodes (29): Separator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction() (+21 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 7 - "assistant-ui/thread-list.tsx"
Cohesion: 0.18
Nodes (8): dateGroupLabel(), ThreadListGroup, ThreadListItem(), ThreadListItemGroups(), ThreadListItems(), ThreadListNew, ThreadListRoot(), ThreadListSearch

### Community 8 - "thread.tsx"
Cohesion: 0.09
Nodes (8): ThreadFollowupSuggestions(), AssistantMessage(), BranchPicker(), EMPTY_COMPONENTS, ThreadComponents, ThreadComponentsContext, ThreadGroupPart, ThreadProps

### Community 9 - "components.json"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+11 more)

### Community 10 - "tool-fallback.tsx"
Cohesion: 0.13
Nodes (17): APPROVAL_OPTION_DEFAULT_LABELS, approvalOptionLabel(), formatToolDuration(), isAllowKind(), statusIconMap, ToolFallback, ToolFallbackApproval(), ToolFallbackArgs() (+9 more)

### Community 11 - "RAG PDF Chat Application"
Cohesion: 0.17
Nodes (15): Markdown Chat Response Rendering, Chat Conversation UI Screenshot, Chat with Document Sources UI Screenshot, Document Source Attribution Feature, Document File Icon, Globe Web Icon, RAG PDF Chat Application, RAG PDF Chat Home Page Screenshot (+7 more)

### Community 12 - "utils.ts"
Cohesion: 0.12
Nodes (9): Checkbox(), HoverCardContent, Progress(), ScrollArea(), ScrollBar(), Tabs(), TabsContent(), TabsList() (+1 more)

### Community 13 - "reasoning.tsx"
Cohesion: 0.17
Nodes (10): Reasoning, ReasoningContent(), ReasoningFade(), ReasoningGroup, ReasoningPreviewContext, ReasoningRoot(), ReasoningRootProps, ReasoningText() (+2 more)

### Community 14 - "tool-group.tsx"
Cohesion: 0.21
Nodes (10): ToolGroup, ToolGroupComponent, ToolGroupContent(), ToolGroupRoot(), ToolGroupRootProps, ToolGroupTrigger(), toolGroupVariants, Collapsible() (+2 more)

### Community 15 - "dependencies"
Cohesion: 0.18
Nodes (11): ai, @ai-sdk/deepseek, dependencies, ai, @ai-sdk/deepseek, @radix-ui/react-scroll-area, @radix-ui/react-slot, uuid (+3 more)

### Community 16 - "select.tsx"
Cohesion: 0.18
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 17 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 19 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): inter, metadata, Toaster()

### Community 20 - "markdown-text.tsx"
Cohesion: 0.40
Nodes (4): CodeHeader(), defaultComponents, MarkdownText, useCopyToClipboard()

### Community 21 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 22 - "floating-chat.tsx"
Cohesion: 0.26
Nodes (7): ChatPage(), FloatingChat(), FloatingChatUI(), ChatSummary, ThreadList(), ChatStore, useChatStore

### Community 60 - "document-list.tsx"
Cohesion: 0.23
Nodes (8): Doc, DocumentItem(), DocumentList(), getStatusConfig(), UploadZone(), Badge(), badgeVariants, formatFileSize()

### Community 61 - "assistant-modal.tsx"
Cohesion: 0.25
Nodes (6): AssistantModalButton, AssistantModalButtonProps, isNewChatView(), Thread(), ThreadRoot(), TooltipIconButton

### Community 62 - "avatar.tsx"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

## Knowledge Gaps
- **167 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `collections/[id]/page.tsx`, `attachment.tsx`, `assistant-ui/thread-list.tsx`, `thread.tsx`, `tool-fallback.tsx`, `utils.ts`, `reasoning.tsx`, `tool-group.tsx`, `select.tsx`, `sheet.tsx`, `SidebarProvider`, `markdown-text.tsx`, `floating-chat.tsx`, `document-list.tsx`, `assistant-modal.tsx`, `avatar.tsx`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `@ai-sdk/openai`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@assistant-ui/react-markdown`, `better-auth`, `class-variance-authority`, `clsx`, `lucide-react`, `next`, `next-themes`, `pdf-parse`, `pg`, `pgvector`, `prisma`, `@prisma/client`, `radix-ui`, `@radix-ui/react-avatar`, `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-tooltip`, `@radix-ui/react-use-controllable-state`, `react`, `react-dom`, `react-dropzone`, `remark-gfm`, `shiki`, `@shikijs/transformers`, `sonner`, `tailwind-merge`, `tw-shimmer`, `zustand`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RAG Chatbot v2 Full Rewrite Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.062409288824383166 - nodes in this community are weakly interconnected._
- **Should `collections/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06370543541788427 - nodes in this community are weakly interconnected._
- **Should `auth-server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0851063829787234 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._