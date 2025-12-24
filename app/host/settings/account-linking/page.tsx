// app/host/settings/account-linking/page.tsx
// Host settings page for account linking

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { AccountLinking } from '@/app/lib/components/account-linking'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hostAccessToken')?.value || cookieStore.get('accessToken')?.value

  if (!token) {
    redirect('/auth/login')
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.userId) {
      redirect('/auth/login')
    }

    // Fetch user with legacyDualId
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        legacyDualId: true
      }
    })

    if (!user) {
      redirect('/auth/login')
    }

    return user
  } catch (error) {
    redirect('/auth/login')
  }
}

export default async function AccountLinkingPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <AccountLinking currentUser={user} />
      </div>
    </div>
  )
}
