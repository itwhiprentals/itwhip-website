// app/auth/signup/page.tsx
'use client'

import Link from 'next/link'
import AuthPageLayout from '@/app/components/auth/AuthPageLayout'
import PhoneLoginButton from '@/app/components/auth/PhoneLoginButton'
import OAuthButtonsMinimal from '@/app/components/auth/OAuthButtonsMinimal'
import EmailLoginExpand from '@/app/components/auth/EmailLoginExpand'

export default function SignupPage() {
  return (
    <AuthPageLayout
      title="Create a Guest Account"
      subtitle="Sign up to start booking cars and manage your trips"
    >
      {/* Phone - Primary */}
      <PhoneLoginButton mode="signup" />

      {/* OAuth - Apple & Google */}
      <OAuthButtonsMinimal roleHint="guest" mode="signup" />

      {/* Email - Expandable */}
      <EmailLoginExpand mode="signup" />

      {/* Login Link */}
      <div className="pt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Already have a Guest account?{' '}
          <Link href="/auth/login" className="text-green-600 dark:text-green-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Host Portal Link - Apple Card Style */}
      <div className="pt-4">
        <Link
          href="/host/signup"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-colors border border-gray-700 text-sm"
        >
          Want to list your car? Join as a Host →
        </Link>
      </div>
    </AuthPageLayout>
  )
}
