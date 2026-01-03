// app/components/RoleSwitcher.tsx
'use client'

// Industry Best Practice: Use centralized auth context for instant role switching
// - No page refresh needed
// - Header updates automatically when context changes
// - Google/Airbnb-style instant switching UX

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

export default function RoleSwitcher() {
  const {
    hasBothProfiles,
    currentRole,
    isLoading,
    switchRole
  } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle role switch - uses AuthContext for instant update
  const handleSwitch = async (targetRole: 'host' | 'guest') => {
    setIsSwitching(true)
    setIsOpen(false)

    try {
      // Use context's switchRole - this updates auth state automatically
      const success = await switchRole(targetRole)

      if (success) {
        // CRITICAL: Use window.location.href for HARD redirect
        // router.push() is a soft navigation that doesn't reload cookies properly
        // This ensures middleware and server components get fresh auth state
        if (targetRole === 'host') {
          console.log('[RoleSwitcher] Switching to host - hard redirect to /host/dashboard')
          window.location.href = '/host/dashboard'
        } else {
          console.log('[RoleSwitcher] Switching to guest - hard redirect to /dashboard')
          window.location.href = '/dashboard'
        }
      } else {
        console.error('[RoleSwitcher] Switch failed')
        alert('Failed to switch roles. Please try again.')
        setIsSwitching(false)
      }
    } catch (error) {
      console.error('[RoleSwitcher] Error switching roles:', error)
      alert('An error occurred while switching roles.')
      setIsSwitching(false)
    }
    // Note: Don't setIsSwitching(false) on success - page will reload anyway
  }

  // Don't render if loading or user doesn't have both roles
  if (isLoading || !hasBothProfiles) {
    return null
  }

  const currentRoleLabel = currentRole === 'host' ? 'Host' : 'Guest'
  const targetRole = currentRole === 'host' ? 'guest' : 'host'
  const targetRoleLabel = targetRole === 'host' ? 'Host' : 'Guest'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Role Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="
          flex items-center gap-2 px-4 py-2
          text-sm font-medium
          border border-gray-300 dark:border-gray-600
          rounded-lg
          text-gray-700 dark:text-gray-300
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label={`Currently in ${currentRoleLabel} mode. Click to switch roles.`}
      >
        <span>{currentRoleLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-56
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-md shadow-lg
          z-50
        ">
          <div className="py-1">
            {/* Current Mode (checked) */}
            <div className="
              flex items-center gap-3 px-4 py-3
              text-sm font-medium text-gray-700 dark:text-gray-300
              bg-gray-50 dark:bg-gray-700
            ">
              <span className="flex-1">{currentRoleLabel} Mode</span>
              <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

            {/* Switch to Other Mode */}
            <button
              onClick={() => handleSwitch(targetRole)}
              disabled={isSwitching}
              className="
                w-full flex items-center gap-3 px-4 py-3
                text-sm text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <span className="flex-1 text-left">
                {isSwitching ? 'Switching...' : `Switch to ${targetRoleLabel} Mode`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
