// app/api/partner/reviews/[id]/respond/route.ts
// Partner API to respond to a review

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
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

    const { id: reviewId } = await params
    const body = await request.json()
    const { response } = body

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'Response cannot be empty' },
        { status: 400 }
      )
    }

    if (response.length > 2000) {
      return NextResponse.json(
        { error: 'Response cannot exceed 2000 characters' },
        { status: 400 }
      )
    }

    // Verify review belongs to partner
    const review = await prisma.rentalReview.findFirst({
      where: {
        id: reviewId,
        hostId: partner.id
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review with response
    const updatedReview = await prisma.rentalReview.update({
      where: { id: reviewId },
      data: {
        hostResponse: response.trim(),
        hostRespondedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        hostResponse: updatedReview.hostResponse,
        hostRespondedAt: updatedReview.hostRespondedAt?.toISOString()
      },
      message: 'Response posted successfully'
    })

  } catch (error) {
    console.error('[Partner Review Respond] Error:', error)
    return NextResponse.json({ error: 'Failed to post response' }, { status: 500 })
  }
}

// DELETE - Remove response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: reviewId } = await params

    // Verify review belongs to partner
    const review = await prisma.rentalReview.findFirst({
      where: {
        id: reviewId,
        hostId: partner.id
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Remove response
    await prisma.rentalReview.update({
      where: { id: reviewId },
      data: {
        hostResponse: null,
        hostRespondedAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Response removed'
    })

  } catch (error) {
    console.error('[Partner Review Delete Response] Error:', error)
    return NextResponse.json({ error: 'Failed to remove response' }, { status: 500 })
  }
}
