# RAG PDF Chatbot

A powerful PDF document analysis chatbot built with Next.js, featuring Retrieval-Augmented Generation (RAG) capabilities and persistent chat history.

## Features

- 📄 **PDF Upload & Processing**: Upload and process PDF documents with text extraction
- 🤖 **AI-Powered Chat**: Chat with your PDFs using Claude 3 Haiku
- 🔍 **Vector Search**: Semantic search through document content using Qdrant
- 💾 **Persistent Chat History**: SQLite database for storing chat sessions and messages
- 📚 **Document Sources**: See which parts of your documents the AI referenced
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS and Radix UI

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **AI/ML**: 
  - Claude 3 Haiku (Anthropic)
  - Cohere embeddings for vector search
  - LangChain for document processing
- **Database**: SQLite with better-sqlite3
- **Vector Database**: Qdrant for semantic search
- **UI**: Tailwind CSS, Radix UI, Lucide icons
- **File Processing**: PDF parsing with pdf-parse

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Qdrant server (for vector search)

### Environment Setup

1. Clone the repository
```bash
git clone <repository-url>
cd rag-pdf-chatbot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```bash
# AI Service API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
COHERE_API_KEY=your_cohere_api_key

# Qdrant Configuration
NEXT_PUBLIC_QDRANT_URL=http://localhost:6333
NEXT_PUBLIC_QDRANT_API_KEY=your_NEXT_PUBLIC_QDRANT_API_KEY_if_needed
```

4. Start Qdrant server (if running locally)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Management

The application uses SQLite for persistent storage. Database utilities are available:

```bash
# Test database setup
npm run db:test

# View database statistics
npm run db:stats

# Create database backup
npm run db:backup

# Export data to JSON
npm run db:export

# Clean up empty chats
npm run db:clean

# Add sample data for testing
npm run db:sample
```

For detailed database information, see [DATABASE.md](DATABASE.md).

## Usage

### 1. Upload PDFs
- Click "Upload PDFs" tab
- Drag and drop or select PDF files
- Wait for processing and vector embedding

### 2. Chat with Documents
- Switch to "Chat Interface" tab  
- Start a new chat or select from chat history
- Ask questions about your uploaded documents
- View source references for AI responses

### 3. Manage Chat History
- Create new chat sessions
- Edit chat titles
- Delete old conversations
- View message history with timestamps

## API Endpoints

### Chat Management
- `GET /api/chats` - List all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[id]` - Get chat with messages
- `PUT /api/chats/[id]` - Update chat title
- `DELETE /api/chats/[id]` - Delete chat

### Document Processing
- `POST /api/upload` - Upload and process PDFs
- `POST /api/chat` - Send message and get AI response

### Vector Database
- `POST /api/qdrant` - Qdrant operations

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/
│   ├── ui/           # Reusable UI components
│   ├── chat-interface.tsx
│   ├── chat-sidebar.tsx
│   └── pdf-upload.tsx
└── lib/
    ├── database.ts    # SQLite database service
    ├── document-processor.ts  # PDF processing
    ├── qdrant.ts      # Vector database
    └── utils.ts       # Utilities
```

## Development Tools

- **Database Scripts**: Located in `scripts/` directory
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint configuration
- **Styling**: Tailwind CSS with custom components

## Migration to Separate Backend

This is designed as a proof of concept. For production:

1. **Database**: Migrate from SQLite to PostgreSQL/MySQL
2. **Authentication**: Add user management
3. **API**: Separate backend service
4. **Scaling**: Connection pooling and optimization
5. **Security**: Add authentication and authorization

See [DATABASE.md](DATABASE.md) for migration guidance.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
