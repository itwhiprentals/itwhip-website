// app/(guest)/payments/layout.tsx
// Server component with authentication protection

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import PaymentsNav from './components/PaymentsNav'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) {
    redirect('/auth/login?redirect=/payments/methods')
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.userId) {
      redirect('/auth/login?redirect=/payments/methods')
    }

    return payload.userId as string
  } catch (error) {
    redirect('/auth/login?redirect=/payments/methods')
  }
}

export default async function PaymentsLayout({ children }: { children: React.ReactNode }) {
  // Verify authentication - redirects if not logged in
  await verifyAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PaymentsNav />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}
