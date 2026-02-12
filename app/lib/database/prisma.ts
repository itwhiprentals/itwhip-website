// app/lib/database/prisma.ts
// Serverless-compatible Prisma client for Vercel/Neon

import { PrismaClient } from '@prisma/client'

// ============================================================================
// PRISMA CLIENT SINGLETON (Serverless Compatible)
// ============================================================================

// Append connection pool params to DATABASE_URL if not already set
function getPooledUrl(): string {
  const base = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || ''
  const url = new URL(base)
  // Increase pool size from default 5 → 10 (Neon free tier supports up to 100)
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', '10')
  }
  // Increase pool timeout from default 10s → 20s
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '20')
  }
  return url.toString()
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: getPooledUrl(),
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
