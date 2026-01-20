// app/api/auth/invite/[token]/route.ts
// Magic link handler for host prospect invitations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET /api/auth/invite/[token] - Validate invite and redirect
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'

    // Find the prospect with this token
    const prospect = await prisma.hostProspect.findUnique({
      where: { inviteToken: token },
      include: {
        request: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!prospect) {
      // Invalid token - redirect to error page
      return NextResponse.redirect(`${baseUrl}/invite/invalid`)
    }

    // Check if token is expired
    if (prospect.inviteTokenExp && new Date() > prospect.inviteTokenExp) {
      return NextResponse.redirect(`${baseUrl}/invite/expired?email=${encodeURIComponent(prospect.email)}`)
    }

    // Mark link as clicked
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        linkClickedAt: new Date(),
        status: prospect.status === 'EMAIL_SENT' || prospect.status === 'EMAIL_OPENED'
          ? 'LINK_CLICKED'
          : prospect.status
      }
    })

    // Check if this email already has a host account
    let host = await prisma.rentalHost.findFirst({
      where: { email: prospect.email.toLowerCase() }
    })

    if (host) {
      // Existing host - link the prospect and log them in
      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          convertedHostId: host.id,
          convertedAt: new Date(),
          status: 'CONVERTED'
        }
      })
    } else {
      // Create a new host account from prospect data
      const hostId = nanoid()

      host = await prisma.rentalHost.create({
        data: {
          id: hostId,
          email: prospect.email.toLowerCase(),
          name: prospect.name,
          phone: prospect.phone || '',
          city: 'Phoenix', // Default, they can update later
          state: 'AZ',
          hostType: 'PENDING',
          approvalStatus: 'PENDING',
          // Mark as needing to complete profile
          documentsVerified: false,
          isVerified: false
        }
      })

      // Link prospect to new host
      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          convertedHostId: host.id,
          convertedAt: new Date(),
          status: 'CONVERTED'
        }
      })
    }

    // Generate auth token for the host
    const authToken = sign(
      {
        hostId: host.id,
        email: host.email,
        name: host.name,
        type: 'host'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set('partner_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Determine redirect destination
    let redirectUrl = `${baseUrl}/partner/dashboard`

    // If there's an associated request that's still open, redirect to it
    if (prospect.requestId && prospect.request?.status === 'OPEN') {
      redirectUrl = `${baseUrl}/partner/requests/${prospect.requestId}`
    } else {
      // Otherwise, go to the open requests page
      redirectUrl = `${baseUrl}/partner/requests`
    }

    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('[Invite Auth] Error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    return NextResponse.redirect(`${baseUrl}/invite/error`)
  }
}
