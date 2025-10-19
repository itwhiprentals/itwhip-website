// app/api/host/banking/dashboard-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    if (!hostId || !hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        stripeConnectAccountId: true,
        approvalStatus: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { 
          error: 'Account must be approved to access banking',
          approvalStatus: host.approvalStatus 
        },
        { status: 403 }
      )
    }

    if (!host.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'No Stripe Connect account found' },
        { status: 400 }
      )
    }

    // Create a login link to Express Dashboard
    // This gives hosts access to full banking management (add/edit/remove accounts)
    const loginLink = await stripe.accounts.createLoginLink(
      host.stripeConnectAccountId
    )

    return NextResponse.json({
      success: true,
      url: loginLink.url
    })

  } catch (error: any) {
    console.error('Error creating dashboard link:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create dashboard link',
        details: error.message 
      },
      { status: 500 }
    )
  }
}