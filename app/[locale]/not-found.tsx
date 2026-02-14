// app/[locale]/not-found.tsx
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('Errors')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('notFound')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('notFoundDescription')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  )
}
