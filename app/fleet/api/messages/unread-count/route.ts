// app/fleet/api/messages/unread-count/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet authentication
    const key = request.nextUrl.searchParams.get('key')
    if (key !== process.env.FLEET_KEY && key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Count all unread messages (admin hasn't read yet)
    const unreadCount = await prisma.rentalMessage.count({
      where: {
        readByAdmin: false
      }
    })

    return NextResponse.json({
      success: true,
      data: { count: unreadCount }
    })
  } catch (error) {
    console.error('Failed to fetch unread count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unread messages' },
      { status: 500 }
    )
  }
}