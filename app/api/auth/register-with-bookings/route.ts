// app/api/auth/register-with-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import prisma from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change'
)

async function createTokens(userId: string, email: string, role: string) {
  const accessToken = await new SignJWT({ 
    userId, 
    email, 
    role,
    type: 'access' 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({ 
    userId,
    email,
    role,
    type: 'refresh',
    family: nanoid()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, importBookings } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and import bookings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: passwordHash,  // <- FIXED: Changed from 'password' to 'passwordHash'
          name: name || null,
          phone: phone || null,
          role: 'CLAIMED',
          emailVerified: false
        } as any
      })

      let importedBookingsCount = 0
      
      // Import guest bookings if requested
      if (importBookings) {
        // Find all guest bookings with this email
        const guestBookings = await tx.rentalBooking.findMany({
          where: {
            guestEmail: email.toLowerCase(),
            renterId: null // Only guest bookings
          }
        })

        if (guestBookings.length > 0) {
          // Link all guest bookings to the new user
          await tx.rentalBooking.updateMany({
            where: {
              guestEmail: email.toLowerCase(),
              renterId: null
            },
            data: {
              renterId: newUser.id
            }
          })
          
          importedBookingsCount = guestBookings.length

          // Mark guest access tokens as converted
          await tx.guestAccessToken.updateMany({
            where: { 
              email: email.toLowerCase(),
              usedAt: { not: null }
            },
            data: { 
              usedAt: new Date() 
            }
          })
        }
      }

      return { user: newUser, importedBookingsCount }
    })

    // Create JWT tokens
    const { accessToken, refreshToken } = await createTokens(
      result.user.id,
      result.user.email!,
      result.user.role
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      message: result.importedBookingsCount > 0 
        ? `Account created successfully! ${result.importedBookingsCount} booking(s) imported.`
        : 'Account created successfully!',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role
      },
      importedBookings: result.importedBookingsCount,
      accessToken
    }, { status: 201 })

    // Set refresh token as httpOnly cookie
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Set access token as httpOnly cookie
    response.cookies.set({
      name: 'accessToken',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15 // 15 minutes
    })

    return response

  } catch (error) {
    console.error('Signup with bookings error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}