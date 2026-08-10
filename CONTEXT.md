# Domain Glossary — RAG PDF Chatbot

## Core Concepts

### Document
A PDF file uploaded by a user. After upload, a Document is processed: text is extracted per page, chunked, embedded via Gemini (`gemini-embedding-001`, 3072-dim), and stored as `DocumentChunk` rows with pgvector indexes. A Document has a `status`: `processing`, `completed`, or `failed`.

### Document Chunk
A segment of text extracted from a Document page. Each chunk is embedded and stored in pgvector for similarity search. Chunks are ~1000 characters with 200-character overlap.

### Collection
A user-curated group of Documents. A Collection is the knowledge boundary: chats scoped to a Collection only search within that Collection's documents. Collections support member-based sharing (`CollectionMember`).

### Chat
A conversation thread with the AI assistant. Each Chat is optionally linked to a Collection (`collectionId`). When scoped to a Collection, retrieval is filtered to only documents in that Collection. When unscoped (global), retrieval searches all of the user's completed documents.

### Message
A single turn in a Chat — either `user` or `assistant` role. Assistant messages may include `sources` (citations from retrieved chunks).

### Global Chat
A Chat with `collectionId: null`. Retrieval searches across ALL of the user's completed documents.

### Collection-scoped Chat
A Chat with a `collectionId` set. Retrieval is limited to documents linked to that Collection via the `CollectionDocument` join table. Created via the "Ask this collection" input on the Collection detail page, or via the "New Chat" button on a CollectionCard.

### Source / Citation
A reference to a Document chunk used to answer a query. Displayed inline as `[N]` citations in the assistant's response, with a sources panel showing filename, page, snippet, and relevance score.

## Relationships

```
User ──< Document ──< DocumentChunk (pgvector)
User ──< Collection ──< CollectionDocument >── Document
User ──< Chat ──< Message
Collection ──< Chat (optional FK, on delete set null)
Collection ──< CollectionMember >── User
```

## Key Design Decisions

- **Collection as knowledge boundary**: Chats scoped to a Collection only retrieve from that Collection's documents. Global chats search everything.
- **Gemini embeddings**: `gemini-embedding-001` produces 3072-dimensional vectors. This replaced OpenAI's `text-embedding-ada-002` (1536-dim).
- **Chat creation with first message**: Chats are created with an initial user message that triggers the first assistant response. The `ChatHome` component handles the "type → create → redirect → respond" flow.
- **better-auth for authentication**: Email/password auth with 30-day sessions. Server-side session via `auth.api.getSession({ headers })`.
