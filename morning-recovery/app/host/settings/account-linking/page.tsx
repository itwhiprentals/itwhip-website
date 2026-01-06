// app/host/settings/account-linking/page.tsx
// Host settings page for account linking

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import Link from 'next/link'
import { prisma } from '@/app/lib/database/prisma'
import { AccountLinking } from '@/app/lib/components/account-linking'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { IoArrowBackOutline } from 'react-icons/io5'

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

    // If user has legacyDualId, fetch the linked account's email
    let linkedAccountEmail: string | null = null
    if (user.legacyDualId) {
      const linkedUser = await prisma.user.findFirst({
        where: {
          legacyDualId: user.legacyDualId,
          id: { not: user.id }
        },
        select: { email: true }
      })
      linkedAccountEmail = linkedUser?.email || null
    }

    return {
      ...user,
      linkedAccountEmail
    }
  } catch (error) {
    redirect('/auth/login')
  }
}

export default async function AccountLinkingPage() {
  const user = await getCurrentUser()

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Back to Dashboard */}
          <Link
            href="/host/dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Account Settings
          </h1>

          {/* Account Linking Component */}
          <AccountLinking currentUser={user} userType="host" />
        </div>
      </div>
      <Footer />
    </>
  )
}
