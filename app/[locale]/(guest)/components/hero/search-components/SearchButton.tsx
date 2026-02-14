// app/(guest)/components/hero/search-components/SearchButton.tsx
// Search submit button with loading state

'use client'

import { useTranslations } from 'next-intl'
import { IoSearchOutline } from 'react-icons/io5'

interface SearchButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export default function SearchButton({
  onClick,
  disabled = false,
  isLoading = false,
  className = ''
}: SearchButtonProps) {
  const t = useTranslations('Search')
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      type="button"
      className={`h-[38px] px-4 font-semibold rounded-md 
        transition-all duration-200 whitespace-nowrap text-[12px] 
        flex items-center justify-center gap-1.5 ${
        disabled
          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md'
      } ${className}`}
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <IoSearchOutline className="w-3.5 h-3.5" />
          <span>{t('search')}</span>
        </>
      )}
    </button>
  )
}