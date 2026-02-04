// app/components/RoleSwitcher.tsx
'use client'

// Unified user action pill: Role switcher + Avatar + optional Hamburger menu
// Design: ( Guest < O | ≡ ) or just ( O ) for single-role users

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

interface RoleSwitcherProps {
  profilePhoto?: string | null
  userName?: string | null
  // Mobile menu integration (for guest header)
  showHamburger?: boolean
  isMobileMenuOpen?: boolean
  onToggleMobileMenu?: () => void
}

export default function RoleSwitcher({
  profilePhoto,
  userName,
  showHamburger = false,
  isMobileMenuOpen = false,
  onToggleMobileMenu
}: RoleSwitcherProps) {
  const {
    hasBothProfiles,
    currentRole,
    isLoading,
    switchRole
  } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [imageError, setImageError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle role switch
  const handleSwitch = async (targetRole: 'host' | 'guest') => {
    if (isSwitching || targetRole === currentRole) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)
    setIsOpen(false)

    try {
      const success = await switchRole(targetRole)

      if (success) {
        if (targetRole === 'host') {
          window.location.href = '/host/dashboard'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        console.error('[RoleSwitcher] Switch failed')
        setIsSwitching(false)
      }
    } catch (error) {
      console.error('[RoleSwitcher] Error switching roles:', error)
      setIsSwitching(false)
    }
  }

  // Handle hamburger click (stop propagation to prevent dropdown toggle)
  const handleHamburgerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleMobileMenu?.()
  }

  // Don't render if still loading
  if (isLoading) {
    return null
  }

  const isHost = currentRole === 'host'
  const userInitial = (userName || 'U')[0].toUpperCase()
  const showRoleSwitcher = hasBothProfiles

  // Avatar component (reused in both modes) - small size to match original
  const Avatar = (
    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-500 shadow-sm flex-shrink-0">
      {profilePhoto && !imageError ? (
        <img
          src={profilePhoto}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-gray-500 dark:bg-gray-600">
          {userInitial}
        </div>
      )}
    </div>
  )

  // Hamburger icon component - centered with proper padding
  const HamburgerIcon = (
    <button
      onClick={handleHamburgerClick}
      className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
      aria-label="Toggle menu"
    >
      {isMobileMenuOpen ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      )}
    </button>
  )

  // Single-role user: Just show avatar (+ optional hamburger)
  if (!showRoleSwitcher) {
    return (
      <div className={`
        flex items-center gap-1 pl-1 pr-1 py-0.5
        border rounded-lg
        border-gray-300 dark:border-gray-600
        bg-gray-50 dark:bg-gray-800
      `}>
        {Avatar}
        {showHamburger && (
          <>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            {HamburgerIcon}
          </>
        )}
      </div>
    )
  }

  // Dual-role user: Full role switcher with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main button: ( Guest < O | ≡ ) */}
      <div className={`
        flex items-center
        border rounded-lg
        border-gray-300 dark:border-gray-600
        bg-gray-50 dark:bg-gray-800
        text-gray-700 dark:text-gray-300
      `}>
        {/* Role switcher part (clickable for dropdown) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className={`
            flex items-center gap-1.5 pl-2 pr-1.5 py-1
            text-xs font-medium
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-wait
            hover:bg-gray-100 dark:hover:bg-gray-700
            active:bg-gray-200 dark:active:bg-gray-600
            ${showHamburger ? 'rounded-l-lg' : 'rounded-lg'}
          `}
          aria-label={`Currently in ${isHost ? 'Host' : 'Guest'} mode. Click to switch roles.`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {/* Role label with spinner when switching */}
          <span className="leading-none flex items-center gap-1">
            {isHost ? 'Host' : 'Guest'}
            {isSwitching && (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </span>

          {/* Dropdown chevron - hide when switching */}
          <svg
            className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''} ${isSwitching ? 'hidden' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>

          {/* Avatar */}
          {Avatar}
        </button>

        {/* Divider + Hamburger (when showHamburger is true) */}
        {showHamburger && (
          <div className="flex items-center gap-0.5 pr-1">
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            {HamburgerIcon}
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => handleSwitch('guest')}
            className={`
              w-full px-4 py-2.5 text-left text-sm
              flex items-center gap-2
              transition-colors
              ${currentRole === 'guest'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className={`w-2 h-2 rounded-full ${currentRole === 'guest' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            Guest
          </button>
          <button
            onClick={() => handleSwitch('host')}
            className={`
              w-full px-4 py-2.5 text-left text-sm
              flex items-center gap-2
              transition-colors
              ${currentRole === 'host'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className={`w-2 h-2 rounded-full ${currentRole === 'host' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            Host
          </button>
        </div>
      )}
    </div>
  )
}
