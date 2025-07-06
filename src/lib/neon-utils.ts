// Example usage of Neon configuration
// This file demonstrates how to use the Neon-specific environment variables

import { neonConfig } from './neon-config';

// Example: Using different connection types for different operations

export function getDatabaseUrl(operation: 'migration' | 'query' | 'batch' = 'query') {
  switch (operation) {
    case 'migration':
      // Use direct connection for migrations
      return neonConfig.getConnectionString('direct');
    case 'batch':
      // Use unpooled connection for batch operations
      return neonConfig.getConnectionString('unpooled');
    case 'query':
    default:
      // Use pooled connection for regular queries
      return neonConfig.getConnectionString('pooled');
  }
}

// Example: Check if specific services are configured
export function checkNeonServices() {
  return {
    database: neonConfig.isConfigured(),
    stackAuth: neonConfig.isStackAuthConfigured(),
    config: {
      hasUnpooledConnection: !!neonConfig.database.unpooledUrl,
      hasStackAuth: neonConfig.isStackAuthConfigured(),
    }
  };
}

// Example: Get Stack Auth configuration for client-side usage
export function getStackAuthConfig() {
  if (!neonConfig.isStackAuthConfigured()) {
    return null;
  }

  return {
    projectId: neonConfig.stackAuth.projectId,
    publishableClientKey: neonConfig.stackAuth.publishableClientKey,
    // Note: Never expose secret key on client side
  };
}

// Example: Environment-specific database configuration
export function getNeonConnectionInfo() {
  const info = {
    environment: process.env.NODE_ENV,
    hasNeonConfig: neonConfig.isConfigured(),
    connectionType: 'unknown',
    host: neonConfig.postgres.host,
    database: neonConfig.postgres.database,
  };

  if (neonConfig.database.url) {
    info.connectionType = 'pooled';
  } else if (neonConfig.database.directUrl) {
    info.connectionType = 'direct';
  }

  return info;
}

const neonUtils = {
  getDatabaseUrl,
  checkNeonServices,
  getStackAuthConfig,
  getNeonConnectionInfo,
};

export default neonUtils;
