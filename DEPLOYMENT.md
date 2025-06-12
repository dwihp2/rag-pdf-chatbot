# Deployment Guide - Vercel + Prisma + Supabase

## Prerequisites

1. **Supabase Project**: Ensure your Supabase project is set up and running
2. **Environment Variables**: Have your database connection strings ready
3. **Vercel Account**: Connected to your GitHub repository

## Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

```bash
DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
DIRECT_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Your other environment variables
OPENAI_API_KEY="your-openai-api-key"
NEXT_PUBLIC_QDRANT_URL="your-qdrant-url"
NEXT_PUBLIC_QDRANT_API_KEY="your-qdrant-api-key"
# ... other vars from .env.local
```

## Deployment Steps

### 1. Automatic Deployment via GitHub

1. Push your code to GitHub
2. Connect repository to Vercel
3. Vercel will automatically:
   - Run `npm install && prisma generate` (install command)
   - Run `prisma generate && next build` (build command)
   - Deploy your application

### 2. Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts and set environment variables
```

## Prisma Configuration for Vercel

The following configurations ensure Prisma works correctly on Vercel:

### 1. Package.json Scripts
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 2. Vercel.json Configuration
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install && prisma generate"
}
```

### 3. Database Service (Global Prisma Instance)
```typescript
// Optimized for serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Database Migration

### Initial Setup
```bash
# Push schema to Supabase (run locally)
npx prisma db push

# Generate client
npx prisma generate
```

### Schema Changes
```bash
# After modifying schema.prisma
npx prisma db push

# Commit and push to trigger Vercel deployment
git add .
git commit -m "Update database schema"
git push
```

## Troubleshooting

### Common Issues

1. **"Prisma Client not generated"**
   - Solution: Ensure `postinstall` script runs `prisma generate`
   - Check environment variables are set correctly

2. **"Cannot connect to database"**
   - Verify `DATABASE_URL` and `DIRECT_URL` are correct
   - Ensure Supabase project is running
   - Check if database exists

3. **"Build failed"**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `dependencies` not `devDependencies`

### Debug Commands

```bash
# Test build locally
npm run build

# Test Prisma connection
npx prisma db push

# View generated client
npx prisma studio

# Check environment variables
npx prisma --version
```

## Performance Optimization

### Connection Pooling
- Using pooled connection (`DATABASE_URL`) for app
- Using direct connection (`DIRECT_URL`) for migrations
- Global Prisma instance prevents connection exhaustion

### Vercel Specific
- Functions automatically scale with traffic
- Database connections are managed efficiently
- Cold starts are minimized with global instance

## Security

### Environment Variables
- Never commit `.env` files
- Use Vercel environment variables
- Separate development and production databases

### Database Security
- Use Supabase Row Level Security (RLS) if needed
- Limit database user permissions
- Enable SSL connections (already configured)

## Monitoring

### Vercel Analytics
- Monitor function performance
- Track deployment success/failures
- Review build logs

### Supabase Monitoring
- Database performance metrics
- Connection pool usage
- Query performance

Your application is now ready for production deployment on Vercel with Prisma and Supabase!
