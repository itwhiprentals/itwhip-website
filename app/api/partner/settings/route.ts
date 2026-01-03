// app/api/partner/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: { user: true }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      settings: {
        email: partner.email,
        firstName: partner.user?.name?.split(' ')[0] || '',
        lastName: partner.user?.name?.split(' ').slice(1).join(' ') || '',
        phone: partner.phone || '',
        companyName: partner.partnerCompanyName || '',
        businessType: 'fleet',
        taxId: '',
        address: partner.address || '',
        city: partner.city || '',
        state: partner.state || '',
        zipCode: partner.zipCode || '',
        bankConnected: false,
        twoFactorEnabled: partner.user?.twoFactorEnabled || false,
        emailNotifications: true,
        smsNotifications: false,
        bookingAlerts: true,
        marketingEmails: false,
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
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    const body = await request.json()

    // Update partner settings
    await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        partnerCompanyName: body.companyName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner Settings] Error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
