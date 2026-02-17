import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return await prisma.rentalHost.findUnique({
      where: { id: payload.hostId as string }
    })
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    let action: string | undefined
    try {
      const body = await request.json()
      action = body.action
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!action || !['approve', 'claim'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "claim"' }, { status: 400 })
    }

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id,
      },
      select: {
        id: true,
        status: true,
        bookingCode: true,
        hostFinalReviewStatus: true,
        depositAmount: true,
        depositFromWallet: true,
        depositFromCard: true,
        depositUsedForClaim: true,
        paymentIntentId: true,
        guestEmail: true,
        guestName: true,
        tripEndedAt: true,
        car: {
          select: { make: true, model: true, year: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Booking must be COMPLETED for final review' }, { status: 400 })
    }

    if (booking.hostFinalReviewStatus !== 'PENDING_REVIEW') {
      return NextResponse.json({
        error: 'Review already submitted',
        currentStatus: booking.hostFinalReviewStatus
      }, { status: 400 })
    }

    // ── APPROVE: Release deposit ──
    if (action === 'approve') {
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          hostFinalReviewStatus: 'APPROVED',
          hostFinalReviewAt: new Date(),
        }
      })

      // Release deposit
      if (booking.depositAmount > 0 && booking.paymentIntentId) {
        const claimDeduction = booking.depositUsedForClaim || 0
        const netDeposit = booking.depositAmount - claimDeduction

        if (netDeposit > 0) {
          const walletPortion = Math.min(booking.depositFromWallet || 0, netDeposit)
          const cardPortion = netDeposit - walletPortion

          // Release card portion via Stripe refund
          if (cardPortion > 0) {
            try {
              const { releaseSecurityDeposit } = await import('@/app/lib/booking/services/payment-service')
              const refundResult = await releaseSecurityDeposit({
                bookingId: booking.id,
                depositAmount: Math.round(cardPortion * 100),
              })
              if (refundResult.success) {
                console.log(`[Final Review] Deposit released for ${booking.bookingCode}: $${cardPortion.toFixed(2)} via Stripe`)
              } else {
                console.error(`[Final Review] Stripe refund failed for ${booking.bookingCode}: ${refundResult.error}`)
              }
            } catch (e) {
              console.error(`[Final Review] Stripe refund error for ${booking.bookingCode}:`, e)
            }
          }

          // Return wallet portion to guest
          if (walletPortion > 0) {
            const guestProfile = await prisma.reviewerProfile.findFirst({
              where: { email: booking.guestEmail.toLowerCase() },
              select: { id: true, depositWalletBalance: true },
            })
            if (guestProfile) {
              await prisma.$transaction([
                prisma.reviewerProfile.update({
                  where: { id: guestProfile.id },
                  data: { depositWalletBalance: { increment: walletPortion } },
                }),
                prisma.depositTransaction.create({
                  data: {
                    id: crypto.randomUUID(),
                    guestId: guestProfile.id,
                    type: 'RELEASE',
                    amount: walletPortion,
                    balanceAfter: (guestProfile.depositWalletBalance || 0) + walletPortion,
                    bookingId: booking.id,
                    description: `Deposit released for booking ${booking.bookingCode} after host review`,
                  },
                }),
              ])
              console.log(`[Final Review] Wallet deposit returned for ${booking.bookingCode}: $${walletPortion.toFixed(2)}`)
            }
          }

          // Mark as refunded if only wallet (card path handled by releaseSecurityDeposit)
          if (cardPortion <= 0 && walletPortion > 0) {
            await prisma.rentalBooking.update({
              where: { id: booking.id },
              data: {
                depositRefunded: netDeposit,
                depositRefundedAt: new Date(),
              },
            })
          }

          // Send deposit release email (fire-and-forget)
          import('@/app/lib/email/deposit-release-email').then(({ sendDepositReleasedEmail }) => {
            sendDepositReleasedEmail({
              guestEmail: booking.guestEmail,
              guestName: booking.guestName,
              bookingCode: booking.bookingCode,
              carMake: booking.car.make,
              carModel: booking.car.model,
              depositAmount: netDeposit,
              cardRefundAmount: cardPortion,
              walletReturnAmount: walletPortion,
              tripEndDate: booking.tripEndedAt!,
            }).catch(() => {})
          }).catch(() => {})
        }
      }

      console.log(`[Final Review] Host approved trip for ${booking.bookingCode}`)
      return NextResponse.json({ success: true, status: 'APPROVED' })
    }

    // ── CLAIM: Hold deposit, redirect to claims ──
    if (action === 'claim') {
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          hostFinalReviewStatus: 'CLAIM_FILED',
          hostFinalReviewAt: new Date(),
        }
      })

      console.log(`[Final Review] Host filed claim for ${booking.bookingCode} — deposit held`)
      return NextResponse.json({
        success: true,
        status: 'CLAIM_FILED',
        claimUrl: `/partner/claims/new?bookingId=${bookingId}`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Final Review] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
