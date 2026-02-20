// app/api/promo/validate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, carId } = body

    if (!code || !carId) {
      return NextResponse.json(
        { valid: false, error: 'Missing required fields: code, carId' },
        { status: 400 }
      )
    }

    // 1. Search platform_promo_codes by code (case-insensitive)
    const platformCode = await prisma.platform_promo_codes.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } }
    })

    if (platformCode) {
      // Validate isActive
      if (!platformCode.isActive) {
        return NextResponse.json({ valid: false, error: 'Code is not active' })
      }

      // Validate not expired
      if (platformCode.expiresAt && new Date() > platformCode.expiresAt) {
        return NextResponse.json({ valid: false, error: 'Code expired' })
      }

      // Validate not before start
      if (platformCode.startsAt && new Date() < platformCode.startsAt) {
        return NextResponse.json({ valid: false, error: 'Code is not yet active' })
      }

      // Validate usage limit
      if (platformCode.maxUses && platformCode.usedCount >= platformCode.maxUses) {
        return NextResponse.json({ valid: false, error: 'Code usage limit reached' })
      }

      return NextResponse.json({
        valid: true,
        discountType: platformCode.discountType,
        discountValue: platformCode.discountValue,
        source: 'platform',
        title: platformCode.title,
        code: platformCode.code
      })
    }

    // 2. Search partner_discounts by code (case-insensitive)
    const hostCode = await prisma.partner_discounts.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } }
    })

    if (hostCode) {
      // Validate isActive
      if (!hostCode.isActive) {
        return NextResponse.json({ valid: false, error: 'Code is not active' })
      }

      // Validate not expired
      if (hostCode.expiresAt && new Date() > hostCode.expiresAt) {
        return NextResponse.json({ valid: false, error: 'Code expired' })
      }

      // Validate not before start
      if (hostCode.startsAt && new Date() < hostCode.startsAt) {
        return NextResponse.json({ valid: false, error: 'Code is not yet active' })
      }

      // Validate usage limit
      if (hostCode.maxUses && hostCode.usedCount >= hostCode.maxUses) {
        return NextResponse.json({ valid: false, error: 'Code usage limit reached' })
      }

      // Verify the code's hostId matches the car's hostId
      const car = await prisma.rentalCar.findUnique({
        where: { id: carId },
        select: { hostId: true }
      })

      if (!car) {
        return NextResponse.json({ valid: false, error: 'Vehicle not found' })
      }

      if (hostCode.hostId !== car.hostId) {
        return NextResponse.json({ valid: false, error: 'This code is not valid for this vehicle' })
      }

      return NextResponse.json({
        valid: true,
        discountType: 'percentage',
        discountValue: hostCode.percentage,
        source: 'host',
        title: hostCode.title,
        code: hostCode.code
      })
    }

    // 3. Code not found in either table
    return NextResponse.json({ valid: false, error: 'Code not found' })

  } catch (error) {
    console.error('[Promo Validate] Error:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}
