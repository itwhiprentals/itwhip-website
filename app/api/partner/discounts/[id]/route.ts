// app/api/partner/discounts/[id]/route.ts
// Individual discount operations - GET, PUT, DELETE
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hostId = await getHostIdFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const discount = await prisma.partner_discounts.findFirst({
      where: { id, hostId }
    })

    if (!discount) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

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
    console.error('[Partner Discount] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch discount' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hostId = await getHostIdFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

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
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        percentage: body.percentage !== undefined ? parseFloat(body.percentage) : existing.percentage,
        maxUses: body.maxUses !== undefined ? (body.maxUses ? parseInt(body.maxUses) : null) : existing.maxUses,
        startsAt: body.startsAt !== undefined ? (body.startsAt ? new Date(body.startsAt) : null) : existing.startsAt,
        expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : existing.expiresAt,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
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
    console.error('[Partner Discount] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 })
  }
}

export async function DELETE(
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

    await prisma.partner_discounts.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner Discount] DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 })
  }
}
