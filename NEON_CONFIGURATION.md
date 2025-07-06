# Neon Database Configuration

This document explains how to configure and use Neon database services in the RAG PDF Chatbot project.

## Environment Variables

### Primary Database Variables
These are used by Prisma and should always be set:
```bash
DATABASE_URL="your_neon_pooled_connection_string"
DIRECT_URL="your_neon_direct_connection_string"
```

### Neon-Specific Variables
These provide additional configuration options for Neon services:
```bash
# Database URLs with different connection types
NEON_DATABASE_URL="your_neon_pooled_connection_string"
NEON_DIRECT_URL="your_neon_direct_connection_string"
NEON_DATABASE_URL_UNPOOLED="your_neon_unpooled_connection_string"

# Connection parameters
NEON_PGHOST="your_neon_host"
NEON_PGHOST_UNPOOLED="your_neon_unpooled_host"
NEON_PGUSER="your_neon_user"
NEON_PGDATABASE="your_neon_database"
NEON_PGPASSWORD="your_neon_password"

# Additional PostgreSQL URLs
NEON_POSTGRES_URL="your_neon_postgres_url"
NEON_POSTGRES_URL_NON_POOLING="your_neon_postgres_url_non_pooling"
NEON_POSTGRES_URL_NO_SSL="your_neon_postgres_url_no_ssl"
NEON_POSTGRES_PRISMA_URL="your_neon_postgres_prisma_url"

# Stack Auth (optional)
NEON_NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id"
NEON_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_publishable_key"
NEON_STACK_SECRET_SERVER_KEY="your_secret_key"
```

## Connection Types

### Pooled Connection (Default)
- **Best for**: Regular application queries
- **Environment Variable**: `NEON_DATABASE_URL` or `DATABASE_URL`
- **Benefits**: Connection pooling, better performance for concurrent requests

### Direct Connection
- **Best for**: Database migrations, schema changes
- **Environment Variable**: `NEON_DIRECT_URL` or `DIRECT_URL`
- **Benefits**: Direct database access, no connection pooling overhead

### Unpooled Connection
- **Best for**: Batch operations, long-running queries
- **Environment Variable**: `NEON_DATABASE_URL_UNPOOLED`
- **Benefits**: No connection limits, suitable for data processing

## Usage Examples

### Basic Configuration
```typescript
import { neonConfig } from '@/lib/neon-config';

// Check if Neon is configured
if (neonConfig.isConfigured()) {
  console.log('Neon database is configured');
}

// Get appropriate connection string
const connectionString = neonConfig.getConnectionString('pooled');
```

### Advanced Usage
```typescript
import { neonUtils } from '@/lib/neon-utils';

// Get database URL for specific operations
const migrationUrl = neonUtils.getDatabaseUrl('migration');
const queryUrl = neonUtils.getDatabaseUrl('query');
const batchUrl = neonUtils.getDatabaseUrl('batch');

// Check service availability
const services = neonUtils.checkNeonServices();
console.log('Services available:', services);
```

### Stack Auth Integration
```typescript
import { neonConfig } from '@/lib/neon-config';

// Check if Stack Auth is configured
if (neonConfig.isStackAuthConfigured()) {
  const stackConfig = {
    projectId: neonConfig.stackAuth.projectId,
    publishableClientKey: neonConfig.stackAuth.publishableClientKey,
  };
  // Initialize Stack Auth with config
}
```

## Best Practices

1. **Use Pooled Connections**: For most application queries, use the pooled connection
2. **Direct Connections for Migrations**: Use direct connections for database schema changes
3. **Environment-Specific Configuration**: Use different connection strings for development/production
4. **Security**: Never expose secret keys in client-side code
5. **Connection Monitoring**: Monitor connection usage in production

## Migration from Standard PostgreSQL

If you're migrating from a standard PostgreSQL setup:

1. **Keep existing variables**: `DATABASE_URL` and `DIRECT_URL` still work
2. **Add Neon-specific variables**: For additional features and connection types
3. **Update deployment**: Configure new environment variables in your deployment platform
4. **Test thoroughly**: Ensure all connection types work in your environment

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` and `DIRECT_URL` are correctly formatted
- Check that Neon project is active and not suspended
- Ensure SSL is enabled (`sslmode=require`)

### Performance Issues
- Use pooled connections for concurrent queries
- Use unpooled connections for batch operations
- Monitor connection usage in Neon dashboard

### Stack Auth Issues
- Verify all three Stack Auth variables are set
- Check project ID matches your Neon project
- Ensure keys are not expired or revoked

## Support

For Neon-specific issues:
- Visit [Neon Documentation](https://neon.tech/docs)
- Check [Neon Community](https://neon.tech/community)
- Review [Neon Status Page](https://neon.tech/status)

For project-specific issues:
- Check the main README.md
- Review the troubleshooting section
- Create an issue in the project repository
