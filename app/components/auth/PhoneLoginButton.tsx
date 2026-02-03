'use client'

import { useRouter } from 'next/navigation'

interface PhoneLoginButtonProps {
  hostMode?: boolean
}

export default function PhoneLoginButton({ hostMode = false }: PhoneLoginButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    // Navigate to phone login page with roleHint for host
    router.push(hostMode ? '/auth/phone-login?roleHint=host' : '/auth/phone-login')
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/25"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      Continue with Phone
    </button>
  )
}
