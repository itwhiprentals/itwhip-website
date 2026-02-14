// app/partner/components/PortalLanguageSwitcher.tsx
// Cookie-based language switcher for partner portal
// (Partner portal is NOT under [locale]/ routing — uses NEXT_LOCALE cookie instead)

'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const localeLabels: Record<string, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
}

const locales = ['en', 'es', 'fr'] as const

export default function PortalLanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  const handleSwitch = async (newLocale: string) => {
    if (newLocale === locale || switching) return
    setSwitching(true)

    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      })
      router.refresh()
    } catch (err) {
      console.error('Failed to switch locale:', err)
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="text-gray-300 dark:text-gray-600 text-xs mx-0.5">|</span>}
          <button
            onClick={() => handleSwitch(l)}
            disabled={switching}
            className={`text-xs font-medium transition-colors px-1 py-0.5 rounded ${
              l === locale
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            } ${switching ? 'opacity-50 cursor-wait' : ''}`}
          >
            {localeLabels[l]}
          </button>
        </span>
      ))}
    </div>
  )
}
