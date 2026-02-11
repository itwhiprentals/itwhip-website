// app/invite/owner/[token]/page.tsx
// Redirect page for owner invitations (Manager inviting Owner)
// Checks if user is authenticated, redirects to signup if not

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function OwnerInvitePage({ params }: PageProps) {
  const { token } = await params

  // Validate the invitation token exists and is valid
  const invitation = await prisma.managementInvitation.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      type: true,
      expiresAt: true
    }
  })

  // If invitation doesn't exist or is invalid, still redirect to view
  // The view page will show an appropriate error message
  if (!invitation) {
    redirect(`/invite/view/${token}`)
  }

  // If invitation is not for a car owner, redirect to view
  if (invitation.type !== 'MANAGER_INVITES_OWNER') {
    redirect(`/invite/view/${token}`)
  }

  // Check if user is logged in as a partner
  const cookieStore = await cookies()
  const partnerToken = cookieStore.get('partner_token')

  if (partnerToken) {
    try {
      // Verify the token is valid
      const { payload } = await jwtVerify(partnerToken.value, JWT_SECRET)

      if (payload.hostId && payload.isPartner) {
        // User is logged in as a partner, redirect to view the invitation
        redirect(`/invite/view/${token}`)
      }
    } catch (error) {
      // Token is invalid, continue to signup redirect
      console.log('[Owner Invite] Invalid partner token, redirecting to signup')
    }
  }

  // User is not logged in as a partner, redirect to signup with the token
  redirect(`/partners/apply/start?token=${token}`)
}
