# RAG PDF Chatbot

A powerful PDF document analysis chatbot built with Next.js, featuring Retrieval-Augmented Generation (RAG) capabilities and persistent chat history. This application allows users to upload PDF documents, extract their content, and engage in intelligent conversations with the documents using AI.

## 🎯 What is This Project?

This is a **Document Intelligence Chatbot** that transforms how you interact with PDF documents. Instead of manually searching through long documents, you can:

- Upload multiple PDF files to create a knowledge base
- Ask questions about the content in natural language
- Get accurate answers with source citations
- Maintain conversation history across multiple sessions
- View exactly which parts of your documents were referenced

Perfect for researchers, students, professionals, and anyone who needs to quickly extract information from large documents.

## 📸 Screenshots

### Home Page
![Home Page](./public/Home%20page.png)

### PDF Upload Interface
![PDF Upload](./public/PDF%20Upload.png)

### Chat Interface
![Chat Interface](./public/Chat%20page%20(initial).png)

### Conversation with Document Sources
![Chat with Sources](./public/Chat%20+%20document%20sources.png)

### Chat History Management
![Chat History](./public/Chat%20history.png)

## ✨ Key Features

- 📄 **PDF Upload & Processing**: Upload and process PDF documents with intelligent text extraction
- 🤖 **AI-Powered Chat**: Chat with your PDFs using Claude 3 Haiku for accurate responses
- 🔍 **Vector Search**: Semantic search through document content using Qdrant vector database
- 💾 **Persistent Chat History**: PostgreSQL database for storing chat sessions and messages
- 📚 **Document Sources**: See which parts of your documents the AI referenced in responses
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS and Radix UI
- 🔄 **Real-time Updates**: Live chat interface with streaming responses
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **AI/ML**: 
  - Claude 3 Haiku (Anthropic) for chat responses
  - LangChain for document processing and chunking
- **Database**: PostgreSQL with Prisma ORM
- **Vector Database**: Qdrant for semantic search and document retrieval
- **UI**: Tailwind CSS, Radix UI components, Lucide icons
- **File Processing**: PDF parsing with pdf-parse library
- **Deployment**: Vercel-ready with optimized build configuration

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (Latest LTS recommended)
- **npm** or **yarn** package manager
- **Docker** (for running Qdrant locally)
- **PostgreSQL** database (local or cloud)

### Quick Start Guide

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/rag-pdf-chatbot.git
cd rag-pdf-chatbot
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

#### 3. Set up Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ragchatbot"
DIRECT_URL="postgresql://username:password@localhost:5432/ragchatbot"

# AI Service API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Qdrant Configuration
NEXT_PUBLIC_QDRANT_URL=http://localhost:6333
NEXT_PUBLIC_QDRANT_API_KEY=your_qdrant_api_key_if_needed

# Neon Database Configuration (if using Neon)
NEON_DATABASE_URL=your_neon_database_url
NEON_DIRECT_URL=your_neon_direct_url
NEON_DATABASE_URL_UNPOOLED=your_neon_unpooled_url

# Neon Stack Auth (optional)
NEON_NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEON_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
NEON_STACK_SECRET_SERVER_KEY=your_secret_key
```

#### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

#### 5. Start Qdrant Vector Database
```bash
# Using Docker
docker run -p 6333:6333 qdrant/qdrant

# Or using Docker Compose (if you have docker-compose.yml)
docker-compose up qdrant
```

#### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📋 Detailed Setup Instructions

### Getting API Keys

1. **Anthropic API Key**:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account and generate an API key
   - Add credits to your account

### Database Configuration

#### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb ragchatbot

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://your_username@localhost:5432/ragchatbot"
```

#### Option 2: Cloud PostgreSQL (Recommended)
- **Neon**: Serverless PostgreSQL with generous free tier
- **Vercel Postgres**: Easy integration with Vercel deployment
- **Supabase**: Free tier with 500MB storage
- **PlanetScale**: MySQL-compatible option
- **Railway**: Simple PostgreSQL hosting

#### Option 3: Neon Database Setup
If you're using Neon (recommended for serverless applications):

1. **Create a Neon account**: Visit [Neon Console](https://console.neon.tech/)
2. **Create a new project** and database
3. **Get your connection strings** from the Neon dashboard
4. **Configure environment variables**:
   ```bash
   # Primary database URLs (used by Prisma)
   DATABASE_URL="your_neon_pooled_connection_string"
   DIRECT_URL="your_neon_direct_connection_string"
   
   # Additional Neon-specific variables
   NEON_DATABASE_URL="your_neon_pooled_connection_string"
   NEON_DIRECT_URL="your_neon_direct_connection_string"
   NEON_DATABASE_URL_UNPOOLED="your_neon_unpooled_connection_string"
   
   # If using Neon's Stack Auth
   NEON_NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id"
   NEON_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_publishable_key"
   NEON_STACK_SECRET_SERVER_KEY="your_secret_key"
   ```

### Vector Database Setup

#### Option 1: Local Qdrant (Development)
```bash
# Pull and run Qdrant
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant

# Verify it's running
curl http://localhost:6333/
```

#### Option 2: Qdrant Cloud (Production)
- Visit [Qdrant Cloud](https://cloud.qdrant.io/)
- Create a free cluster
- Get your API key and cluster URL

## 📖 How to Use

### 1. Upload PDF Documents
1. Navigate to the **"Upload PDFs"** tab
2. Drag and drop PDF files or click to select files
3. Wait for the processing to complete (documents are chunked and embedded)
4. You'll see a success message when processing is done

### 2. Start Chatting
1. Switch to the **"Chat Interface"** tab
2. Click **"New Chat"** to start a fresh conversation
3. Type your question about the uploaded documents
4. The AI will respond with relevant information and show source documents

### 3. Manage Chat History
- **Create new chats**: Click "New Chat" to start fresh conversations
- **Edit chat titles**: Click on any chat title to rename it
- **Delete chats**: Remove conversations you no longer need
- **View history**: Access all your previous conversations

### 4. Understanding Responses
- **AI Responses**: Get detailed answers based on your documents
- **Source References**: See which parts of your documents were used
- **Contextual Follow-ups**: Ask follow-up questions in the same chat

## 🔧 Database Management

The application uses PostgreSQL with Prisma ORM for data persistence. For Neon-specific configurations, see [NEON_CONFIGURATION.md](NEON_CONFIGURATION.md).

Available database commands:

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Apply database changes
npm run db:push

# View and edit data in Prisma Studio
npm run db:studio

# Reset database (⚠️ This will delete all data)
npm run db:reset
```

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbo
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## 🌐 API Documentation

### Chat Management Endpoints
- `GET /api/chats` - Retrieve all chat sessions
- `POST /api/chats` - Create a new chat session
- `GET /api/chats/[id]` - Get specific chat with all messages
- `PUT /api/chats/[id]` - Update chat title
- `DELETE /api/chats/[id]` - Delete chat and all messages

### Document Processing Endpoints
- `POST /api/upload` - Upload and process PDF documents
- `POST /api/chat` - Send message and receive AI response

### Vector Database Endpoints
- `POST /api/qdrant` - Perform Qdrant vector operations

## 📁 Project Structure

```
rag-pdf-chatbot/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── *.png                  # Screenshot images
│   └── *.svg                  # Icon assets
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # Chat API endpoint
│   │   │   ├── chats/         # Chat management
│   │   │   ├── qdrant/        # Vector search
│   │   │   └── upload/        # PDF upload
│   │   ├── chats/[id]/        # Dynamic chat pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── chat-interface.tsx # Main chat component
│   │   ├── chat-sidebar.tsx   # Chat history sidebar
│   │   └── pdf-upload.tsx     # PDF upload component
│   └── lib/
│       ├── database.ts        # Database operations
│       ├── document-processor.ts # PDF processing
│       ├── neon-config.ts     # Neon database configuration
│       ├── qdrant.ts          # Vector database client
│       └── utils.ts           # Utility functions
├── .env.local                 # Environment variables
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🔍 How It Works

### 1. Document Processing Pipeline
```
PDF Upload → Text Extraction → Text Chunking → Vector Embedding → Qdrant Storage
```

### 2. Chat Flow
```
User Question → Vector Search → Context Retrieval → AI Processing → Response + Sources
```

### 3. Data Flow
- **PDFs** are processed using `pdf-parse` to extract text
- **Text chunks** are created using LangChain's text splitters
- **Embeddings** are generated using the configured embedding model
- **Vector search** retrieves relevant chunks from Qdrant
- **AI responses** are generated using Claude 3 Haiku with retrieved context
- **Chat history** is stored in PostgreSQL with Prisma ORM

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Fork this repository** to your GitHub account

2. **Set up databases**:
   - Create a PostgreSQL database (Vercel Postgres, Supabase, etc.)
   - Set up Qdrant Cloud instance

3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

4. **Configure environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_QDRANT_URL`
   - `NEXT_PUBLIC_QDRANT_API_KEY`
   - `NEON_DATABASE_URL` (if using Neon)
   - `NEON_DIRECT_URL` (if using Neon)
   - Additional Neon variables as needed

5. **Run database migrations**:
   ```bash
   npx prisma db push
   ```

### Deploy to Other Platforms

The application is compatible with:
- **Netlify**
- **Railway**
- **Render**
- **DigitalOcean App Platform**

## 🔧 Customization

### Adding New AI Models
Modify `src/lib/chat.ts` to integrate different AI providers:
- OpenAI GPT models
- Google Gemini
- Mistral AI
- Local models via Ollama

### Custom Document Types
Extend `src/lib/document-processor.ts` to support:
- Word documents (.docx)
- PowerPoint presentations (.pptx)
- Text files (.txt, .md)
- Web pages (HTML)

### UI Customization
- Modify `src/app/globals.css` for custom styling
- Update `components/ui/` for component changes
- Configure `tailwind.config.js` for theme customization

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check your DATABASE_URL format
   # For PostgreSQL: postgresql://username:password@host:port/database
   ```

2. **Qdrant Connection Failed**
   ```bash
   # Verify Qdrant is running
   curl http://localhost:6333/
   ```

3. **API Key Issues**
   ```bash
   # Check .env.local file exists and has correct keys
   # Verify API keys are valid and have sufficient credits
   ```

4. **PDF Processing Errors**
   ```bash
   # Ensure PDF files are not corrupted
   # Check file size limits (default: 10MB)
   ```

### Performance Optimization

- **Database**: Use connection pooling for production
- **Vector Search**: Optimize chunk size and overlap
- **API Responses**: Implement response caching
- **File Upload**: Add progress indicators and validation

## 📈 Roadmap

- [ ] **Multi-user Support**: User authentication and authorization
- [ ] **Advanced Analytics**: Usage statistics and insights
- [ ] **API Rate Limiting**: Prevent abuse and manage costs
- [ ] **Real-time Collaboration**: Shared chat sessions
- [ ] **Mobile App**: React Native companion app
- [ ] **Bulk Document Processing**: Handle large document sets
- [ ] **Advanced Search**: Filtering and sorting capabilities
- [ ] **Export Features**: PDF/Word report generation

## 🤝 Contributing

We welcome contributions to make this project better! Here's how you can help:

### Getting Started with Development

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Set up your development environment** (see Getting Started section)
5. **Make your changes** and test them thoroughly
6. **Commit your changes**: `git commit -m 'Add some amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR
- Write clear commit messages

### Areas for Contribution

- 🐛 **Bug Fixes**: Report and fix issues
- ✨ **New Features**: Add new capabilities
- 📚 **Documentation**: Improve guides and examples
- 🎨 **UI/UX**: Enhance the user interface
- 🔧 **Performance**: Optimize existing functionality
- 🧪 **Testing**: Add and improve test coverage

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 RAG PDF Chatbot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **[Anthropic](https://www.anthropic.com/)** for Claude AI
- **[Qdrant](https://qdrant.tech/)** for vector database
- **[Vercel](https://vercel.com/)** for deployment platform
- **[Prisma](https://prisma.io/)** for database ORM
- **[LangChain](https://langchain.com/)** for document processing
- **[Radix UI](https://www.radix-ui.com/)** for UI components

## 📞 Support

If you have questions or need help:

1. **Check the documentation** in this README
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** discussions

---

**⭐ Star this repository** if you find it useful! It helps others discover the project.

**🔗 Share with others** who might benefit from this tool.

**📢 Follow for updates** on new features and improvements.

---

Built with ❤️ by the open-source community
