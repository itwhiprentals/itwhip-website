// app/lib/database/prisma.ts
// Serverless-compatible Prisma client for Vercel/Neon

import { PrismaClient } from '@prisma/client'

// ============================================================================
// PRISMA CLIENT SINGLETON (Serverless Compatible)
// ============================================================================

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        // Use pooled connection for serverless environments (handles idle connection lifecycle)
        url: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
      },
    },
  })
}

// ============================================================================
// GLOBAL TYPE DECLARATION
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: undefined | ReturnType<typeof prismaClientSingleton>
}

// ============================================================================
// PRISMA INSTANCE (Lazy initialization for serverless)
// ============================================================================

// Schema version - bump this after running migrations to force client refresh in dev
const SCHEMA_VERSION = '2026-01-23-email-logs'

// In development, check if schema version changed and recreate client if needed
const needsRefresh = process.env.NODE_ENV !== 'production' &&
  globalThis.__prismaClient &&
  (globalThis as any).__prismaSchemaVersion !== SCHEMA_VERSION

if (needsRefresh && globalThis.__prismaClient) {
  globalThis.__prismaClient.$disconnect()
  globalThis.__prismaClient = undefined
}

const prisma = globalThis.__prismaClient ?? prismaClientSingleton()

// Cache in development to prevent connection exhaustion during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma
  ;(globalThis as any).__prismaSchemaVersion = SCHEMA_VERSION
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  latency: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      connected: true,
      latency: Date.now() - startTime
    }
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default prisma
export { prisma }
