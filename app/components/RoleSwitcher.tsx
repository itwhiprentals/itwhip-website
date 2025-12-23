// app/components/RoleSwitcher.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface DualRoleStatus {
  hasBothRoles: boolean
  hasHostProfile: boolean
  hasGuestProfile: boolean
  currentRole: 'host' | 'guest' | null
  hostApprovalStatus: string | null
}

export default function RoleSwitcher() {
  const [dualRoleStatus, setDualRoleStatus] = useState<DualRoleStatus | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch dual-role status on mount
  useEffect(() => {
    async function checkDualRole() {
      try {
        const response = await fetch('/api/auth/check-dual-role')

        if (response.ok) {
          const data = await response.json()
          setDualRoleStatus(data)
        }
      } catch (error) {
        console.error('[RoleSwitcher] Error checking dual role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkDualRole()
  }, [])

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

  // Handle role switch
  const handleSwitch = async (targetRole: 'host' | 'guest') => {
    setIsSwitching(true)
    setIsOpen(false)

    try {
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to the appropriate dashboard
        router.push(data.redirectUrl)
        // Force page reload to update all auth state
        router.refresh()
      } else {
        const error = await response.json()
        console.error('[RoleSwitcher] Switch failed:', error)
        alert('Failed to switch roles. Please try again.')
      }
    } catch (error) {
      console.error('[RoleSwitcher] Error switching roles:', error)
      alert('An error occurred while switching roles.')
    } finally {
      setIsSwitching(false)
    }
  }

  // Don't render if loading or user doesn't have both roles
  if (isLoading || !dualRoleStatus?.hasBothRoles) {
    return null
  }

  const currentRole = dualRoleStatus.currentRole
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
