// app/components/LanguageSwitcher.tsx
// Circle flag button with dropdown — works in Header and Footer

'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { IoCheckmarkOutline, IoChevronDownOutline } from 'react-icons/io5'

// ── Circular SVG flag icons ─────────────────────────────────────────────
function USFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="rounded-full">
      <circle cx="20" cy="20" r="20" fill="#B22234" />
      {/* White stripes */}
      <rect y="6" width="40" height="3" fill="white" />
      <rect y="12" width="40" height="3" fill="white" />
      <rect y="18" width="40" height="3" fill="white" />
      <rect y="24" width="40" height="3" fill="white" />
      <rect y="30" width="40" height="3" fill="white" />
      {/* Blue canton */}
      <rect width="18" height="18" fill="#3C3B6E" />
      {/* Stars (simplified grid) */}
      {[3, 7, 11, 15].map(x =>
        [3, 7, 11, 15].map(y => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="white" />
        ))
      )}
    </svg>
  )
}

function SpainFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="rounded-full">
      <circle cx="20" cy="20" r="20" fill="#C60B1E" />
      <rect y="10" width="40" height="20" fill="#FFC400" />
    </svg>
  )
}

function FranceFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="rounded-full">
      <circle cx="20" cy="20" r="20" fill="#EF4135" />
      <rect width="13.33" height="40" fill="#002395" />
      <rect x="13.33" width="13.34" height="40" fill="white" />
    </svg>
  )
}

const localeConfig = {
  en: { label: 'English', Flag: USFlag },
  es: { label: 'Español', Flag: SpainFlag },
  fr: { label: 'Français', Flag: FranceFlag },
} as const

type LocaleCode = keyof typeof localeConfig
const localeCodes: LocaleCode[] = ['en', 'es', 'fr']

// ── Component ───────────────────────────────────────────────────────────
interface LanguageSwitcherProps {
  /** 'header' = circle only; 'footer' = circle + language name */
  variant?: 'header' | 'footer'
}

export default function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const locale = useLocale() as LocaleCode
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = localeConfig[locale] || localeConfig.en

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSwitch = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale })
    }
    setOpen(false)
  }

  const isHeader = variant === 'header'

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1 transition-all rounded-full ${
          isHeader
            ? 'p-1 hover:bg-gray-100 dark:hover:bg-gray-800 hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-700'
            : 'px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700'
        }`}
        aria-label="Change language"
        aria-expanded={open}
      >
        <current.Flag size={isHeader ? 22 : 18} />
        {!isHeader && (
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
            {current.label}
          </span>
        )}
        <IoChevronDownOutline className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute z-50 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden ${
          isHeader
            ? 'top-full right-0 mt-2'
            : 'bottom-full right-0 mb-2'
        }`}>
          {localeCodes.map(code => {
            const { label, Flag } = localeConfig[code]
            const isActive = code === locale
            return (
              <button
                key={code}
                onClick={() => handleSwitch(code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Flag size={22} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {isActive && (
                  <IoCheckmarkOutline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
