// app/(guest)/rentals/components/verification/GuestPrompt.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoPersonAddOutline,
  IoCheckmarkOutline,
  IoSparklesOutline,
  IoCarOutline,
  IoTimeOutline,
  IoWalletOutline
} from 'react-icons/io5'

interface GuestPromptProps {
  email: string
  token: string
}

export default function GuestPrompt({ email, token }: GuestPromptProps) {
  const router = useRouter()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  const benefits = [
    { icon: IoTimeOutline, text: 'Skip verification on future bookings' },
    { icon: IoCarOutline, text: 'Access to exclusive member-only vehicles' },
    { icon: IoWalletOutline, text: 'Earn rewards and discounts' },
    { icon: IoSparklesOutline, text: 'Priority support and faster approvals' }
  ]

  const handleCreateAccount = () => {
    // Store the token and email in session storage for post-signup redirect
    sessionStorage.setItem('guestConversionToken', token)
    sessionStorage.setItem('guestEmail', email)
    router.push(`/auth/signup?email=${encodeURIComponent(email)}&from=guest`)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-lg p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start mb-4">
        <IoPersonAddOutline className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Create an Account for Faster Bookings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You're booking as a guest. Create a free account to unlock member benefits!
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div key={index} className="flex items-center">
              <Icon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {benefit.text}
              </span>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          We'll pre-fill your information:
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {email}
          </span>
          <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCreateAccount}
          disabled={isCreatingAccount}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {isCreatingAccount ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </>
          ) : (
            <>
              <IoPersonAddOutline className="w-5 h-5 mr-2" />
              Create Free Account
            </>
          )}
        </button>
        
        <button
          onClick={() => router.push(`/rentals/dashboard/guest/${token}`)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Continue as Guest
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}