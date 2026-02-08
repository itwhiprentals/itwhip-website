// app/lib/auth/guest-tokens.ts
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { addDays, isPast } from 'date-fns'

/**
 * Guest Token Handler
 * Manages token generation, validation, and guest-to-member conversion
 */

export class GuestTokenHandler {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY_DAYS = 7
  
  /**
   * Generate a secure token for guest booking access
   */
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  /**
   * Create guest access token for a booking
   */
  static async createGuestToken(
    bookingId: string, 
    email: string
  ): Promise<string> {
    const token = this.generateToken()
    
    await prisma.guestAccessToken.create({
      data: {
        id: crypto.randomUUID(),
        token,
        bookingId,
        email,
        expiresAt: addDays(new Date(), this.TOKEN_EXPIRY_DAYS)
      }
    })
    
    return token
  }

  /**
   * Validate guest token and return booking
   */
  static async validateToken(token: string) {
    const guestToken = await prisma.guestAccessToken.findUnique({
      where: { token },
      include: {
        booking: {
          include: {
            car: {
              include: {
                photos: true,
                host: true
              }
            }
          }
        }
      }
    })

    if (!guestToken) {
      throw new Error('Invalid token')
    }

    if (isPast(guestToken.expiresAt)) {
      throw new Error('Token expired')
    }

    // Mark as used (but don't invalidate - guest may need multiple accesses)
    if (!guestToken.usedAt) {
      await prisma.guestAccessToken.update({
        where: { id: guestToken.id },
        data: { usedAt: new Date() }
      })
    }

    return {
      token: guestToken,
      booking: guestToken.booking,
      email: guestToken.email
    }
  }

  /**
   * Convert guest booking to member account
   */
  static async convertGuestToMember(
    token: string,
    password: string,
    name?: string
  ) {
    const { booking, email } = await this.validateToken(token)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      // Link existing user to booking
      await prisma.rentalBooking.update({
        where: { id: booking.id },
        data: { 
          renterId: existingUser.id,
          guestEmail: null,
          guestPhone: null,
          guestName: null
        }
      })
      
      return existingUser
    }
    
    // Create new user account
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 10)
    
    const newUser = await prisma.user.create({
      data: {
        id: nanoid(),
        email,
        name: name || booking.guestName,
        passwordHash,
        role: 'CLAIMED',
        emailVerified: false,
        phone: booking.guestPhone,
        updatedAt: new Date()
      }
    })
    
    // Link booking to new user
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: { 
        renterId: newUser.id,
        guestEmail: null,
        guestPhone: null,
        guestName: null
      }
    })
    
    // Invalidate the guest token
    await prisma.guestAccessToken.update({
      where: { id: token },
      data: { usedAt: new Date() }
    })
    
    return newUser
  }

  /**
   * Get all bookings for a guest email
   */
  static async getGuestBookings(email: string) {
    return await prisma.rentalBooking.findMany({
      where: {
        OR: [
          { guestEmail: email },
          { renter: { email } }
        ]
      },
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })
  }

  /**
   * Refresh expiring token
   */
  static async refreshToken(oldToken: string): Promise<string> {
    const { booking, email } = await this.validateToken(oldToken)
    
    // Create new token
    const newToken = await this.createGuestToken(booking.id, email)
    
    // Mark old token as used
    await prisma.guestAccessToken.update({
      where: { token: oldToken },
      data: { usedAt: new Date() }
    })
    
    return newToken
  }
}

// Export convenience functions
export const {
  createGuestToken,
  validateToken,
  convertGuestToMember,
  getGuestBookings,
  refreshToken
} = GuestTokenHandler