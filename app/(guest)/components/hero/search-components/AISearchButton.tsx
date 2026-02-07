// app/(guest)/components/hero/search-components/AISearchButton.tsx
// Small red "AI" button — desktop: next to search button, mobile: inline icon

'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IoSparklesSharp } from 'react-icons/io5'

interface AISearchButtonProps {
  variant?: 'desktop' | 'mobile'
  onActivate?: () => void
}

export default function AISearchButton({ variant = 'desktop', onActivate }: AISearchButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onActivate) {
      onActivate()
    } else {
      router.push('/choe')
    }
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleClick}
        type="button"
        title="Try Choé"
        className="h-[34px] px-2.5 bg-red-600 hover:bg-red-700 rounded-md shadow-sm
          flex items-center gap-1 transition-all active:scale-95 overflow-hidden"
        aria-label="Try Choé"
      >
        <IoSparklesSharp className="w-3.5 h-3.5 text-white flex-shrink-0" />
        <Image src="/images/choe-logo.png" alt="Choé" width={80} height={30} className="h-[44px] w-auto brightness-0 invert" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      title="Try Choé"
      className="h-[38px] px-3 rounded-md bg-red-600 hover:bg-red-700
        text-white transition-all duration-200
        flex items-center justify-center gap-1 shadow-md
        hover:shadow-lg hover:scale-[1.02] active:scale-95 overflow-hidden"
    >
      <IoSparklesSharp className="w-3.5 h-3.5 flex-shrink-0" />
      <Image src="/images/choe-logo.png" alt="Choé" width={80} height={34} className="h-[50px] w-auto brightness-0 invert" />
    </button>
  )
}
