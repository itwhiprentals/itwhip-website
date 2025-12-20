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
  })
}

// ============================================================================
// GLOBAL TYPE DECLARATION
// ============================================================================

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// ============================================================================
// PRISMA INSTANCE (Lazy initialization for serverless)
// ============================================================================

const prisma = globalThis.prisma ?? prismaClientSingleton()

// Cache in development to prevent connection exhaustion during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
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
