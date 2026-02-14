'use client'

import { useTranslations } from 'next-intl'
import { IoWarningOutline, IoCheckmarkCircle } from 'react-icons/io5'

interface HostGuardModalProps {
  hostGuard: {
    show: boolean
    type: 'host-only' | 'dual-account' | null
    isSwitching?: boolean
  }
  onBack: () => void
  onCreateGuestAccount: () => void
  onGoToHostDashboard: () => void
  onSwitchToGuest: () => void
  onSignInDifferent: () => void
}

export function HostGuardModal({
  hostGuard,
  onBack,
  onCreateGuestAccount,
  onGoToHostDashboard,
  onSwitchToGuest,
  onSignInDifferent
}: HostGuardModalProps) {
  const t = useTranslations('BookingPage')

  if (!hostGuard.show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onBack}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <IoWarningOutline className="w-10 h-10 text-yellow-500" />
        </div>

        {hostGuard.type === 'host-only' ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('guestAccountRequired')}
            </h2>
            <p className="text-gray-400 mb-6">
              {t('youreLoggedInAsHost')}
            </p>
            <div className="space-y-3">
              <button
                onClick={onCreateGuestAccount}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-colors"
              >
                {t('createGuestAccount')}
              </button>
              <button
                onClick={onGoToHostDashboard}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('backToHostDashboard')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('switchToGuestMode')}
            </h2>
            <p className="text-gray-400 mb-2">
              {t('youreCurrentlyLoggedInAsHost')}
            </p>
            <p className="text-gray-300 mb-6">
              {t('weDetectedYouHaveGuestAccount')}
            </p>

            <div className="space-y-3">
              <button
                onClick={onSwitchToGuest}
                disabled={hostGuard.isSwitching}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {hostGuard.isSwitching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('switching')}
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle className="w-5 h-5" />
                    {t('switchToGuestAccount')}
                  </>
                )}
              </button>

              <button
                onClick={onSignInDifferent}
                className="w-full py-2.5 px-4 text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t('signInWithDifferentGuestAccount')}
              </button>

              <button
                onClick={onBack}
                className="w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('goBack')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
