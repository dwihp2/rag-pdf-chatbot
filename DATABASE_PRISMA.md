# Prisma + Supabase Database Setup

This project now uses **Prisma** as the ORM with **Supabase (PostgreSQL)** as the database backend.

## Database Setup Complete ✅

### Current Configuration
- **ORM**: Prisma Client
- **Database**: Supabase PostgreSQL
- **Connection**: Connection pooling via Supabase
- **Schema**: Chat and Message models with proper relations

### Database Schema

#### `Chat` Model
```prisma
model Chat {
  id        String   @id @default(cuid())
  title     String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  messages Message[]
  
  @@map("chats")
}
```

#### `Message` Model
```prisma
model Message {
  id        String   @id @default(cuid())
  chatId    String   @map("chat_id")
  role      Role
  content   String
  sources   Json?    // JSON field for storing source documents
  createdAt DateTime @default(now()) @map("created_at")
  
  chat Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
  
  @@map("messages")
}

enum Role {
  user
  assistant
}
```

### API Endpoints

All existing API endpoints remain the same:

- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[id]` - Get chat with messages
- `PUT /api/chats/[id]` - Update chat title
- `DELETE /api/chats/[id]` - Delete chat
- `POST /api/chat` - Send message and get AI response

### Database Service

The new `DatabaseService` in `src/lib/database.ts` provides:

- **Async Operations**: All methods are now async
- **Type Safety**: Full TypeScript support with Prisma types
- **Auto Relations**: Automatic handling of foreign keys and relations
- **JSON Fields**: Native JSON support for sources
- **Connection Pooling**: Optimized for serverless environments

### Key Changes from SQLite

1. **Async/Await**: All database operations are now async
2. **JSON Native Support**: Sources field is now native JSON instead of string
3. **Auto Timestamps**: `@updatedAt` automatically handles timestamp updates
4. **CUID IDs**: Using Prisma's CUID for better distributed ID generation
5. **Type Safety**: Better TypeScript integration with generated types

### Environment Variables

Required in `.env`:
```bash
DATABASE_URL="your-supabase-pooled-connection-string"
DIRECT_URL="your-supabase-direct-connection-string"
```

### Development Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# View database in Prisma Studio
npx prisma studio

# Reset database (if needed)
npx prisma db push --force-reset
```

### Migration from SQLite

The migration has been completed:

- ✅ SQLite files and dependencies removed
- ✅ Prisma schema created and pushed to Supabase
- ✅ Database service rewritten for Prisma
- ✅ API routes updated to use async operations
- ✅ Type definitions updated for JSON fields

### Benefits of Prisma + Supabase

1. **Scalability**: PostgreSQL handles concurrent users better than SQLite
2. **Real-time**: Supabase provides real-time subscriptions (future feature)
3. **Type Safety**: Prisma generates types automatically
4. **Performance**: Connection pooling and optimized queries
5. **Features**: Advanced PostgreSQL features (JSON, arrays, etc.)
6. **Deployment**: Works seamlessly with Vercel and other platforms

### Production Ready

This setup is production-ready and includes:

- Connection pooling for serverless functions
- Proper error handling and logging
- Type-safe database operations
- Optimized schema with proper indexes
- Graceful connection management

The application is now ready for deployment and can handle production workloads with proper database management through Supabase.
