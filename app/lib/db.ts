// app/lib/db.ts
import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

// Create a singleton pool instance
const globalForDb = global as unknown as { pool: Pool }

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon
    },
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection fails
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool
}

// Helper function to get a client from the pool
export async function getClient() {
  const client = await pool.connect()
  return client
}

// Helper function for queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    
    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production' && duration > 100) {
      console.log('Slow query detected:', { text, duration, rows: res.rowCount })
    }
    
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// User-specific queries
export const db = {
  // Create a new user
  async createUser(data: {
    email: string
    passwordHash: string
    name?: string
    phone?: string
    role?: string
  }) {
    const { email, passwordHash, name, phone, role = 'guest' } = data
    
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, role, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, phone, role, is_verified, is_active, created_at`,
      [email, passwordHash, name, phone, role, false, true]
    )
    
    return result.rows[0]
  },

  // Find user by email
  async getUserByEmail(email: string) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  },

  // Find user by ID
  async getUserById(id: string) {
    const result = await query(
      'SELECT id, email, name, phone, role, is_verified, is_active, last_login, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  // Update last login
  async updateLastLogin(userId: string) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    )
  },

  // Save refresh token
  async saveRefreshToken(data: {
    userId: string
    token: string
    family: string
    expiresAt: Date
  }) {
    const { userId, token, family, expiresAt } = data
    
    const result = await query(
      `INSERT INTO refresh_tokens (user_id, token, family, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, token, family, expiresAt]
    )
    
    return result.rows[0]
  },

  // Get refresh token
  async getRefreshToken(token: string) {
    const result = await query(
      `SELECT rt.*, u.email, u.role 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [token]
    )
    return result.rows[0]
  },

  // Invalidate refresh token family (for security)
  async invalidateRefreshTokenFamily(family: string) {
    await query(
      'DELETE FROM refresh_tokens WHERE family = $1',
      [family]
    )
  },

  // Delete all refresh tokens for a user (logout from all devices)
  async deleteUserRefreshTokens(userId: string) {
    try {
      const result = await query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [userId]
      )
      console.log(`Deleted ${result.rowCount} refresh tokens for user ${userId}`)
      return result.rowCount
    } catch (error) {
      console.error('Error deleting user refresh tokens:', error)
      throw error
    }
  },

  // Revoke specific refresh token
  async revokeRefreshToken(token: string) {
    try {
      const result = await query(
        'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = $1',
        [token]
      )
      return result.rowCount
    } catch (error) {
      console.error('Error revoking refresh token:', error)
      throw error
    }
  },

  // Check if refresh token is revoked
  async isRefreshTokenRevoked(token: string) {
    const result = await query(
      'SELECT revoked_at FROM refresh_tokens WHERE token = $1',
      [token]
    )
    if (result.rows.length === 0) return true // Token doesn't exist
    return result.rows[0].revoked_at !== null
  },

  // Clean up expired tokens (run periodically)
  async cleanupExpiredTokens() {
    const result = await query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL'
    )
    console.log(`Cleaned up ${result.rowCount} expired/revoked tokens`)
    return result.rowCount
  },

  // Get user's active sessions
  async getUserSessions(userId: string) {
    const result = await query(
      `SELECT id, user_agent, ip_address, created_at, last_activity 
       FROM refresh_tokens 
       WHERE user_id = $1 
         AND expires_at > NOW() 
         AND revoked_at IS NULL
       ORDER BY last_activity DESC`,
      [userId]
    )
    return result.rows
  },

  // Update session activity
  async updateSessionActivity(token: string) {
    await query(
      'UPDATE refresh_tokens SET last_activity = CURRENT_TIMESTAMP WHERE token = $1',
      [token]
    )
  }
}

// Create indexes for better performance (run these once in your database)
export const createIndexes = async () => {
  try {
    // Index for email lookups (fixes slow query issue)
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    
    // Index for refresh token lookups
    await query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)')
    
    // Index for user's refresh tokens
    await query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)')
    
    // Index for cleanup job
    await query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at)')
    
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    console.error('Error creating indexes:', error)
  }
}

// Run cleanup job periodically (call this from a cron job or setInterval)
export const startCleanupJob = () => {
  // Run cleanup every hour
  setInterval(async () => {
    try {
      const cleaned = await db.cleanupExpiredTokens()
      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired tokens`)
      }
    } catch (error) {
      console.error('Cleanup job error:', error)
    }
  }, 3600000) // 1 hour
}

export default db