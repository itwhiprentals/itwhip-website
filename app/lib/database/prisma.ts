// app/lib/database/prisma.ts
// Production-grade database connection manager with connection pooling,
// retry logic, query optimization, and monitoring

import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONNECTION_LIMIT = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10')
const QUERY_TIMEOUT = parseInt(process.env.DATABASE_QUERY_TIMEOUT || '10000')
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // milliseconds

// Development logging configuration
const LOG_CONFIG: Prisma.LogLevel[] = 
  process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: LOG_CONFIG,
    errorFormat: 'pretty',
    datasources: {
      db: {
        // Use pooled connection for Neon (better performance)
        url: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
      },
    },
  })

  // Add middleware for query optimization and monitoring
  // Wrapped in try-catch for compatibility
  try {
    client.$use(async (params, next) => {
      const before = Date.now()
      
      try {
        // Add timeout to all queries
        const result = await Promise.race([
          next(params),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
          )
        ])
        
        const after = Date.now()
        const duration = after - before
        
        // Log slow queries in production
        if (duration > 1000 && process.env.NODE_ENV === 'production') {
          console.warn(`⚠️ Slow query detected (${duration}ms):`, {
            model: params.model,
            action: params.action,
            duration: `${duration}ms`
          })
        }
        
        return result
      } catch (error) {
        const after = Date.now()
        console.error(`❌ Query failed after ${after - before}ms:`, {
          model: params.model,
          action: params.action,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    })

    // Add middleware for soft deletes (if needed)
    client.$use(async (params, next) => {
      // Handle soft deletes for specific models
      if (params.model === 'User' || params.model === 'Hotel') {
        if (params.action === 'delete') {
          // Change delete to update with deleted flag
          params.action = 'update'
          params.args['data'] = { deletedAt: new Date() }
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany'
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date()
          } else {
            params.args['data'] = { deletedAt: new Date() }
          }
        }
      }
      return next(params)
    })

    // Add production metrics middleware
    if (process.env.NODE_ENV === 'production') {
      client.$use(async (params, next) => {
        queryCount++
        
        try {
          const result = await next(params)
          return result
        } catch (error) {
          errorCount++
          throw error
        }
      })
    }
  } catch (error) {
    console.warn('⚠️ Prisma middleware not supported in this environment, continuing without middleware')
  }

  return client
}

// ============================================================================
// GLOBAL TYPE DECLARATION
// ============================================================================

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
  var prismaConnectionCount: number
}

// ============================================================================
// PRISMA INSTANCE
// ============================================================================

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

let isConnected = false
let connectionAttempts = 0

async function connectWithRetry(retries = MAX_RETRIES): Promise<void> {
  try {
    connectionAttempts++
    await prisma.$connect()
    isConnected = true
    
    // Verify connection
    await prisma.$queryRaw`SELECT 1`
    
    console.log('✅ Database connected successfully', {
      attempt: connectionAttempts,
      pool_size: CONNECTION_LIMIT,
      timeout: `${QUERY_TIMEOUT}ms`,
      using_pooled: !!process.env.DATABASE_URL_POOLED
    })
    
    // Reset attempts on success
    connectionAttempts = 0
  } catch (error) {
    console.error(`❌ Database connection failed (attempt ${connectionAttempts}/${MAX_RETRIES}):`, 
      error instanceof Error ? error.message : 'Unknown error'
    )
    
    if (retries > 0) {
      console.log(`⏳ Retrying connection in ${RETRY_DELAY}ms...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      await connectWithRetry(retries - 1)
    } else {
      throw new Error('Failed to connect to database after maximum retries')
    }
  }
}

// Initialize connection on module load
if (process.env.NODE_ENV !== 'test') {
  connectWithRetry().catch(error => {
    console.error('💀 Fatal: Could not establish database connection:', error)
    // Don't exit in serverless/edge environments
    if (process.env.NODE_ENV === 'development') {
      process.exit(1)
    }
  })
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
// TRANSACTION HELPER
// ============================================================================

export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number
    timeout?: number
    isolationLevel?: Prisma.TransactionIsolationLevel
  }
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: options?.maxWait ?? 5000,
    timeout: options?.timeout ?? 10000,
    isolationLevel: options?.isolationLevel ?? 'ReadCommitted'
  })
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

// Batch operations for better performance
export async function batchCreate<T>(
  model: string,
  data: any[],
  chunkSize = 100
): Promise<void> {
  const chunks = []
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }
  
  for (const chunk of chunks) {
    await (prisma as any)[model].createMany({
      data: chunk,
      skipDuplicates: true
    })
  }
}

// Pagination helper
export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: any
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function paginate<T>(
  model: string,
  params: PaginationParams & { where?: any },
): Promise<PaginatedResult<T>> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const skip = (page - 1) * limit
  
  const [data, total] = await Promise.all([
    (prisma as any)[model].findMany({
      where: params.where,
      orderBy: params.orderBy,
      skip,
      take: limit,
    }),
    (prisma as any)[model].count({
      where: params.where,
    }),
  ])
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}

// ============================================================================
// CLEANUP & SHUTDOWN
// ============================================================================

async function cleanup() {
  try {
    await prisma.$disconnect()
    isConnected = false
    console.log('✅ Database connection closed gracefully')
  } catch (error) {
    console.error('❌ Error during database disconnect:', error)
    // Don't exit in serverless environments
    if (process.env.NODE_ENV === 'development') {
      process.exit(1)
    }
  }
}

// Graceful shutdown handlers
process.on('beforeExit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR2', cleanup) // For nodemon restart

// Prevent multiple listeners warning
process.setMaxListeners(15)

// ============================================================================
// MONITORING & METRICS
// ============================================================================

let queryCount = 0
let errorCount = 0

// Export metrics every minute in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    if (queryCount > 0) {
      console.log('📊 Database Metrics:', {
        queries: queryCount,
        errors: errorCount,
        errorRate: `${((errorCount / queryCount) * 100).toFixed(2)}%`,
        connected: isConnected
      })
      // Reset counters
      queryCount = 0
      errorCount = 0
    }
  }, 60000)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default prisma
export { prisma }
export { Prisma } from '@prisma/client'
export type { PrismaClient } from '@prisma/client'