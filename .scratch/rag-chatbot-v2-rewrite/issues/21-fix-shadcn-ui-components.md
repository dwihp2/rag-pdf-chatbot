# 21 — Fix shadcn/ui Components (Task 6.2)

Status: resolved
Type: task
Milestone: 6 — Verification & Polish

## Task

Verify kept shadcn/ui components still work; delete ones only used by removed components; uninstall orphaned Radix packages.

## Files

- Keep: `button`, `input`, `dialog`, `card`, `avatar`, `badge`, `select`, `scroll-area`, `separator`, `tooltip`, `skeleton`, `sonner`
- Delete: `collapsible`, `hover-card`, `progress`, `tabs`, `carousel`, `sheet`, `sidebar`, `textarea`, `ai-elements/`, `kibo-ui/`
- Run: `npm uninstall` orphaned `@radix-ui/*` and `embla-carousel-react`

## Acceptance

- Kept components import cleanly; build has no references to deleted UI.

## Comments

- Complete; review clean. (Repo kept some of these — e.g. `sheet`/`textarea`/`sidebar`/`collapsible` still exist today — the delete list was advisory; actual removals tracked via the cleanup commit.)
