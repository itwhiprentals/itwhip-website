// app/(guest)/components/hero/search-components/AISearchButton.tsx
// Small red "AI" button — desktop: next to search button, mobile: inline icon

'use client'

import { useRouter } from 'next/navigation'
import { IoSparklesSharp } from 'react-icons/io5'

interface AISearchButtonProps {
  variant?: 'desktop' | 'mobile'
}

export default function AISearchButton({ variant = 'desktop' }: AISearchButtonProps) {
  const router = useRouter()

  if (variant === 'mobile') {
    return (
      <button
        onClick={() => router.push('/rentals/search?mode=ai')}
        type="button"
        title="Try ItWhip AI"
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md shadow-sm
          flex items-center gap-1.5 transition-all active:scale-95"
        aria-label="Try ItWhip AI"
      >
        <IoSparklesSharp className="w-3.5 h-3.5 text-white" />
        <span className="text-[10px] font-bold text-white whitespace-nowrap">Try ItWhip AI</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => router.push('/rentals/search?mode=ai')}
      type="button"
      title="Try AI Search"
      className="h-[38px] px-3 rounded-md bg-red-600 hover:bg-red-700
        text-white text-[11px] font-bold transition-all duration-200
        flex items-center justify-center gap-1 shadow-md
        hover:shadow-lg hover:scale-[1.02] active:scale-95"
    >
      <IoSparklesSharp className="w-3 h-3" />
      <span>AI</span>
    </button>
  )
}
