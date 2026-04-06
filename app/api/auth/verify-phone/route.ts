// app/api/auth/verify-phone/route.ts
// POST /api/auth/verify-phone - Verify Firebase phone token and update database

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { verifyPhoneToken } from '@/app/lib/firebase/admin'
import { sendPushNotification } from '@/app/lib/notifications/push'
import { sendEmail } from '@/app/lib/email/sender'
import { sendSms } from '@/app/lib/twilio/sms'

export async function POST(request: NextRequest) {
  try {
    const { idToken, phone, roleHint } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { error: 'Firebase ID token is required' },
        { status: 400 }
      )
    }

    // Get current user from session
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Phone Verify] Verifying phone for user: ${user.id}`)

    // Verify the Firebase ID token
    let verifiedPhone: string
    try {
      const result = await verifyPhoneToken(idToken)
      verifiedPhone = result.phoneNumber

      console.log(`[Phone Verify] Firebase verified phone: ${verifiedPhone}`)
    } catch (error: any) {
      console.error('[Phone Verify] Firebase token verification failed:', error)
      return NextResponse.json(
        { error: 'Phone verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // Capture old phone before update (for security notifications)
    const existingUser = await prisma.user.findUnique({ where: { id: user.id }, select: { phone: true } })
    const oldPhone = existingUser?.phone || null
    const phoneChanged = oldPhone && oldPhone !== verifiedPhone

    // Update user's phone verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        phone: verifiedPhone, // Update with Firebase-verified phone
        phoneVerificationAttempts: 0,      // Reset on success
        phoneVerificationSkipped: false,   // Clear skip flag if they verify later
      }
    })

    console.log(`[Phone Verify] User ${user.id} phone verified: ${verifiedPhone}`)

    // Also sync phoneVerified to ReviewerProfile if exists
    try {
      await prisma.reviewerProfile.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ]
        },
        data: {
          phoneVerified: true,
          phoneNumber: verifiedPhone,
          phoneVerificationAttempts: 0,
          phoneVerificationSkipped: false,
        }
      })
      console.log(`[Phone Verify] Synced phoneVerified to ReviewerProfile for user: ${user.id}`)
    } catch (syncError) {
      console.error('[Phone Verify] Failed to sync phoneVerified to ReviewerProfile:', syncError)
      // Don't fail the request if profile sync fails
    }

    // Sync phoneVerified to RentalHost if this is a host verification
    if (roleHint === 'host') {
      try {
        await prisma.rentalHost.updateMany({
          where: {
            OR: [
              { userId: user.id },
              { email: user.email }
            ]
          },
          data: {
            phoneVerified: true,
            phone: verifiedPhone,
            phoneVerifiedAt: new Date(),
          }
        })
        console.log(`[Phone Verify] Synced phoneVerified to RentalHost for user: ${user.id}`)
      } catch (syncError) {
        console.error('[Phone Verify] Failed to sync phoneVerified to RentalHost:', syncError)
      }
    }

    // Security notifications for phone change (non-blocking)
    if (phoneChanged) {
      const lastFour = oldPhone!.slice(-4)

      // 1. SMS to OLD number — alert about removal
      sendSms(oldPhone!, `ItWhip Security: This phone number (***${lastFour}) has been removed from your ItWhip account. If you didn't make this change, call us immediately at (480) 618-1272.`, {
        type: 'SYSTEM',
      }).catch(err => console.error('[Phone Verify] Old number SMS failed:', err))

      // 2. Email notification about the change
      if (user.email) {
        sendEmail(
          user.email,
          'ItWhip Security Alert: Phone Number Changed',
          `<div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1f2937;">Phone Number Changed</h2>
            <p style="color: #374151;">Your ItWhip account phone number has been updated.</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #6b7280;">Previous: ***${lastFour}</p>
              <p style="margin: 8px 0 0; color: #1f2937; font-weight: 600;">New: ***${verifiedPhone.slice(-4)}</p>
            </div>
            <p style="color: #374151;">If you didn't make this change, contact us immediately:</p>
            <p style="color: #1f2937; font-weight: 600;">📞 (480) 618-1272</p>
            <p style="color: #1f2937; font-weight: 600;">📧 support@itwhip.com</p>
          </div>`,
          `ItWhip Security Alert: Your phone number has been changed. Previous: ***${lastFour}, New: ***${verifiedPhone.slice(-4)}. If you didn't make this change, call (480) 618-1272 immediately.`
        ).catch(err => console.error('[Phone Verify] Email notification failed:', err))
      }

      // 3. Push notification — security alert
      sendPushNotification({
        userId: user.id,
        title: 'Phone number changed',
        body: `Your phone number was updated. If this wasn't you, contact support immediately.`,
        type: 'fleet_vehicle_update',
        data: { screen: 'account' },
      }).catch(err => console.error('[Phone Verify] Push notification failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phone: verifiedPhone,
    })

  } catch (error) {
    console.error('[Phone Verify] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during phone verification' },
      { status: 500 }
    )
  }
}
