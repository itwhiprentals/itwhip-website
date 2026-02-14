// app/[locale]/error.tsx
'use client'

import { useTranslations } from 'next-intl'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Errors')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('somethingWentWrong')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('errorDescription')}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}
