// app/lib/db.ts
import prisma from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

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
    const { email, passwordHash, name, phone, role = 'CLAIMED' } = data  // Changed from 'GUEST' to 'CLAIMED'
    
    const user = await prisma.user.create({
      data: {
        id: nanoid(),
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
        role: role as any, // Map to UserRole enum
        emailVerified: false,
        isActive: true
      }
    })
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      is_verified: user.emailVerified,
      is_active: user.isActive,
      created_at: user.createdAt
    }
  },

  // Find user by email
  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      password_hash: user.passwordHash,
      is_verified: user.emailVerified,
      is_active: user.isActive,
      last_login: user.lastActive,
      created_at: user.createdAt
    }
  },

  // Find user by ID
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      is_verified: user.emailVerified,
      is_active: user.isActive,
      last_login: user.lastActive,
      created_at: user.createdAt
    }
  },

  // Update last login
  async updateLastLogin(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    })
  },

  // Update user's password hash (for Argon2 migration)
  async updateUserPasswordHash(userId: string, newHash: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    })
  },

  // Save refresh token
  async saveRefreshToken(data: {
    userId: string
    token: string
    family: string
    expiresAt: Date
  }) {
    const { userId, token, family, expiresAt } = data
    
    // Get request info if available (you might pass this from the route)
    const ipAddress = '0.0.0.0' // Should be passed from request
    const userAgent = 'Unknown' // Should be passed from request
    
    const session = await prisma.session.create({
      data: {
        userId,
        token: nanoid(), // Access token
        refreshToken: token,
        tokenFamily: family,
        expiresAt,
        ipAddress,
        userAgent
      }
    })
    
    return { id: session.id }
  },

  // Get refresh token
  async getRefreshToken(token: string) {
    const session = await prisma.session.findUnique({
      where: { 
        refreshToken: token,
        expiresAt: { gt: new Date() },
        revokedAt: null
      },
      include: {
        user: true
      }
    })
    
    if (!session || !session.user) return null
    
    return {
      id: session.id,
      user_id: session.userId,
      token: session.refreshToken,
      family: session.tokenFamily,
      expires_at: session.expiresAt,
      email: session.user.email,
      role: session.user.role
    }
  },

  // Invalidate refresh token family (for security)
  async invalidateRefreshTokenFamily(family: string) {
    await prisma.session.updateMany({
      where: { tokenFamily: family },
      data: { revokedAt: new Date() }
    })
  },

  // Delete all refresh tokens for a user (logout from all devices)
  async deleteUserRefreshTokens(userId: string) {
    try {
      const result = await prisma.session.deleteMany({
        where: { userId }
      })
      console.log(`Deleted ${result.count} refresh tokens for user ${userId}`)
      return result.count
    } catch (error) {
      console.error('Error deleting user refresh tokens:', error)
      throw error
    }
  },

  // Revoke specific refresh token
  async revokeRefreshToken(token: string) {
    try {
      const result = await prisma.session.updateMany({
        where: { refreshToken: token },
        data: { revokedAt: new Date() }
      })
      return result.count
    } catch (error) {
      console.error('Error revoking refresh token:', error)
      throw error
    }
  },

  // Check if refresh token is revoked
  async isRefreshTokenRevoked(token: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken: token }
    })
    
    if (!session) return true // Token doesn't exist
    return session.revokedAt !== null
  },

  // Clean up expired tokens (run periodically)
  async cleanupExpiredTokens() {
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } }
        ]
      }
    })
    console.log(`Cleaned up ${result.count} expired/revoked tokens`)
    return result.count
  },

  // Get user's active sessions
  async getUserSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        revokedAt: null
      },
      orderBy: { lastActivity: 'desc' }
    })
    
    return sessions.map(s => ({
      id: s.id,
      user_agent: s.userAgent,
      ip_address: s.ipAddress,
      created_at: s.createdAt,
      last_activity: s.lastActivity
    }))
  },

  // Update session activity
  async updateSessionActivity(token: string) {
    await prisma.session.updateMany({
      where: { refreshToken: token },
      data: { lastActivity: new Date() }
    })
  }
}

// No need for createIndexes - Prisma handles this in schema
export const createIndexes = async () => {
  console.log('✅ Indexes are managed by Prisma schema')
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