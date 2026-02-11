// app/api/unsubscribe/route.ts
// CAN-SPAM compliance: handles email unsubscribe requests

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Upsert: create or update unsubscribe preference
    await prisma.emailPreference.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: { unsubscribedAt: new Date() }
    })

    console.log(`[Unsubscribe] ${normalizedEmail} unsubscribed from marketing emails`)

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from marketing emails. You will still receive transactional emails (booking confirmations, security alerts, etc.).'
    })
  } catch (error) {
    console.error('[Unsubscribe] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    )
  }
}

// GET endpoint for one-click unsubscribe (RFC 8058)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    )
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const existing = await prisma.emailPreference.findUnique({
      where: { email: normalizedEmail }
    })

    return NextResponse.json({
      email: normalizedEmail,
      unsubscribed: !!existing,
      unsubscribedAt: existing?.unsubscribedAt || null
    })
  } catch (error) {
    console.error('[Unsubscribe] Check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    )
  }
}
