// app/api/cron/claims/process-deadlines/route.ts
// Cron job to process claim response deadlines
// - Sends 24-hour reminder emails
// - Applies account holds when deadline passes
// - Updates claim status

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { applyAccountHold } from '@/app/lib/claims/account-hold'
import { sendEmail } from '@/app/lib/email/send-email'
import { getClaimAccountHoldAppliedTemplate } from '@/app/lib/email/templates/claim-account-hold-applied'
import { getClaimReminderGuestTemplate } from '@/app/lib/email/templates/claim-reminder-guest'

// Secret key for cron authentication (set in environment)
const CRON_SECRET = process.env.CRON_SECRET || 'development-cron-secret'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.log('[CLAIMS CRON] Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CLAIMS CRON] Starting claims deadline processing...')
    const now = new Date()
    const results = {
      remindersProcessed: 0,
      holdsApplied: 0,
      errors: [] as string[]
    }

    // ========== STEP 1: Find claims needing 24-hour reminder ==========
    // Claims where deadline is within next 24 hours and no response yet
    const reminderWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

    const claimsNeedingReminder = await prisma.claim.findMany({
      where: {
        status: 'PENDING',
        guestResponseText: null,
        guestResponseDeadline: {
          gte: now,
          lte: reminderWindow
        },
        reminderSentAt: null, // Haven't sent reminder yet
        accountHoldApplied: false
      },
      include: {
        booking: {
          select: {
            bookingCode: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          }
        }
      }
    })

    console.log(`[CLAIMS CRON] Found ${claimsNeedingReminder.length} claims needing 24-hour reminder`)

    // Send reminder emails
    for (const claim of claimsNeedingReminder) {
      try {
        const hoursRemaining = Math.round(
          (claim.guestResponseDeadline!.getTime() - now.getTime()) / (1000 * 60 * 60)
        )

        // Build reminder email data
        const emailData = {
          guestName: claim.guestName || 'Guest',
          claimId: claim.id,
          bookingCode: claim.booking?.bookingCode || 'N/A',
          carDetails: claim.booking?.car
            ? `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
            : 'Vehicle',
          hoursRemaining,
          responseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/claims/${claim.id}`,
          consequences: 'Your account will be placed on hold and you will not be able to make new bookings. The claim may be decided without your input.'
        }

        // Generate and send reminder email
        const emailTemplate = getClaimReminderGuestTemplate(emailData)
        await sendEmail({
          to: claim.guestEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })

        // Mark reminder as sent
        await prisma.claim.update({
          where: { id: claim.id },
          data: { reminderSentAt: now }
        })

        results.remindersProcessed++
        console.log(`[CLAIMS CRON] Sent reminder for claim ${claim.id.slice(0, 8)}`)
      } catch (error) {
        const errorMsg = `Failed to send reminder for claim ${claim.id}: ${error}`
        console.error(`[CLAIMS CRON] ${errorMsg}`)
        results.errors.push(errorMsg)
      }
    }

    // ========== STEP 2: Apply account holds for expired deadlines ==========
    // Claims where deadline has passed and no response
    const expiredClaims = await prisma.claim.findMany({
      where: {
        status: 'PENDING',
        guestResponseText: null,
        guestResponseDeadline: {
          lt: now
        },
        accountHoldApplied: false
      },
      include: {
        booking: {
          select: {
            bookingCode: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            },
            host: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    console.log(`[CLAIMS CRON] Found ${expiredClaims.length} claims with expired deadlines`)

    // Apply account holds
    for (const claim of expiredClaims) {
      try {
        // Apply the account hold
        const holdApplied = await applyAccountHold(
          claim.guestEmail,
          claim.id,
          'Failed to respond to claim within 48 hours'
        )

        if (holdApplied) {
          // Send account hold notification email
          const emailData = {
            guestName: claim.guestName || 'Guest',
            claimId: claim.id,
            bookingCode: claim.booking?.bookingCode || 'N/A',
            carDetails: claim.booking?.car
              ? `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
              : 'Vehicle',
            claimType: claim.claimType,
            estimatedCost: claim.estimatedCost?.toNumber() || 0,
            hostName: claim.booking?.host?.name || 'Host',
            holdReason: 'Failed to respond to claim within 48 hours',
            responseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/claims/${claim.id}`,
            supportEmail: 'claims@itwhip.com'
          }

          const emailTemplate = getClaimAccountHoldAppliedTemplate(emailData)
          await sendEmail({
            to: claim.guestEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          })

          // Log activity
          await prisma.claimActivityLog.create({
            data: {
              claimId: claim.id,
              action: 'ACCOUNT_HOLD_APPLIED',
              description: 'Account hold applied due to missed response deadline',
              performedBy: 'SYSTEM',
              metadata: {
                deadlineExpiredAt: claim.guestResponseDeadline,
                processedAt: now.toISOString()
              }
            }
          })

          results.holdsApplied++
          console.log(`[CLAIMS CRON] Applied account hold for claim ${claim.id.slice(0, 8)}`)
        }
      } catch (error) {
        const errorMsg = `Failed to apply hold for claim ${claim.id}: ${error}`
        console.error(`[CLAIMS CRON] ${errorMsg}`)
        results.errors.push(errorMsg)
      }
    }

    console.log('[CLAIMS CRON] Processing complete:', results)

    return NextResponse.json({
      success: true,
      message: 'Claims deadline processing complete',
      results,
      processedAt: now.toISOString()
    })
  } catch (error) {
    console.error('[CLAIMS CRON] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process claims deadlines' },
      { status: 500 }
    )
  }
}

// Also support GET for easy testing/manual trigger
export async function GET(request: NextRequest) {
  // In development, allow GET without auth for testing
  if (process.env.NODE_ENV === 'development') {
    // Create a mock request with the auth header
    const mockRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })
    return POST(mockRequest)
  }

  return NextResponse.json({
    message: 'Claims deadline cron job endpoint',
    usage: 'POST with Authorization: Bearer <CRON_SECRET>',
    description: 'Processes claim response deadlines, sends reminders, and applies account holds'
  })
}
