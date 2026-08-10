# Task 2.4 Review — Dashboard layout with auth guard and Zustand

**Verdict:** ✅ Approve
**Findings:** 2 (both minor, deferred by design)
**Critical issues:** 0

## 1. Spec compliance

All 4 files exist and match the plan's code **verbatim**:

- `src/store/chat-store.ts` — exact match to plan Step 1: `{ activeThreadId, isFloatingOpen }` + `setActiveThreadId` / `toggleFloating` / `openFloating` / `closeFloating`. Store shape satisfies the global constraint.
- `src/hooks/use-chat-store.ts` — one-line re-export, exact match to Step 2.
- `src/components/layout/app-sidebar.tsx` — exact match to Step 3 (nav items, New Chat button, Sign Out).
- `src/app/(dashboard)/layout.tsx` — exact match to Step 4: `AuthGuard` > flex shell > `AppSidebar` + `<main>`.

Plan's Files header also lists `app-header.tsx`, but no step defines it — correctly skipped (report notes this).

## 2. Quality

- Zustand store: correct shape, typed interface, no provider needed (zustand works standalone). ✅
- Sidebar nav: `usePathname` active-state highlighting works; links point at routes that later tasks create. ✅
- `AuthGuard` wraps the layout. ✅
- Imports verified: `signOut` is exported from [src/lib/auth.ts](src/lib/auth.ts#L5), `AuthGuard` from [src/components/auth/auth-guard.tsx](src/components/auth/auth-guard.tsx#L7). No dangling imports.

## 3. Scope

- Plain `<aside>` vs shadcn `Sidebar`: **acceptable** — the plan's Step 3/4 code explicitly uses `<aside>` and `<main>`, and the task Files list doesn't include a SidebarProvider wiring step. shadcn `sidebar.tsx` stays unused until a later task asks for it.
- No new dependencies added; `zustand` and `lucide-react` already installed. ✅

## Findings (non-blocking)

1. **Sign Out has no redirect target.** `signOut()` with no `fetchOptions` — Better Auth default lands on `/` (landing page), which is unauthenticated by design, so this is safe. Revisit only if product wants `/login`. Deferred in report.
2. **"New Chat" links to `/`** (dashboard home) rather than creating a thread — intentional; thread creation lands in a later task. Deferred in report.

Both are known ceilings of this task's scope, correctly flagged by the implementer.
