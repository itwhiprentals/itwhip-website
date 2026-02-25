'use client'

import { useTranslations } from 'next-intl'
import { RefreshCw, Edit } from './DashboardIcons'

interface ProfileCardProps {
  userName: string
  userAvatar: string
  verified: boolean
  memberSince: string
  isRefreshing: boolean
  profileLoaded: boolean
  onRefresh: () => void
  onEditProfile: () => void
}

export default function ProfileCard({
  userName, userAvatar, verified, memberSince,
  isRefreshing, profileLoaded, onRefresh, onEditProfile
}: ProfileCardProps) {
  const t = useTranslations('GuestDashboard')

  return (
    <div
      className={`-mx-2 sm:mx-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-all duration-500 ${
        profileLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <img
            src={userAvatar}
            alt={`${userName}'s profile picture`}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full ring-2 ring-green-500 flex-shrink-0 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.svg'
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {userName}
              </h2>
              {verified && (
                <span className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {t('verified')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('phoenixAZ')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{memberSince}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`hidden sm:flex p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            aria-label={t('refreshDashboard')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onEditProfile}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm flex items-center gap-1.5"
            aria-label={t('editProfile')}
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">{t('editButton')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
