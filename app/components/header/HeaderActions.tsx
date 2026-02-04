// app/components/header/HeaderActions.tsx
'use client'

// Right side actions for Header: Theme toggle, Notifications, Sign In, Role Switcher, Mobile Menu

import Link from 'next/link'
import {
  IoSunnyOutline,
  IoMoonOutline,
  IoMenuOutline,
  IoCloseOutline
} from 'react-icons/io5'
import NotificationBell from '../notifications/NotificationBell'
import RoleSwitcher from '../RoleSwitcher'

interface HeaderActionsProps {
  // Theme
  isDarkMode: boolean
  onToggleTheme: () => void

  // User state
  isLoggedIn: boolean
  isTransitioning: boolean
  isCheckingAuth: boolean

  // User type flags
  isGuest: boolean
  isHost: boolean
  isAdmin: boolean

  // Page context
  isHostPage: boolean
  isAdminPage: boolean

  // User data for RoleSwitcher
  profilePhotoUrl?: string
  userName?: string

  // Mobile menu
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

export default function HeaderActions({
  isDarkMode,
  onToggleTheme,
  isLoggedIn,
  isTransitioning,
  isCheckingAuth,
  isGuest,
  isHost,
  isAdmin,
  isHostPage,
  isAdminPage,
  profilePhotoUrl,
  userName,
  isMobileMenuOpen,
  onToggleMobileMenu
}: HeaderActionsProps) {
  return (
    <div className="flex items-center">
      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <IoSunnyOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <IoMoonOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Notifications - Show for logged in users */}
      {isLoggedIn && !isTransitioning && (
        <div className="ml-2">
          {isGuest && <NotificationBell userRole="GUEST" />}
          {isHost && <NotificationBell userRole="HOST" />}
          {isAdmin && <NotificationBell userRole="ADMIN" />}
        </div>
      )}

      {/* Sign In Button - Only when not logged in */}
      {!isLoggedIn && !isCheckingAuth && (
        <Link
          href={
            isAdminPage ? '/admin/auth/login' :
            isHostPage ? '/host/login' :
            '/auth/login'
          }
          className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-sm"
        >
          Sign In
        </Link>
      )}

      {/* Role Switcher - stays visible during switching to show spinner */}
      {isLoggedIn && (
        <div className="ml-3">
          <RoleSwitcher
            profilePhoto={profilePhotoUrl}
            userName={userName}
          />
        </div>
      )}

      {/* Mobile Menu Toggle - Always rightmost */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <IoCloseOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <IoMenuOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </div>
  )
}
