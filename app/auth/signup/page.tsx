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
      title="Create Account"
      subtitle="Sign up to start booking cars"
    >
      {/* Phone - Primary */}
      <PhoneLoginButton />

      {/* OAuth - Apple & Google */}
      <OAuthButtonsMinimal roleHint="guest" mode="signup" />

      {/* Email - Expandable */}
      <EmailLoginExpand mode="signup" />

      {/* Login Link */}
      <div className="pt-4 text-center">
        <p className="text-gray-400 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Host Portal Link */}
      <div className="pt-2 text-center">
        <Link
          href="/host/signup"
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          Want to list your car? Join as a Host →
        </Link>
      </div>
    </AuthPageLayout>
  )
}
