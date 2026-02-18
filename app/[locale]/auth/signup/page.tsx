// app/auth/signup/page.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import AuthPageLayout from '@/app/components/auth/AuthPageLayout'
import PhoneLoginButton from '@/app/components/auth/PhoneLoginButton'
import OAuthButtonsMinimal from '@/app/components/auth/OAuthButtonsMinimal'
import EmailLoginExpand from '@/app/components/auth/EmailLoginExpand'

export default function SignupPage() {
  const t = useTranslations('Auth')

  return (
    <AuthPageLayout
      title={t('createGuestAccount')}
      subtitle={t('signupSubtitle')}
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
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-green-600 dark:text-green-400 hover:underline font-medium">
            {t('signIn')}
          </Link>
        </p>
      </div>

      {/* Host Portal Link - Apple Card Style */}
      <div className="pt-4">
        <a
          href="/host/signup"
          className="w-full flex flex-col items-center justify-center gap-0.5 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors border border-gray-700 text-sm text-center"
        >
          <span className="text-gray-300 text-xs">{t('wantToHostQuestion')}</span>
          <span className="font-medium">{t('wantToHostAction')}</span>
        </a>
      </div>
    </AuthPageLayout>
  )
}
