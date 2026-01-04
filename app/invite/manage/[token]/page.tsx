// app/invite/manage/[token]/page.tsx
// Redirect page for management invitations (Owner inviting Manager)
// This is just a redirect to the main view page

import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ManageInvitePage({ params }: PageProps) {
  const { token } = await params
  redirect(`/invite/view/${token}`)
}
