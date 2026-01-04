// app/invite/owner/[token]/page.tsx
// Redirect page for owner invitations (Manager inviting Owner)
// This is just a redirect to the main view page

import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function OwnerInvitePage({ params }: PageProps) {
  const { token } = await params
  redirect(`/invite/view/${token}`)
}
