import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Check if an email belongs to any existing user/host/prospect
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const apiKey = searchParams.get('key')
  const excludeProspectId = searchParams.get('excludeId') // Exclude current prospect being edited

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 })
  }

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    // Check if email belongs to a RentalHost (these are actual hosts who signed up)
    const host = await prisma.rentalHost.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' }
      },
      select: { id: true, name: true, approvalStatus: true }
    })

    if (host) {
      return NextResponse.json({
        exists: true,
        owner: `${host.name || 'Unknown'} (Host - ${host.approvalStatus})`,
        type: 'host'
      })
    }

    // Check if email belongs to a HostProspect (different prospect, not the one being edited)
    const prospect = await prisma.hostProspect.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        ...(excludeProspectId ? { id: { not: excludeProspectId } } : {})
      },
      select: { id: true, name: true, status: true, inviteSentAt: true, inviteResendCount: true }
    })

    if (prospect) {
      // Calculate contact count: 1 (initial) + resends, or 0 if never sent
      const contactCount = prospect.inviteSentAt ? 1 + prospect.inviteResendCount : 0
      const contactInfo = contactCount > 0 ? ` - contacted ${contactCount}x` : ' - not contacted'
      return NextResponse.json({
        exists: true,
        owner: `${prospect.name || 'Unknown'} (Prospect - ${prospect.status}${contactInfo})`,
        type: 'prospect',
        prospectId: prospect.id,
        contactCount
      })
    }

    // Check if email belongs to a User/Renter
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' }
      },
      select: { id: true, name: true, createdAt: true }
    })

    if (user) {
      const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'
      return NextResponse.json({
        exists: true,
        owner: `${user.name || 'Unknown'} (Renter since ${joinDate})`,
        type: 'user'
      })
    }

    // Check if email belongs to a ReviewerProfile (guest who has booked)
    const reviewer = await prisma.reviewerProfile.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' }
      },
      select: { id: true, name: true, createdAt: true }
    })

    if (reviewer) {
      const joinDate = reviewer.createdAt ? new Date(reviewer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'
      return NextResponse.json({
        exists: true,
        owner: `${reviewer.name || 'Unknown'} (Guest since ${joinDate})`,
        type: 'guest'
      })
    }

    // Email not found - new person
    return NextResponse.json({
      exists: false,
      owner: null,
      type: null,
      message: 'New guest - not in our system'
    })

  } catch (error) {
    console.error('Failed to check email:', error)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}
