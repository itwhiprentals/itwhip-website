// app/api/guest/appeal-notifications/[id]/dismiss/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get guest profile
    const guest = await prisma.reviewerProfile.findFirst({
      where: { userId },
      select: { id: true }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Await params
    const { id } = await params

    // Verify notification belongs to this guest
    const notification = await prisma.appealNotification.findUnique({
      where: { id },
      select: { guestId: true }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.guestId !== guest.id) {
      return NextResponse.json(
        { error: 'Unauthorized to dismiss this notification' },
        { status: 403 }
      )
    }

    // Mark notification as seen and dismissed
    await prisma.appealNotification.update({
      where: { id },
      data: {
        seen: true,
        dismissedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Notification dismissed successfully'
    })
  } catch (error) {
    console.error('Failed to dismiss notification:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss notification' },
      { status: 500 }
    )
  }
}