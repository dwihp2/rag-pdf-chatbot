// Configuration file for Neon database and related services
// This file centralizes all Neon-related environment variables

export const neonConfig = {
  // Database URLs
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    unpooledUrl: process.env.NEON_DATABASE_URL_UNPOOLED,
  },

  // PostgreSQL connection parameters
  postgres: {
    host: process.env.NEON_PGHOST,
    hostUnpooled: process.env.NEON_PGHOST_UNPOOLED,
    user: process.env.NEON_PGUSER,
    database: process.env.NEON_PGDATABASE,
    password: process.env.NEON_PGPASSWORD,

    // Formatted URLs for different use cases
    url: process.env.NEON_POSTGRES_URL,
    urlNonPooling: process.env.NEON_POSTGRES_URL_NON_POOLING,
    urlNoSSL: process.env.NEON_POSTGRES_URL_NO_SSL,
    prismaUrl: process.env.NEON_POSTGRES_PRISMA_URL,
  },

  // Stack Auth configuration (if using Neon's Stack Auth)
  stackAuth: {
    projectId: process.env.NEXT_PUBLIC_NEON_STACK_PROJECT_ID,
    publishableClientKey: process.env.NEXT_PUBLIC_NEON_STACK_PUBLISHABLE_CLIENT_KEY,
    secretServerKey: process.env.NEON_STACK_SECRET_SERVER_KEY,
  },

  // Helper functions to get the appropriate connection string
  getConnectionString: (type: 'pooled' | 'direct' | 'unpooled' = 'pooled') => {
    switch (type) {
      case 'direct':
        return process.env.DIRECT_URL;
      case 'unpooled':
        return process.env.NEON_DATABASE_URL_UNPOOLED;
      case 'pooled':
      default:
        return process.env.DATABASE_URL;
    }
  },

  // Check if Neon configuration is available
  isConfigured: () => {
    return !!(process.env.DATABASE_URL);
  },

  // Check if Stack Auth is configured
  isStackAuthConfigured: () => {
    return !!(
      process.env.NEXT_PUBLIC_NEON_STACK_PROJECT_ID &&
      process.env.NEXT_PUBLIC_NEON_STACK_PUBLISHABLE_CLIENT_KEY &&
      process.env.NEON_STACK_SECRET_SERVER_KEY
    );
  },
};

export default neonConfig;
