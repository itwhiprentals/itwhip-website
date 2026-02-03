'use client'

import { useEffect } from 'react'

interface VerifyLinkSuccessProps {
  providerName: string
}

export default function VerifyLinkSuccess({ providerName }: VerifyLinkSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/'
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="text-center space-y-4">
      <div className="inline-block bg-green-500/20 border border-green-500/50 rounded-full p-4">
        <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white">
        {providerName} Linked!
      </h3>
      <p className="text-gray-400">
        Redirecting to your dashboard...
      </p>
    </div>
  )
}
