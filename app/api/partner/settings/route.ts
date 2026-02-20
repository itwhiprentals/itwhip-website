// app/api/partner/settings/route.ts
// Unified Portal - Partner Settings API
// Supports all host types in the unified portal

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyHostRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    const hostId = await verifyHostRequest(request)

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: { user: true }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Determine Stripe Connect status
    let stripeConnectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted' = 'not_connected'
    if (partner.stripeConnectAccountId) {
      if (partner.stripeChargesEnabled && partner.stripePayoutsEnabled) {
        stripeConnectStatus = 'connected'
      } else if (partner.stripeDetailsSubmitted) {
        stripeConnectStatus = 'restricted' // Details submitted but not fully enabled
      } else {
        stripeConnectStatus = 'pending'
      }
    }

    // Get vehicle count for tier calculation
    const vehicleCount = await prisma.rentalCar.count({
      where: { hostId: partner.id }
    })

    // Calculate tier based on fleet size
    const commissionRate = partner.currentCommissionRate || 0.25
    let tier = 'Standard'
    if (vehicleCount >= 100) tier = 'Diamond'
    else if (vehicleCount >= 50) tier = 'Platinum'
    else if (vehicleCount >= 10) tier = 'Gold'

    return NextResponse.json({
      success: true,
      partner: {
        businessAddress: `${partner.city || ''}, ${partner.state || ''} ${partner.zipCode || ''}`.trim(),
        businessCity: partner.city || '',
        businessState: partner.state || '',
        businessZipCode: partner.zipCode || ''
      },
      tier: {
        name: tier,
        commissionRate,
        fleetSize: vehicleCount
      },
      host: {
        requireDeposit: partner.requireDeposit ?? true,
        depositAmount: partner.depositAmount ?? 500,
        globalDiscountPercent: partner.globalDiscountPercent ?? 0
      },
      settings: {
        email: partner.email,
        firstName: partner.user?.name?.split(' ')[0] || '',
        lastName: partner.user?.name?.split(' ').slice(1).join(' ') || '',
        phone: partner.phone || '',
        companyName: partner.partnerCompanyName || '',
        businessType: partner.businessType || '',
        taxId: partner.taxId || '',
        city: partner.city || '',
        state: partner.state || '',
        zipCode: partner.zipCode || '',
        // Stripe Connect status
        stripeConnectStatus,
        stripeAccountId: partner.stripeConnectAccountId || null,
        payoutSchedule: 'weekly',
        bankConnected: stripeConnectStatus === 'connected',
        twoFactorEnabled: partner.user?.twoFactorEnabled || false,
        emailNotifications: true,
        smsNotifications: false,
        bookingAlerts: true,
        payoutAlerts: true,
        marketingEmails: false,
        // Verification
        emailVerified: partner.emailVerified,
        phoneVerified: partner.phoneVerified,
        // Business host
        isBusinessHost: partner.isBusinessHost,
        businessApprovalStatus: partner.businessApprovalStatus,
        // GDPR fields
        userStatus: partner.user?.status || 'ACTIVE',
        deletionScheduledFor: partner.user?.deletionScheduledFor || null
      }
    })
  } catch (error) {
    console.error('[Partner Settings] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const hostId = await verifyHostRequest(request)

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Build update data dynamically based on what's provided
    const updateData: Record<string, any> = {}

    // Profile settings
    if (body.companyName !== undefined) updateData.partnerCompanyName = body.companyName
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode

    // Business host toggle
    if (body.isBusinessHost !== undefined) {
      if (body.isBusinessHost) {
        // Fetch current partner to validate EIN + company name
        const partner = await prisma.rentalHost.findUnique({
          where: { id: hostId },
          select: { partnerCompanyName: true, businessName: true }
        })
        const companyName = body.companyName || partner?.partnerCompanyName || partner?.businessName
        if (!companyName) {
          return NextResponse.json({ error: 'Company name is required to enable business host' }, { status: 400 })
        }
        const einRegex = /^\d{2}-?\d{7}$/
        if (!body.taxId || !einRegex.test(body.taxId.replace(/\s/g, ''))) {
          return NextResponse.json({ error: 'Valid EIN (Tax ID) is required to enable business host' }, { status: 400 })
        }
      }
      updateData.isBusinessHost = body.isBusinessHost
    }

    // Tax ID (EIN)
    if (body.taxId !== undefined) {
      updateData.taxId = body.taxId
      updateData.taxIdProvided = !!body.taxId
    }
    // Business type
    if (body.businessType !== undefined) updateData.businessType = body.businessType

    // Deposit settings
    if (body.requireDeposit !== undefined) updateData.requireDeposit = body.requireDeposit
    if (body.depositAmount !== undefined) updateData.depositAmount = body.depositAmount
    if (body.globalDiscountPercent !== undefined) updateData.globalDiscountPercent = body.globalDiscountPercent

    // Only update if there's something to update
    if (Object.keys(updateData).length > 0) {
      await prisma.rentalHost.update({
        where: { id: hostId },
        data: updateData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner Settings] Error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
