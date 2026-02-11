// app/api/partner/discounts/[id]/toggle/route.ts
// Toggle discount active status
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getHostIdFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value ||
                cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.hostId as string || null
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hostId = await getHostIdFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.partner_discounts.findFirst({
      where: { id, hostId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

    const discount = await prisma.partner_discounts.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      isActive: discount.isActive
    })
  } catch (error) {
    console.error('[Partner Discount Toggle] Error:', error)
    return NextResponse.json({ error: 'Failed to toggle discount' }, { status: 500 })
  }
}
