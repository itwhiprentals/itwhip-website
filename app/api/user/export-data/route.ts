// app/api/user/export-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Helper to get user ID from JWT
async function getUserFromToken(req: NextRequest): Promise<string | null> {
  try {
    const userId = req.headers.get('x-user-id')
    if (userId) return userId

    const token = req.cookies.get('accessToken')?.value
    if (!token) return null

    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key')

    for (const secret of [JWT_SECRET, GUEST_JWT_SECRET]) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return payload.userId as string
      } catch {
        continue
      }
    }

    return null
  } catch (error) {
    console.error('[Export Data] Token verification failed:', error)
    return null
  }
}

// Mask sensitive data
function maskEmail(email: string | null): string {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = local.charAt(0) + '***' + (local.length > 1 ? local.charAt(local.length - 1) : '')
  return `${maskedLocal}@${domain}`
}

function maskPhone(phone: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '***'
  return '***' + digits.slice(-4)
}

function maskCardNumber(last4: string | null): string {
  return last4 ? `****${last4}` : '****'
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
        // Bookings
        rentalBookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            totalPrice: true,
            createdAt: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        // Reviews
        reviewerProfile: {
          select: {
            id: true,
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                title: true,
                createdAt: true,
                car: {
                  select: {
                    make: true,
                    model: true,
                    year: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        // Payment methods (masked)
        paymentMethods: {
          select: {
            id: true,
            type: true,
            last4: true,
            brand: true,
            expiryMonth: true,
            expiryYear: true,
            isDefault: true,
            createdAt: true
          }
        },
        // Login history
        loginAttempts: {
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            successful: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50 // Last 50 login attempts
        },
        // Sessions
        sessions: {
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            lastActivity: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build export data with masked sensitive info
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      account: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: maskPhone(user.phone),
        avatarUrl: user.avatar,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt,
        lastActive: user.lastActive
      },
      bookings: user.rentalBookings.map(booking => ({
        id: booking.id,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice ? Number(booking.totalPrice) : null,
        vehicle: booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : null,
        createdAt: booking.createdAt
      })),
      reviews: user.reviewerProfile?.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        vehicle: review.car ? `${review.car.year} ${review.car.make} ${review.car.model}` : null,
        createdAt: review.createdAt
      })) || [],
      paymentMethods: user.paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        brand: pm.brand,
        lastFourDigits: maskCardNumber(pm.last4),
        expiry: pm.expiryMonth && pm.expiryYear ? `${pm.expiryMonth}/${pm.expiryYear}` : null,
        isDefault: pm.isDefault,
        addedOn: pm.createdAt
      })),
      securityLog: {
        recentLoginAttempts: user.loginAttempts.map(attempt => ({
          ipAddress: attempt.ipAddress,
          device: attempt.userAgent,
          successful: attempt.successful,
          timestamp: attempt.createdAt
        })),
        activeSessions: user.sessions.map(session => ({
          id: session.id,
          ipAddress: session.ipAddress,
          device: session.userAgent,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        }))
      },
      dataRights: {
        exportGeneratedAt: new Date().toISOString(),
        gdprCompliant: true,
        dataRetentionPolicy: 'Data is retained for the duration of your account. Upon account deletion, data is permanently removed after a 30-day grace period.',
        contactForDataQuestions: 'privacy@itwhip.com'
      }
    }

    // Log the export
    try {
      await prisma.dataExportLog.create({
        data: {
          userId,
          status: 'completed',
          completedAt: new Date(),
          fileSize: JSON.stringify(exportData).length
        }
      })
    } catch (logError) {
      console.error('[Export Data] Failed to log export:', logError)
    }

    console.log(`[Export Data] Data exported for user: ${userId}`)

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2)

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="itwhip-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('[Export Data] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while exporting data' },
      { status: 500 }
    )
  }
}
