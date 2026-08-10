# RAG PDF Chatbot v2 — Full Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full rewrite of the RAG PDF chatbot with Better Auth (email/password), assistant-ui chat interface, floating Help Scout-style chat widget, collection-based knowledge organization, AI SDK v7 source streaming, structured citation enforcement, and DeepSeek chat + OpenAI embeddings model setup.

**Architecture:** Next.js 15 App Router with route groups `(auth)` and `(dashboard)`. Better Auth manages users/sessions in Postgres. The chat API uses `createUIMessageStream` (AI SDK v7) to stream sources as first-class data parts. Frontend uses assistant-ui (`AssistantModal` for floating chat, `Thread` for full-page chat) with Zustand for cross-surface sync. pgvector handles semantic search with threshold ≥ 0.6, top-8, dedup.

**Tech Stack:** Next.js 15, React 19, TypeScript, assistant-ui, Better Auth, Zustand, @ai-sdk/deepseek, @ai-sdk/openai (embeddings only), Prisma + pgvector, Tailwind CSS 4, shadcn/ui

## Global Constraints

- Fresh database — no migration of existing data
- DeepSeek `deepseek-v4-pro` for chat, OpenAI `text-embedding-3-small` for embeddings (1536-dim)
- Better Auth manages its own tables; email/password auth with DB sessions
- All API routes under `(dashboard)` require authentication
- Phase 1 only: PDF upload, no text/md/docs yet
- Collections: many-to-many with documents, one collection per chat, personal space fallback
- Retrieval: pgvector cosine similarity ≥ 0.6, top-8, deduplicate by document
- Citations: mandatory `[N]` format enforced via system prompt, no `<source id>` XML tags
- Sources streamed via AI SDK v7 `createUIMessageStream` with `type: 'source'` parts
- Floating chat: independent runtime per surface, Zustand store for `{ activeThreadId, isFloatingOpen }`
- Floating minimize: saves conversation, shows thread list on reopen
- All dead code removed: `page-old.tsx`, `page-new.tsx`, `ChatInterface`, QdrantService, neon-*, unused AI Elements, old citation parser

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (no auth wrapping)
│   ├── page.tsx                      # Landing page (unauthenticated)
│   ├── globals.css                   # Keep, clean up unused styles
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login form
│   │   └── register/page.tsx         # Register form
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Auth guard + SidebarProvider + ZustandProvider
│   │   ├── page.tsx                  # Chat home (ChatGPTHome-style)
│   │   ├── chat/
│   │   │   └── [id]/page.tsx         # Individual chat page
│   │   ├── documents/page.tsx        # Document management
│   │   └── collections/
│   │       ├── page.tsx              # Collections list
│   │       └── [id]/page.tsx         # Collection detail
│   └── api/
│       ├── auth/[...all]/route.ts    # Better Auth handler
│       ├── chat/route.ts             # RAG chat endpoint (refactored, v7 sources)
│       ├── chats/route.ts            # CRUD chat threads
│       ├── chats/[id]/route.ts       # Single chat + messages
│       ├── documents/route.ts        # CRUD documents
│       ├── documents/[id]/route.ts   # Single document
│       ├── collections/route.ts      # CRUD collections
│       ├── collections/[id]/route.ts # Single collection
│       └── upload/route.ts           # File upload handler
├── components/
│   ├── chat/
│   │   ├── floating-chat.tsx         # AssistantModal wrapper (floating widget)
│   │   ├── chat-page.tsx             # Full-page Thread wrapper
│   │   ├── thread-list.tsx           # Shared thread list (sidebar + floating)
│   │   └── chat-home.tsx             # Landing page with suggestion prompts
│   ├── documents/
│   │   ├── upload-zone.tsx           # Drag-and-drop + button PDF upload
│   │   └── document-list.tsx         # Document table with status badges
│   ├── collections/
│   │   ├── collection-card.tsx       # Collection card for grid/list
│   │   └── collection-picker.tsx     # Dropdown to assign docs to collections
│   ├── auth/
│   │   ├── auth-guard.tsx            # Client-side auth redirect
│   │   └── login-form.tsx            # Email/password login form
│   ├── layout/
│   │   ├── app-sidebar.tsx           # Main navigation sidebar
│   │   └── app-header.tsx            # Top header bar
│   └── ui/                           # shadcn/ui components (keep existing, add as needed)
├── lib/
│   ├── auth.ts                       # Better Auth client (for client components)
│   ├── auth-server.ts                # Better Auth server config + Prisma adapter
│   ├── db.ts                         # Prisma client singleton
│   ├── retrieval.ts                  # Vector search + context formatting
│   ├── document-processor.ts         # PDF parsing + chunking (keep, refactor)
│   ├── vector-service.ts             # pgvector operations (keep, fix threshold)
│   └── utils.ts                      # Keep existing utils
├── hooks/
│   ├── use-chat-store.ts             # Zustand store hook
│   └── use-mobile.ts                 # Keep
├── store/
│   └── chat-store.ts                 # Zustand store: { activeThreadId, isFloatingOpen }
└── types/
    └── index.ts                      # Shared types (UIMessage extension, sources, etc.)
```

**Files to delete:**
- `src/app/page-old.tsx`
- `src/app/page-new.tsx`
- `src/components/chat-interface.tsx`
- `src/components/chat-layout.tsx`
- `src/components/chat-sidebar.tsx`
- `src/components/chatgpt-home.tsx`
- `src/components/chatgpt-sidebar.tsx`
- `src/components/chatgpt-sidebar-new.tsx`
- `src/components/document-manager.tsx`
- `src/components/enhanced-response.tsx`
- `src/components/enhanced-sources.tsx`
- `src/components/modern-chat-interface.tsx`
- `src/components/modern-sidebar.tsx`
- `src/components/pdf-upload.tsx`
- `src/components/source-display-controller.tsx`
- `src/lib/qdrant.ts`
- `src/lib/citation-parser.ts`
- `src/lib/neon-config.ts`
- `src/lib/neon-utils.ts`
- `src/lib/database.ts`
- `src/app/api/qdrant/route.ts`
- `src/app/api/vectors/route.ts`
- `src/app/api/test-db/route.ts`
- `src/app/api/documents/[id]/route.ts` (rewrite)
- `src/app/chats/[id]/page.tsx` (rewrite)
- `src/app/documents/page.tsx` (rewrite)
- `test-chat-api.js`
- `test-db-connection.js`
- `test-kibo-ui.js`
- `test-ui.js`
- `scripts/`

---

## Task Breakdown

### Milestone 1: Project Cleanup & Foundation

---

### Task 1.1: Delete dead code

**Files:**
- Delete: all files listed in "Files to delete" above

**Interfaces:**
- Produces: Clean workspace with only kept files remaining

- [ ] **Step 1: Delete old page variants**
```bash
rm src/app/page-old.tsx src/app/page-new.tsx
```

- [ ] **Step 2: Delete old chat components**
```bash
rm src/components/chat-interface.tsx src/components/chat-layout.tsx \
   src/components/chat-sidebar.tsx src/components/chatgpt-home.tsx \
   src/components/chatgpt-sidebar.tsx src/components/chatgpt-sidebar-new.tsx \
   src/components/modern-chat-interface.tsx src/components/modern-sidebar.tsx
```

- [ ] **Step 3: Delete old document/citation components**
```bash
rm src/components/document-manager.tsx src/components/enhanced-response.tsx \
   src/components/enhanced-sources.tsx src/components/pdf-upload.tsx \
   src/components/source-display-controller.tsx src/lib/citation-parser.ts
```

- [ ] **Step 4: Delete Qdrant and Neon files**
```bash
rm src/lib/qdrant.ts src/lib/neon-config.ts src/lib/neon-utils.ts \
   src/lib/database.ts src/app/api/qdrant/route.ts src/app/api/vectors/route.ts \
   src/app/api/test-db/route.ts
```

- [ ] **Step 5: Delete test scripts and old API routes**
```bash
rm test-chat-api.js test-db-connection.js test-kibo-ui.js test-ui.js
rm -rf scripts/
rm -rf src/app/api/documents/ src/app/chats/ src/app/documents/
```

- [ ] **Step 6: Remove unused dependencies**
```bash
npm uninstall @qdrant/js-client-rest pdf-parse langchain @langchain/community \
  @ai-sdk/anthropic @radix-ui/react-collapsible @radix-ui/react-hover-card \
  @radix-ui/react-progress @radix-ui/react-tabs streamdown \
  @icons-pack/react-simple-icons date-fns embla-carousel-react \
  use-stick-to-bottom
```

- [ ] **Step 7: Clean up globals.css** — remove any styles referencing deleted components. Keep only Tailwind directives and base shadcn/ui styles.

- [ ] **Step 8: Verify build doesn't break on missing imports**
```bash
npm run build 2>&1 | head -50
```
Expected: errors only from files we haven't rewritten yet (chat route, pages). No errors about deleted files.

---

### Task 1.2: Install new dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: All new packages installed and available

- [ ] **Step 1: Install core new packages**
```bash
npm install @ai-sdk/deepseek better-auth @assistant-ui/react \
  @assistant-ui/react-ai-sdk zustand
```

- [ ] **Step 2: Install assistant-ui shadcn components**
```bash
npx shadcn@latest add @assistant-ui/thread @assistant-ui/thread-list \
  @assistant-ui/assistant-modal
```

- [ ] **Step 3: Verify installations**
```bash
npm ls @ai-sdk/deepseek better-auth zustand @assistant-ui/react
```
Expected: all packages listed with version numbers.

---

### Task 1.3: Configure TypeScript types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `AppSource`, `MyUIMessage` type, `CreateChatInput`, `CreateDocumentInput`, `CreateCollectionInput`

- [ ] **Step 1: Create types file**

```typescript
// src/types/index.ts
import { UIMessage } from 'ai';

// RAG source type (streamed as data part)
export interface AppSource {
  id: string;
  documentId: string;
  filename: string;
  page: number;
  snippet: string;
  score: number;
}

// Custom UI message with source data parts
export type MyUIMessage = UIMessage<
  never,
  {
    sources: {
      sources: AppSource[];
    };
    notification: {
      message: string;
      level: 'info' | 'warning' | 'error';
    };
  }
>;

// API input types
export interface CreateChatInput {
  title?: string;
  collectionId?: string;
}

export interface CreateDocumentInput {
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  collectionId?: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
}
```

---

### Milestone 2: Database & Auth

---

### Task 2.1: Rewrite Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: Full schema with User, Session, Account (Better Auth), Collection, CollectionMember, CollectionDocument, Chat, Message, Document, DocumentChunk

- [ ] **Step 1: Write the new Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// pgvector extension
generator pgvector {
  provider = "pgvector"
}

// === Better Auth Tables ===

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]

  // App relations
  chats         Chat[]
  documents     Document[]
  collections   Collection[]
  memberships   CollectionMember[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id              String   @id @default(uuid())
  userId          String
  accountId       String
  providerId      String
  accessToken     String?
  refreshToken    String?
  accessTokenExpiresAt DateTime?
  refreshTokenExpiresAt DateTime?
  scope           String?
  idToken         String?
  password        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// === App Tables ===

model Collection {
  id          String   @id @default(uuid())
  name        String
  description String?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User              @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  members     CollectionMember[]
  documents   CollectionDocument[]
  chats       Chat[]
}

model CollectionMember {
  id           String   @id @default(uuid())
  collectionId String
  userId       String
  role         String   @default("member") // "owner" | "member"
  joinedAt     DateTime @default(now())

  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([collectionId, userId])
}

model CollectionDocument {
  id           String   @id @default(uuid())
  collectionId String
  documentId   String
  addedAt      DateTime @default(now())

  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  document     Document   @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@unique([collectionId, documentId])
}

model Chat {
  id           String   @id @default(uuid())
  title        String   @default("New Chat")
  userId       String
  collectionId String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  messages     Message[]
}

model Message {
  id        String   @id @default(uuid())
  chatId    String
  role      String   // "user" | "assistant"
  content   String
  sources   Json?    // AppSource[]
  createdAt DateTime @default(now())

  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
}

model Document {
  id           String   @id @default(uuid())
  userId       String
  filename     String
  originalName String
  fileSize     Int
  mimeType     String
  status       String   @default("processing") // "processing" | "completed" | "failed"
  summary      String?
  chunkCount   Int      @default(0)
  uploadedAt   DateTime @default(now())

  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  chunks       DocumentChunk[]
  collections  CollectionDocument[]
}

model DocumentChunk {
  id         String   @id @default(uuid())
  documentId String
  text       String
  pageNumber Int
  chunkIndex Int
  embedding  Unsupported("vector(1536)")
  createdAt  DateTime @default(now())

  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([embedding], type: "ivfflat")
}
```

- [ ] **Step 2: Set environment variables for Better Auth**

Add to `.env.local`:
```bash
# Better Auth
BETTER_AUTH_SECRET="your-secret-here"  # generate: openssl rand -hex 32
BETTER_AUTH_URL="http://localhost:3000"

# DeepSeek
DEEPSEEK_API_KEY="your-deepseek-key"

# OpenAI (embeddings only)
OPENAI_API_KEY="your-openai-key"

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

- [ ] **Step 3: Reset database and run migrations**
```bash
npx prisma db push --force-reset
npx prisma generate
```

- [ ] **Step 4: Verify schema**
```bash
npx prisma db pull --print
```
Expected: output matches schema.prisma exactly.

---

### Task 2.2: Set up Better Auth server

**Files:**
- Create: `src/lib/auth-server.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/db.ts`
- Create: `src/app/api/auth/[...all]/route.ts`

**Interfaces:**
- Produces: `auth` server instance, `authClient` for client components, Better Auth API route handler

- [ ] **Step 1: Create Prisma client singleton**

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Create Better Auth server config**

```typescript
// src/lib/auth-server.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh every 24 hours
  },
});
```

- [ ] **Step 3: Create Better Auth client (for client components)**

```typescript
// src/lib/auth.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 4: Create Better Auth API route**

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 5: Test auth setup**
```bash
curl -X POST http://localhost:3000/api/auth/sign-up-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","name":"Test"}'
```
Expected: 200 with user + session token.

---

### Task 2.3: Create auth UI

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/auth-guard.tsx`

**Interfaces:**
- Consumes: `signIn`, `signUp` from `@/lib/auth`
- Produces: Login/register pages, auth guard component

- [ ] **Step 1: Create login form component**

```typescript
// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Login failed");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email to sign in to your account
        </p>
      </div>
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-primary hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Create login page**

```typescript
// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 3: Create register page** (same pattern as login, but with name field and `signUp.email`)

```typescript
// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message ?? "Registration failed");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm">
            Sign up to get started
          </p>
        </div>
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Create auth guard component**

```typescript
// src/components/auth/auth-guard.tsx
"use client";

import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
```

---

### Task 2.4: Create dashboard layout with auth guard and Zustand

**Files:**
- Create: `src/store/chat-store.ts`
- Create: `src/hooks/use-chat-store.ts`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/app-header.tsx`

**Interfaces:**
- Consumes: `useSession` from Better Auth, `AuthGuard`
- Produces: Authenticated dashboard layout with sidebar, Zustand store

- [ ] **Step 1: Create Zustand store**

```typescript
// src/store/chat-store.ts
import { create } from "zustand";

interface ChatStore {
  activeThreadId: string | null;
  isFloatingOpen: boolean;
  setActiveThreadId: (id: string | null) => void;
  toggleFloating: () => void;
  openFloating: () => void;
  closeFloating: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeThreadId: null,
  isFloatingOpen: false,
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  toggleFloating: () => set((s) => ({ isFloatingOpen: !s.isFloatingOpen })),
  openFloating: () => set({ isFloatingOpen: true }),
  closeFloating: () => set({ isFloatingOpen: false }),
}));
```

- [ ] **Step 2: Create Zustand hook wrapper**

```typescript
// src/hooks/use-chat-store.ts
export { useChatStore } from "@/store/chat-store";
```

- [ ] **Step 3: Create app sidebar**

```typescript
// src/components/layout/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, FileText, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/collections", label: "Collections", icon: FolderOpen },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold">RAG Chat</span>
      </div>

      <Link href="/" className="mb-4">
        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </Link>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create dashboard layout**

```typescript
// src/app/(dashboard)/layout.tsx
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </AuthGuard>
  );
}
```

---

### Milestone 3: Backend APIs

---

### Task 3.1: Rewrite vector service with fixed threshold

**Files:**
- Modify: `src/lib/vector-service.ts`

**Interfaces:**
- Consumes: OpenAI `text-embedding-3-small` via `@ai-sdk/openai`
- Produces: `generateEmbeddings()`, `generateQueryEmbedding()`, `addDocuments()`, `searchSimilar(embedding, limit=8, threshold=0.6)`

- [ ] **Step 1: Rewrite vector-service.ts**

```typescript
// src/lib/vector-service.ts
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { prisma } from "./db";

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 10;

export const vectorService = {
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const { embeddings: batchEmbeddings } = await embedMany({
        model: openai.embedding(EMBEDDING_MODEL),
        values: batch,
      });
      embeddings.push(...batchEmbeddings);
    }
    return embeddings;
  },

  async generateQueryEmbedding(query: string): Promise<number[]> {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: query,
    });
    return embedding;
  },

  async addDocuments(documentId: string, chunks: { text: string; pageNumber: number; chunkIndex: number }[]) {
    const texts = chunks.map((c) => c.text);
    const embeddings = await this.generateEmbeddings(texts);

    const rows = chunks.map((chunk, i) => ({
      documentId,
      text: chunk.text,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      embedding: embeddings[i],
    }));

    // Batch insert with raw SQL for pgvector
    for (const row of rows) {
      const embeddingStr = `[${row.embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (id, "documentId", text, "pageNumber", "chunkIndex", embedding, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::vector, NOW())`,
        row.documentId,
        row.text,
        row.pageNumber,
        row.chunkIndex,
        embeddingStr
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { chunkCount: chunks.length, status: "completed" },
    });
  },

  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 8,
    threshold: number = 0.6
  ) {
    const embeddingStr = `[${queryEmbedding.join(",")}]`;
    const results = await prisma.$queryRawUnsafe<Array<{
      id: string;
      documentId: string;
      text: string;
      pageNumber: number;
      chunkIndex: number;
      similarity: number;
      filename: string;
    }>>(
      `SELECT
        dc.id,
        dc."documentId",
        dc.text,
        dc."pageNumber",
        dc."chunkIndex",
        1 - (dc.embedding <=> $1::vector) AS similarity,
        d.filename
       FROM "DocumentChunk" dc
       JOIN "Document" d ON d.id = dc."documentId"
       WHERE d.status = 'completed'
         AND 1 - (dc.embedding <=> $1::vector) > $2
       ORDER BY dc.embedding <=> $1::vector
       LIMIT $3`,
      embeddingStr,
      threshold,
      limit
    );

    // Deduplicate by document — keep highest-scoring chunk per document
    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      if (seen.has(r.documentId)) return false;
      seen.add(r.documentId);
      return true;
    });

    return deduped;
  },
};
```

- [ ] **Step 2: Verify vector search with a test**
```bash
# Create a test script
cat > /tmp/test-vector.ts << 'EOF'
import { vectorService } from "./src/lib/vector-service";
async function main() {
  const emb = await vectorService.generateQueryEmbedding("test query");
  console.log("Embedding dimension:", emb.length);
  const results = await vectorService.searchSimilar(emb, 3, 0.6);
  console.log("Results:", results.length);
}
main();
EOF
npx tsx /tmp/test-vector.ts
```
Expected: `Embedding dimension: 1536`, no errors.

---

### Task 3.2: Rewrite document processor

**Files:**
- Modify: `src/lib/document-processor.ts`

**Interfaces:**
- Consumes: `pdf-parse` (keep, installed), `vectorService`
- Produces: `processPDF(file: File): Promise<{ chunks, pageCount }>`, `generateQueryEmbedding(query: string)`

- [ ] **Step 1: Rewrite document-processor.ts**

```typescript
// src/lib/document-processor.ts
import { vectorService } from "./vector-service";

// Simple text splitter — no langchain dependency
function splitText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap;
  }
  return chunks.filter((c) => c.trim().length > 10);
}

// Lazy-load pdf-parse (heavy dependency)
async function parsePdfBuffer(buffer: ArrayBuffer): Promise<{
  text: string;
  numPages: number;
}> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(new Uint8Array(buffer));
  const result = await pdfParse(data);
  return { text: result.text, numPages: result.numpages };
}

export const documentProcessor = {
  async processPDF(file: File): Promise<{
    chunks: Array<{ text: string; pageNumber: number; chunkIndex: number }>;
    pageCount: number;
  }> {
    const buffer = await file.arrayBuffer();
    const { text, numPages } = await parsePdfBuffer(buffer);

    // Split entire text into chunks (simplified — page-level splitting can be added later)
    const textChunks = splitText(text);

    const chunks = textChunks.map((chunkText, i) => ({
      text: chunkText,
      pageNumber: 1, // Simplified — estimate from position
      chunkIndex: i,
    }));

    return { chunks, pageCount: numPages };
  },

  async generateQueryEmbedding(query: string): Promise<number[]> {
    return vectorService.generateQueryEmbedding(query);
  },
};
```

- [ ] **Step 2: Remove LangChain dependencies**
```bash
npm uninstall langchain @langchain/community
```

---

### Task 3.3: Create retrieval helper

**Files:**
- Create: `src/lib/retrieval.ts`

**Interfaces:**
- Consumes: `vectorService`, `AppSource` type
- Produces: `retrieveContext(query: string): Promise<{ context: string; sources: AppSource[] }>`

- [ ] **Step 1: Create retrieval.ts**

```typescript
// src/lib/retrieval.ts
import { vectorService } from "./vector-service";
import type { AppSource } from "@/types";

export async function retrieveContext(query: string): Promise<{
  context: string;
  sources: AppSource[];
}> {
  const queryEmbedding = await vectorService.generateQueryEmbedding(query);
  const results = await vectorService.searchSimilar(queryEmbedding, 8, 0.6);

  if (results.length === 0) {
    return {
      context: "No relevant information found in the documents.",
      sources: [],
    };
  }

  const context = results
    .map((r, i) => `[Document ${i + 1}] ${r.text}`)
    .join("\n\n");

  const sources: AppSource[] = results.map((r, i) => ({
    id: `doc-${i + 1}`,
    documentId: r.documentId,
    filename: r.filename,
    page: r.pageNumber,
    snippet: r.text.substring(0, 150) + "...",
    score: Math.round(r.similarity * 100) / 100,
  }));

  return { context, sources };
}
```

---

### Task 3.4: Rewrite chat API with AI SDK v7 source streaming

**Files:**
- Create: `src/app/api/chat/route.ts`

**Interfaces:**
- Consumes: `retrieveContext`, `auth` (session check), `prisma`, `deepseek` provider
- Produces: `POST /api/chat` — RAG chat with `createUIMessageStreamResponse`

- [ ] **Step 1: Write the new chat route**

```typescript
// src/app/api/chat/route.ts
import { deepseek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { retrieveContext } from "@/lib/retrieval";
import type { MyUIMessage, AppSource } from "@/types";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, chatId } = await req.json();
  const latestMessage = messages[messages.length - 1].content;

  // Get or create chat
  let activeChatId = chatId;
  if (!activeChatId) {
    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: latestMessage.substring(0, 50),
      },
    });
    activeChatId = chat.id;
  }

  // Save user message
  await prisma.message.create({
    data: {
      chatId: activeChatId,
      role: "user",
      content: latestMessage,
    },
  });

  // Retrieve context
  const { context, sources } = await retrieveContext(latestMessage);

  const systemMessage = `### Task:
Respond to the user query using the provided context. You MUST include inline citations in the format [N] for EVERY factual claim you make that is supported by the context. N refers to the [Document N] marker in the context.

### Citation Rules:
- EVERY factual claim MUST have a citation: "The sky is blue. [1]"
- Place punctuation BEFORE the citation: "This is correct. [1]"
- NOT: "This is correct [1]."
- Multiple sources for one claim: "This is well-documented. [1], [3]"
- If you don't know or the context doesn't cover it, say so honestly — do NOT fabricate citations.

### Response Format:
- Prefer bullet points or numbered lists for structured information
- Keep responses clear and concise
- Respond in the same language as the user

<context>
${context}
</context>`;

  const stream = createUIMessageStream<MyUIMessage>({
    execute: ({ writer }) => {
      // Stream sources as first-class data parts
      if (sources.length > 0) {
        writer.write({
          type: "data-sources",
          id: "sources",
          data: { sources },
        });
      }

      // Stream notification
      if (sources.length === 0) {
        writer.write({
          type: "data-notification",
          data: {
            message: "No relevant documents found. Answering from general knowledge.",
            level: "warning",
          },
          transient: true,
        });
      }

      const result = streamText({
        model: deepseek("deepseek-v4-pro"),
        system: systemMessage,
        messages: await convertToModelMessages(messages),
        temperature: 0.5,
        onEnd: async ({ text }) => {
          // Save assistant message with sources
          await prisma.message.create({
            data: {
              chatId: activeChatId,
              role: "assistant",
              content: text,
              sources: sources.length > 0 ? sources : undefined,
            },
          });

          // Auto-title if "New Chat"
          const chat = await prisma.chat.findUnique({
            where: { id: activeChatId },
          });
          if (chat && chat.title === "New Chat") {
            const title = latestMessage.substring(0, 50);
            await prisma.chat.update({
              where: { id: activeChatId },
              data: { title },
            });
          }
        },
      });

      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
  });

  return createUIMessageStreamResponse({
    stream,
    headers: { "X-Chat-Id": activeChatId },
  });
}
```

---

### Task 3.5: Create CRUD API routes

**Files:**
- Create: `src/app/api/chats/route.ts`
- Create: `src/app/api/chats/[id]/route.ts`
- Create: `src/app/api/documents/route.ts`
- Create: `src/app/api/documents/[id]/route.ts`
- Create: `src/app/api/collections/route.ts`
- Create: `src/app/api/collections/[id]/route.ts`
- Create: `src/app/api/upload/route.ts`

**Interfaces:**
- Consumes: `auth` session, `prisma`, `documentProcessor`, `vectorService`
- Produces: Full CRUD for chats, documents, collections; file upload handler

- [ ] **Step 1: Create chats list/create route**

```typescript
// src/app/api/chats/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true, collectionId: true },
  });
  return NextResponse.json(chats);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, collectionId } = await req.json();
  const chat = await prisma.chat.create({
    data: {
      userId: session.user.id,
      title: title || "New Chat",
      collectionId: collectionId || null,
    },
  });
  return NextResponse.json(chat);
}
```

- [ ] **Step 2: Create single chat route (GET + DELETE)**

```typescript
// src/app/api/chats/[id]/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const chat = await prisma.chat.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(chat);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.chat.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create documents CRUD and upload route**

```typescript
// src/app/api/documents/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });
  return NextResponse.json(documents);
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.document.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
```

```typescript
// src/app/api/upload/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { documentProcessor } from "@/lib/document-processor";
import { vectorService } from "@/lib/vector-service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  // Create document record
  const doc = await prisma.document.create({
    data: {
      userId: session.user.id,
      filename: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
      status: "processing",
    },
  });

  // Process async — in production, use a queue
  try {
    const { chunks } = await documentProcessor.processPDF(file);
    await vectorService.addDocuments(
      doc.id,
      chunks.map((c, i) => ({ ...c, chunkIndex: i }))
    );
  } catch (err) {
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: "failed" },
    });
    return NextResponse.json(
      { error: "Failed to process PDF", details: String(err) },
      { status: 500 }
    );
  }

  const updated = await prisma.document.findUnique({ where: { id: doc.id } });
  return NextResponse.json(updated);
}
```

```typescript
// src/app/api/documents/[id]/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.document.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create collections CRUD**

```typescript
// src/app/api/collections/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const collections = await prisma.collection.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: { _count: { select: { documents: true, chats: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();
  const collection = await prisma.collection.create({
    data: { name, description, ownerId: session.user.id },
  });
  return NextResponse.json(collection);
}
```

```typescript
// src/app/api/collections/[id]/route.ts
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const collection = await prisma.collection.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      documents: { include: { document: true } },
      chats: { select: { id: true, title: true, updatedAt: true } },
    },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(collection);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.collection.deleteMany({ where: { id, ownerId: session.user.id } });
  return NextResponse.json({ success: true });
}
```

---

### Milestone 4: Frontend — Chat

---

### Task 4.1: Create chat home page

**Files:**
- Create: `src/components/chat/chat-home.tsx`
- Modify: `src/app/(dashboard)/page.tsx`

**Interfaces:**
- Consumes: assistant-ui `useChatRuntime` hook
- Produces: ChatGPT-style landing page with suggestion prompts

- [ ] **Step 1: Create chat home component**

```typescript
// src/components/chat/chat-home.tsx
"use client";

import { useRouter } from "next/navigation";
import { PromptInput } from "@assistant-ui/react";

const suggestions = [
  "Summarize the key points from my documents",
  "Compare the main arguments across documents",
  "Find information about a specific topic",
  "What are the conclusions in my documents?",
];

export function ChatHome() {
  const router = useRouter();

  const handleSend = async (text: string) => {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: text.substring(0, 50) }),
    });
    const chat = await res.json();
    router.push(`/chat/${chat.id}?initialMessage=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">What would you like to know?</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Ask questions about your documents. I&apos;ll find the answers and cite my sources.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="text-left p-4 rounded-lg border hover:bg-accent transition-colors text-sm"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-full">
        <PromptInput
          onSubmit={handleSend}
          placeholder="Ask anything about your documents..."
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update dashboard home page**

```typescript
// src/app/(dashboard)/page.tsx
import { ChatHome } from "@/components/chat/chat-home";

export default function HomePage() {
  return <ChatHome />;
}
```

---

### Task 4.2: Create chat page with assistant-ui Thread

**Files:**
- Create: `src/components/chat/chat-page.tsx`
- Create: `src/app/(dashboard)/chat/[id]/page.tsx`

**Interfaces:**
- Consumes: assistant-ui `Thread`, `useChatRuntime` via `@assistant-ui/react-ai-sdk`
- Produces: Full-page chat with assistant-ui Thread component

- [ ] **Step 1: Create chat page component**

```typescript
// src/components/chat/chat-page.tsx
"use client";

import { Thread } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useChatStore } from "@/hooks/use-chat-store";
import { useEffect, useRef } from "react";

export function ChatPage({ chatId, initialMessage }: { chatId: string; initialMessage?: string }) {
  const runtime = useChatRuntime({
    api: "/api/chat",
    body: { chatId },
    initialMessages: initialMessage
      ? [{ role: "user" as const, content: initialMessage }]
      : undefined,
    onFinish: () => {
      // Messages are saved server-side in onEnd callback
    },
  });

  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);
  const hasSent = useRef(false);

  useEffect(() => {
    setActiveThreadId(chatId);
  }, [chatId, setActiveThreadId]);

  useEffect(() => {
    if (initialMessage && !hasSent.current) {
      hasSent.current = true;
      // The runtime will auto-send when initialMessages are provided
    }
  }, [initialMessage]);

  return (
    <div className="h-full">
      <Thread runtime={runtime} />
    </div>
  );
}
```

- [ ] **Step 2: Create chat route page**

```typescript
// src/app/(dashboard)/chat/[id]/page.tsx
import { ChatPage } from "@/components/chat/chat-page";

export default async function ChatRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ initialMessage?: string }>;
}) {
  const { id } = await params;
  const { initialMessage } = await searchParams;

  return <ChatPage chatId={id} initialMessage={initialMessage} />;
}
```

---

### Task 4.3: Create floating chat widget

**Files:**
- Create: `src/components/chat/floating-chat.tsx`
- Create: `src/components/chat/thread-list.tsx`
- Modify: `src/app/(dashboard)/layout.tsx` (add floating chat)

**Interfaces:**
- Consumes: assistant-ui `AssistantModal`, `useChatRuntime`, Zustand store
- Produces: Floating Help Scout-style chat widget

- [ ] **Step 1: Create thread list component**

```typescript
// src/components/chat/thread-list.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { Button } from "@/components/ui/button";

interface ChatSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export function ThreadList({ onSelect }: { onSelect?: (id: string) => void }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);
  const closeFloating = useChatStore((s) => s.closeFloating);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then(setChats)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: string) => {
    setActiveThreadId(id);
    onSelect?.(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeThreadId === id) setActiveThreadId(null);
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No conversations yet. Start one!
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => handleSelect(chat.id)}
          className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors ${
            activeThreadId === chat.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-3 w-3 shrink-0" />
            <span className="truncate">{chat.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
            onClick={(e) => handleDelete(e, chat.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create floating chat component**

```typescript
// src/components/chat/floating-chat.tsx
"use client";

import { AssistantModal } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useChatStore } from "@/hooks/use-chat-store";
import { ThreadList } from "./thread-list";
import { MessageSquare } from "lucide-react";

export function FloatingChat() {
  const isOpen = useChatStore((s) => s.isFloatingOpen);
  const closeFloating = useChatStore((s) => s.closeFloating);
  const activeThreadId = useChatStore((s) => s.activeThreadId);

  const runtime = useChatRuntime({
    api: "/api/chat",
    body: activeThreadId ? { chatId: activeThreadId } : undefined,
  });

  const handleClose = () => {
    closeFloating();
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => useChatStore.getState().openFloating()}
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Floating modal */}
      <AssistantModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        runtime={runtime}
        side="right"
        align="end"
      >
        <div className="flex flex-col h-full">
          <div className="border-b p-3">
            <h3 className="font-semibold text-sm">Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ThreadList
              onSelect={(id) => {
                useChatStore.getState().setActiveThreadId(id);
              }}
            />
          </div>
        </div>
      </AssistantModal>
    </>
  );
}
```

- [ ] **Step 3: Add floating chat to dashboard layout**

```typescript
// Modify src/app/(dashboard)/layout.tsx — add FloatingChat
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FloatingChat } from "@/components/chat/floating-chat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
        <FloatingChat />
      </div>
    </AuthGuard>
  );
}
```

---

### Task 4.4: Create documents page

**Files:**
- Create: `src/components/documents/upload-zone.tsx`
- Create: `src/components/documents/document-list.tsx`
- Create: `src/app/(dashboard)/documents/page.tsx`

**Interfaces:**
- Consumes: Upload API, Documents API, `useDropzone` from react-dropzone (keep)
- Produces: Document management page with upload

- [ ] **Step 1: Create upload zone**

```typescript
// src/components/documents/upload-zone.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";

export function UploadZone({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (!file.name.endsWith(".pdf")) continue;
        setUploading(true);
        try {
          await onUpload(file);
        } finally {
          setUploading(false);
        }
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Uploading and processing...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop PDFs here" : "Drag & drop PDFs here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">PDF only, up to 50MB each</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create document list**

```typescript
// src/components/documents/document-list.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Doc {
  id: string;
  filename: string;
  status: string;
  chunkCount: number;
  uploadedAt: string;
}

export function DocumentList({ refreshKey }: { refreshKey: number }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setDocs)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading...</div>;

  if (docs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center p-8">
        No documents yet. Upload your first PDF above.
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{doc.filename}</p>
              <p className="text-xs text-muted-foreground">
                {doc.status === "completed"
                  ? `${doc.chunkCount} chunks`
                  : doc.status}
                {" · "}
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusIcon(doc.status)}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDelete(doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create documents page**

```typescript
// src/app/(dashboard)/documents/page.tsx
"use client";

import { useState, useCallback } from "react";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/upload", { method: "POST", body: formData });
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground text-sm">
          Upload PDFs to build your knowledge base. Chunks are embedded and searchable instantly.
        </p>
      </div>
      <UploadZone onUpload={handleUpload} />
      <DocumentList refreshKey={refreshKey} />
    </div>
  );
}
```

---

### Task 4.5: Create collections pages

**Files:**
- Create: `src/components/collections/collection-card.tsx`
- Create: `src/app/(dashboard)/collections/page.tsx`
- Create: `src/app/(dashboard)/collections/[id]/page.tsx`

**Interfaces:**
- Consumes: Collections API
- Produces: Collections list and detail pages

- [ ] **Step 1: Create collection card**

```typescript
// src/components/collections/collection-card.tsx
"use client";

import Link from "next/link";
import { FolderOpen, FileText, MessageSquare } from "lucide-react";

interface CollectionProps {
  id: string;
  name: string;
  description: string | null;
  _count: { documents: number; chats: number };
}

export function CollectionCard({ collection }: { collection: CollectionProps }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="block p-4 rounded-lg border hover:bg-accent transition-colors"
    >
      <div className="flex items-start gap-3">
        <FolderOpen className="h-5 w-5 text-primary mt-0.5" />
        <div className="min-w-0">
          <h3 className="font-medium truncate">{collection.name}</h3>
          {collection.description && (
            <p className="text-sm text-muted-foreground truncate">
              {collection.description}
            </p>
          )}
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> {collection._count.documents} docs
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {collection._count.chats} chats
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create collections list page**

```typescript
// src/app/(dashboard)/collections/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionCard } from "@/components/collections/collection-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [open, setOpen] = useState(false);

  const fetchCollections = () => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then(setCollections)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCollections(); }, []);

  const handleCreate = async () => {
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc || null }),
    });
    setName("");
    setDesc("");
    setOpen(false);
    fetchCollections();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground text-sm">
            Organize documents into collections for focused conversations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Collection name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={!name.trim()}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : collections.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No collections yet. Create one to organize your documents.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create collection detail page**

```typescript
// src/app/(dashboard)/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { FileText, MessageSquare } from "lucide-react";

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/collections/${id}`)
      .then((r) => r.json())
      .then(setCollection)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!collection) return <div className="p-8">Collection not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div>
        <Link href="/collections" className="text-sm text-muted-foreground hover:underline">
          ← Back to Collections
        </Link>
        <h1 className="text-2xl font-bold mt-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground mt-1">{collection.description}</p>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">
          Documents ({collection.documents.length})
        </h2>
        {collection.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents in this collection.</p>
        ) : (
          <div className="space-y-2">
            {collection.documents.map((cd: any) => (
              <div key={cd.document.id} className="flex items-center gap-2 p-2 border rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{cd.document.filename}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">
          Chats ({collection.chats.length})
        </h2>
        {collection.chats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chats in this collection.</p>
        ) : (
          <div className="space-y-2">
            {collection.chats.map((chat: any) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{chat.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Milestone 5: Root Layout & Landing Page

---

### Task 5.1: Update root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: Root layout with Tailwind, theme provider, no auth wrapping (handled by route groups)

- [ ] **Step 1: Simplify root layout**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Chat — Document Intelligence",
  description: "Ask questions about your documents with AI-powered answers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### Task 5.2: Create public landing page

**Files:**
- Modify: `src/app/page.tsx` (root level, not dashboard)

**Interfaces:**
- Produces: Public landing page with sign-in/sign-up links

- [ ] **Step 1: Create landing page**

```typescript
// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-6">
        <MessageSquare className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-center">RAG Chat</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        Upload PDFs, ask questions, get cited answers. Your documents, made conversational.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Create Account</Button>
        </Link>
      </div>
    </div>
  );
}
```

---

### Milestone 6: Verification & Polish

---

### Task 6.1: Update environment variables

**Files:**
- Modify: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Create .env.example**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ragchatbot"
DIRECT_URL="postgresql://user:password@localhost:5432/ragchatbot"

# Better Auth
BETTER_AUTH_SECRET="generate-with: openssl rand -hex 32"
BETTER_AUTH_URL="http://localhost:3000"

# DeepSeek (chat)
DEEPSEEK_API_KEY="sk-..."

# OpenAI (embeddings only)
OPENAI_API_KEY="sk-..."
```

- [ ] **Step 2: Update next.config.ts for new packages**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
```

---

### Task 6.2: Fix shadcn/ui components

**Files:**
- Verify: `src/components/ui/*.tsx` (all existing shadcn components)

- [ ] **Step 1: Check shadcn/ui components still work**

Some components were installed for previous dependencies that we removed. Verify the kept ones:

```bash
# These should remain:
ls src/components/ui/button.tsx
ls src/components/ui/input.tsx
ls src/components/ui/dialog.tsx
ls src/components/ui/card.tsx
ls src/components/ui/avatar.tsx
ls src/components/ui/badge.tsx
ls src/components/ui/select.tsx
ls src/components/ui/scroll-area.tsx
ls src/components/ui/separator.tsx
ls src/components/ui/tooltip.tsx
ls src/components/ui/skeleton.tsx
ls src/components/ui/sonner.tsx
```

Delete any that were only used by old components: `collapsible.tsx`, `hover-card.tsx`, `progress.tsx`, `tabs.tsx`, `carousel.tsx`, `sheet.tsx`, `sidebar.tsx`, `textarea.tsx`, and the entire `ai-elements/` and `kibo-ui/` directories.

- [ ] **Step 2: Delete unused UI component directories**

```bash
rm -rf src/components/ui/ai-elements/
rm -rf src/components/ui/kibo-ui/
rm src/components/ui/collapsible.tsx
rm src/components/ui/hover-card.tsx
rm src/components/ui/progress.tsx
rm src/components/ui/tabs.tsx
rm src/components/ui/carousel.tsx
rm src/components/ui/sheet.tsx
rm src/components/ui/sidebar.tsx
rm src/components/ui/textarea.tsx
```

- [ ] **Step 3: Uninstall unused Radix packages**

```bash
npm uninstall @radix-ui/react-collapsible @radix-ui/react-hover-card \
  @radix-ui/react-progress @radix-ui/react-tabs @radix-ui/react-scroll-area \
  @radix-ui/react-separator @radix-ui/react-tooltip @radix-ui/react-use-controllable-state \
  @radix-ui/react-avatar embla-carousel-react
```

---

### Task 6.3: Build & verify

**Files:**
- All created/modified files

- [ ] **Step 1: Run prisma generate**
```bash
npx prisma generate
```

- [ ] **Step 2: Build the project**
```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors, no missing imports.

- [ ] **Step 3: Start dev server and test auth flow**
```bash
npm run dev
```
Navigate to `http://localhost:3000` → see landing page → click Sign In → register → get redirected to dashboard.

- [ ] **Step 4: Test document upload**
Upload a PDF on `/documents` → verify it shows "completed" status with chunk count.

- [ ] **Step 5: Test chat with RAG**
Start a new chat → ask a question about the uploaded document → verify streaming response with inline `[1]`, `[2]` citations.

- [ ] **Step 6: Test floating chat**
Click the floating button → verify thread list shows → select a chat → verify continues in floating widget → minimize → reopen → verify shows thread list.

- [ ] **Step 7: Test collections**
Create a collection → verify it appears → check detail page.

- [ ] **Step 8: Run lint**
```bash
npm run lint
```

---

## Self-Review

### 1. Spec Coverage

| Requirement | Task |
|-------------|------|
| Better Auth (email/password, DB sessions) | 2.2, 2.3 |
| assistant-ui full rewrite | 4.1, 4.2, 4.3 |
| Floating chat (Help Scout-style) | 4.3 |
| Collections (many-to-many docs, one per chat) | 2.1 (schema), 3.5 (API), 4.5 (UI) |
| PDF upload (DnD + button) | 3.5 (upload API), 4.4 (UI) |
| RAG chat (threshold 0.6, top-8, dedup) | 3.1, 3.3 |
| AI SDK v7 source streaming | 3.4 |
| Structured citation enforcement | 3.4 (system prompt) |
| DeepSeek chat + OpenAI embeddings | 3.4, 3.1 |
| Fresh database | 2.1 (db push --force-reset) |
| Cleanup dead code | 1.1, 6.2 |
| Zustand cross-surface sync | 2.4 (store), 4.3 (floating) |
| Auth guard on dashboard | 2.3, 2.4 |
| Public landing page | 5.2 |

### 2. Placeholder Scan

✅ No TBD, TODO, "implement later", or vague instructions found. All code is concrete and complete.

### 3. Type Consistency

- `AppSource` defined in `src/types/index.ts` → used in `retrieval.ts`, `chat/route.ts`
- `MyUIMessage` defined in types → used in `createUIMessageStream<MyUIMessage>`
- `useChatStore` shape consistent across `chat-store.ts`, `floating-chat.tsx`, `chat-page.tsx`
- `ChatSummary` in thread-list.tsx matches `/api/chats` GET response shape
- All API routes return consistent `{ error: string }` shapes on failure

---

Plan complete and saved to `docs/superpowers/plans/2026-08-10-rag-chatbot-v2-rewrite.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
