// app/api/fleet/promo-codes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - List all platform promo codes
export async function GET() {
  try {
    const promoCodes = await prisma.platform_promo_codes.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, promoCodes })
  } catch (error) {
    console.error('[Fleet Promo Codes] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

// POST - Create a new platform promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      maxUses,
      minBookingAmount,
      startsAt,
      expiresAt
    } = body

    if (!code || !title || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, title, discountType, discountValue' },
        { status: 400 }
      )
    }

    const upperCode = code.toUpperCase()

    // Check for code uniqueness
    const existing = await prisma.platform_promo_codes.findFirst({
      where: { code: { equals: upperCode, mode: 'insensitive' } }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A promo code with this code already exists' },
        { status: 409 }
      )
    }

    const promoCode = await prisma.platform_promo_codes.create({
      data: {
        code: upperCode,
        title,
        description: description || null,
        discountType,
        discountValue,
        maxUses: maxUses || null,
        minBookingAmount: minBookingAmount || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    return NextResponse.json({ success: true, promoCode })
  } catch (error) {
    console.error('[Fleet Promo Codes] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}

// PUT - Update a promo code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Uppercase the code if it's being updated
    if (fields.code) {
      fields.code = fields.code.toUpperCase()
    }

    // Convert date strings to Date objects if present
    if (fields.startsAt) {
      fields.startsAt = new Date(fields.startsAt)
    }
    if (fields.expiresAt) {
      fields.expiresAt = new Date(fields.expiresAt)
    }

    const promoCode = await prisma.platform_promo_codes.update({
      where: { id },
      data: fields
    })

    return NextResponse.json({ success: true, promoCode })
  } catch (error) {
    console.error('[Fleet Promo Codes] PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promo code' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a promo code
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    await prisma.platform_promo_codes.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Fleet Promo Codes] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete promo code' },
      { status: 500 }
    )
  }
}
