// app/api/verify-email-reference/route.ts
// Public endpoint to verify an email reference ID is legitimate

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json(
        { valid: false, error: 'Reference ID required' },
        { status: 400 }
      )
    }

    // Look up the email by reference ID
    const emailLog = await prisma.emailLog.findUnique({
      where: { referenceId: ref },
      select: {
        referenceId: true,
        recipientEmail: true,
        subject: true,
        emailType: true,
        status: true,
        sentAt: true,
        createdAt: true
      }
    })

    if (!emailLog) {
      return NextResponse.json({
        valid: false,
        error: 'Reference not found'
      })
    }

    // Return verification with limited info (privacy)
    return NextResponse.json({
      valid: true,
      email: {
        referenceId: emailLog.referenceId,
        recipientEmail: emailLog.recipientEmail,
        subject: emailLog.subject,
        emailType: emailLog.emailType,
        status: emailLog.status,
        sentAt: emailLog.sentAt || emailLog.createdAt
      }
    })

  } catch (error) {
    console.error('[Verify Email Reference] Error:', error)
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
