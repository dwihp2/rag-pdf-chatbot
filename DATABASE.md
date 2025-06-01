# SQLite Database Setup for RAG PDF Chatbot

This document describes the SQLite database setup for managing chat history and messages in the RAG PDF Chatbot application.

## Database Overview

The application uses **SQLite** with the `better-sqlite3` library for local data persistence. This provides a simple, file-based database solution perfect for a proof of concept before moving to a separate backend.

### Database File
- **Location**: `chat_history.db` (in project root)
- **Type**: SQLite database file
- **Access**: Synchronous operations using better-sqlite3

## Database Schema

### Tables

#### `chats` Table
Stores chat session information.

```sql
CREATE TABLE chats (
  id TEXT PRIMARY KEY,              -- UUID for chat session
  title TEXT NOT NULL,              -- Chat title (auto-generated or custom)
  created_at TEXT NOT NULL,         -- ISO timestamp of creation
  updated_at TEXT NOT NULL          -- ISO timestamp of last update
);
```

#### `messages` Table
Stores individual messages within chat sessions.

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,              -- UUID for message
  chat_id TEXT NOT NULL,            -- Foreign key to chats.id
  role TEXT NOT NULL,               -- 'user' or 'assistant'
  content TEXT NOT NULL,            -- Message content
  sources TEXT,                     -- JSON string of source documents (optional)
  created_at TEXT NOT NULL,         -- ISO timestamp of creation
  FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
);
```

### Indexes
For optimal query performance:
- `idx_messages_chat_id` on `messages.chat_id`
- `idx_messages_created_at` on `messages.created_at`
- `idx_chats_updated_at` on `chats.updated_at`

## API Endpoints

### Chat Management
- `GET /api/chats` - Get all chats (ordered by updated_at DESC)
- `POST /api/chats` - Create new chat
- `DELETE /api/chats?id={chatId}` - Delete chat by ID

### Individual Chat Operations
- `GET /api/chats/[id]` - Get chat with all messages
- `PUT /api/chats/[id]` - Update chat title
- `DELETE /api/chats/[id]` - Delete specific chat

### Chat Messages
- `POST /api/chat` - Send message and get AI response
  - Automatically saves user and assistant messages
  - Includes source document references
  - Auto-generates chat titles from first user message

## Features

### Chat Management
- ✅ Create new chat sessions
- ✅ Load chat history
- ✅ Edit chat titles
- ✅ Delete chats (cascades to messages)
- ✅ Auto-generate titles from first message

### Message Management
- ✅ Store user and assistant messages
- ✅ Include source document references
- ✅ Maintain conversation order
- ✅ Timestamp tracking

### Database Operations
- ✅ Automatic table creation
- ✅ Foreign key constraints
- ✅ Cascade deletions
- ✅ Performance indexes
- ✅ Graceful connection handling

## Usage Examples

### Creating a New Chat
```javascript
const response = await fetch('/api/chats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'My New Chat' })
});
const { chat } = await response.json();
```

### Loading Chat History
```javascript
const response = await fetch('/api/chats');
const { chats } = await response.json();
```

### Getting Chat Messages
```javascript
const response = await fetch(`/api/chats/${chatId}`);
const { chat, messages } = await response.json();
```

### Sending a Message
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    chatId: 'chat-id-here'
  })
});
```

## Development Tools

### Test Database Setup
```bash
node scripts/test-db.js
```

### View Database Contents
```bash
sqlite3 chat_history.db ".tables"
sqlite3 chat_history.db "SELECT * FROM chats;"
sqlite3 chat_history.db "SELECT * FROM messages;"
```

### Reset Database
```bash
rm chat_history.db  # Delete database file
# Tables will be recreated on next app start
```

## Database Service

The `DatabaseService` class in `src/lib/database.ts` provides:

- **Connection Management**: Singleton pattern with graceful shutdown
- **CRUD Operations**: Full create, read, update, delete operations
- **Helper Methods**: Chat title generation, statistics, maintenance
- **Error Handling**: Robust error handling and logging
- **Type Safety**: Full TypeScript interfaces

## Migration Path

When ready to move to a separate backend:

1. **Export Data**: Use database export tools or custom scripts
2. **API Migration**: The existing API structure can be adapted
3. **Schema Migration**: Current schema is PostgreSQL/MySQL compatible
4. **Authentication**: Add user management and session handling
5. **Scaling**: Implement connection pooling and optimization

## Security Considerations

Current setup is suitable for development/proof of concept:
- No authentication (single-user)
- Local file storage
- No encryption at rest
- No access controls

For production deployment, consider:
- User authentication and authorization
- Database encryption
- Access logging
- Backup strategies
- Multi-tenancy support

## Performance

Current capacity (SQLite limitations):
- **Concurrent Users**: Single user (file locking)
- **Database Size**: Up to ~280 TB (theoretical)
- **Concurrent Reads**: Multiple readers supported
- **Concurrent Writes**: Serialized (one at a time)

For higher concurrency needs, migrate to PostgreSQL/MySQL with connection pooling.
