// app/components/header/HeaderActions.tsx
'use client'

// Right side actions for Header: Theme toggle, Notifications, Sign In/RoleSwitcher
// When logged in: Hamburger is integrated into RoleSwitcher pill
// When logged out: Standalone hamburger button

import { Link } from '@/i18n/navigation'
import NextLink from 'next/link'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import {
  IoSunnyOutline,
  IoMoonOutline,
  IoMenuOutline,
  IoCloseOutline
} from 'react-icons/io5'
import RoleSwitcher from '../RoleSwitcher'

// Dynamic import: react-query in useNotifications crashes during SSR
const NotificationBell = dynamic(() => import('../notifications/NotificationBell'), { ssr: false })

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
  isChoeStandalone?: boolean

  // User data for RoleSwitcher
  profilePhotoUrl?: string
  userName?: string

  // Mobile menu
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void

  // i18n language switcher (optional — only passed inside [locale] context)
  languageSwitcher?: React.ReactNode
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
  isChoeStandalone,
  profilePhotoUrl,
  userName,
  isMobileMenuOpen,
  onToggleMobileMenu,
  languageSwitcher
}: HeaderActionsProps) {
  const t = useTranslations('Header')

  return (
    <div className="flex items-center gap-1 mr-4">
      {/* Language Switcher — only rendered inside i18n context */}
      {languageSwitcher && (
        <div className="mr-1">{languageSwitcher}</div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        aria-label={t('toggleTheme')}
      >
        {isDarkMode ? (
          <IoSunnyOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <IoMoonOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* On /choe standalone: just show Classic Search, skip everything else */}
      {isChoeStandalone ? (
        <Link
          href="/rentals/search"
          className="text-[11px] font-semibold text-white px-3 py-1.5 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-sm"
        >
          {t('classicSearch')}
        </Link>
      ) : (
        <>
          {/* Notifications - Show for logged in users */}
          {isLoggedIn && !isTransitioning && (
            <>
              {isGuest && <NotificationBell userRole="GUEST" />}
              {isHost && <NotificationBell userRole="HOST" />}
              {isAdmin && <NotificationBell userRole="ADMIN" />}
            </>
          )}

          {/* Sign In Button - Only when not logged in */}
          {/* Portal pages (admin/host) use NextLink to avoid locale prefix */}
          {!isLoggedIn && !isCheckingAuth && (
            (isAdminPage || isHostPage) ? (
              <NextLink
                href={isAdminPage ? '/admin/auth/login' : '/host/login'}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-sm"
              >
                {t('signIn')}
              </NextLink>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-sm"
              >
                {t('signIn')}
              </Link>
            )
          )}

          {/* Role Switcher with integrated hamburger (when logged in) */}
          {isLoggedIn && (
            <>
              <div className="lg:hidden ml-2 -mr-2">
                <RoleSwitcher
                  profilePhoto={profilePhotoUrl}
                  userName={userName}
                  showHamburger={true}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onToggleMobileMenu={onToggleMobileMenu}
                />
              </div>
              <div className="hidden lg:block ml-2 -mr-2">
                <RoleSwitcher
                  profilePhoto={profilePhotoUrl}
                  userName={userName}
                  showHamburger={false}
                />
              </div>
            </>
          )}

          {/* Standalone Mobile Menu Toggle - Only when NOT logged in */}
          {!isLoggedIn && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label={t('toggleMenu')}
            >
              {isMobileMenuOpen ? (
                <IoCloseOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <IoMenuOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
