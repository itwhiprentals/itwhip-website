// app/api/partner/discounts/route.ts
// Partner Discount API - Manage promo codes and discounts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { randomUUID } from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Helper to get hostId from token
async function getHostIdFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app), then fall back to cookies
  let token: string | undefined
  const authHeader = request?.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value ||
                  cookieStore.get('hostAccessToken')?.value ||
                  cookieStore.get('accessToken')?.value
  }

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.hostId as string || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const hostId = await getHostIdFromToken(request)

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all discounts for this host
    const discounts = await prisma.partner_discounts.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      discounts: discounts.map(d => ({
        id: d.id,
        code: d.code,
        title: d.title,
        description: d.description,
        percentage: d.percentage,
        maxUses: d.maxUses,
        usedCount: d.usedCount,
        startsAt: d.startsAt?.toISOString() || null,
        expiresAt: d.expiresAt?.toISOString() || null,
        isActive: d.isActive,
        createdAt: d.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('[Partner Discounts] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const hostId = await getHostIdFromToken(request)

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, title, description, percentage, maxUses, startsAt, expiresAt } = body

    // Validate required fields
    if (!code || !title || !percentage) {
      return NextResponse.json({
        error: 'Missing required fields: code, title, and percentage are required'
      }, { status: 400 })
    }

    // Check if code already exists
    const existingCode = await prisma.partner_discounts.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json({
        error: 'This discount code already exists'
      }, { status: 400 })
    }

    // Create the discount
    const discount = await prisma.partner_discounts.create({
      data: {
        id: randomUUID(),
        hostId,
        code: code.toUpperCase(),
        title,
        description: description || null,
        percentage: parseFloat(percentage),
        maxUses: maxUses ? parseInt(maxUses) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
        usedCount: 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        title: discount.title,
        description: discount.description,
        percentage: discount.percentage,
        maxUses: discount.maxUses,
        usedCount: discount.usedCount,
        startsAt: discount.startsAt?.toISOString() || null,
        expiresAt: discount.expiresAt?.toISOString() || null,
        isActive: discount.isActive,
        createdAt: discount.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('[Partner Discounts] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  }
}
