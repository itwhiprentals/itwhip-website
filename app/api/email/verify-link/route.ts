// app/api/email/verify-link/route.ts
// Magic link email verification endpoint
// User clicks link in email → auto-verified

import { NextRequest, NextResponse } from 'next/server'
import { markEmailVerified } from '@/app/lib/email/config'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/verify-failed?error=missing_token', request.url)
      )
    }

    // Verify the email using the token
    const result = await markEmailVerified(token)

    if (!result.success) {
      const errorParam = encodeURIComponent(result.error || 'verification_failed')
      return NextResponse.redirect(
        new URL(`/verify-failed?error=${errorParam}`, request.url)
      )
    }

    // If this was linked to a user, mark their email as verified
    if (result.emailLog?.relatedType === 'user' && result.emailLog?.relatedId) {
      try {
        await prisma.user.update({
          where: { id: result.emailLog.relatedId },
          data: { emailVerified: true }
        })
        console.log(`[Email Verify Link] User email verified: ${result.emailLog.relatedId}`)
      } catch (updateError) {
        console.error('[Email Verify Link] Failed to update user:', updateError)
      }
    }

    // If this was linked to a guest profile, mark their email as verified
    if (result.emailLog?.relatedType === 'guest_profile' && result.emailLog?.relatedId) {
      try {
        await prisma.reviewerProfile.update({
          where: { id: result.emailLog.relatedId },
          data: { emailVerified: true }
        })
        console.log(`[Email Verify Link] Guest profile email verified: ${result.emailLog.relatedId}`)
      } catch (updateError) {
        console.error('[Email Verify Link] Failed to update guest profile:', updateError)
      }
    }

    // Redirect to success page
    const successUrl = new URL('/verify-success', request.url)
    successUrl.searchParams.set('email', result.emailLog?.recipientEmail || '')

    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error('[Email Verify Link] Error:', error)
    return NextResponse.redirect(
      new URL('/verify-failed?error=server_error', request.url)
    )
  }
}
