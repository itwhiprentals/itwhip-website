// app/host/page.tsx
// Redirect /host to /host/dashboard or /host/login based on auth status

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function HostIndexPage() {
  // Check for host access token
  const cookieStore = await cookies()
  const hostToken = cookieStore.get('host_access_token')

  if (hostToken?.value) {
    // User has host token, redirect to dashboard
    redirect('/host/dashboard')
  } else {
    // No host token, redirect to login
    redirect('/host/login')
  }
}
