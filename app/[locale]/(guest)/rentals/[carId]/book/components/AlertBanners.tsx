'use client'

import { useTranslations } from 'next-intl'
import {
  IoCloseCircleOutline,
  IoBanOutline,
  IoWarningOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface AlertBannersProps {
  carIsActive: boolean
  eligibility: { allowed: boolean; reason?: string }
}

export function AlertBanners({ carIsActive, eligibility }: AlertBannersProps) {
  const t = useTranslations('BookingPage')

  return (
    <>
      {/* Vehicle Unavailable Banner */}
      {!carIsActive && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <IoCloseCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100 mb-2 text-base">
                {t('vehicleUnavailable')}
              </p>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                {t('vehicleUnavailableDesc')}
              </p>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                <li>• {t('vehicleUnavailableReason1')}</li>
                <li>• {t('vehicleUnavailableReason2')}</li>
                <li>• {t('vehicleUnavailableReason3')}</li>
              </ul>
              <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-medium">
                {t('vehicleUnavailableCta')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Restriction Banner */}
      {!eligibility.allowed && eligibility.reason && carIsActive && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <IoBanOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                {t('bookingRestricted')}
              </p>
              <p className="text-sm text-red-800 dark:text-red-200">
                {eligibility.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Approval Warning */}
      {eligibility.allowed && eligibility.reason && carIsActive && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <IoWarningOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                {t('manualApprovalRequired')}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {eligibility.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* P2P Important Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <IoInformationCircleOutline className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">{t('importantBookingInfo')}</p>
            <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
              <li>• <span dangerouslySetInnerHTML={{ __html: t.raw('bookWithoutAccount') }} />{' '}
                <a href="/help/guest-account" className="text-amber-700 dark:text-amber-300 underline hover:no-underline">{t('learnMore')}</a>
              </li>
              <li>• <span dangerouslySetInnerHTML={{ __html: t.raw('quickVerification') }} /></li>
              <li>• <span dangerouslySetInnerHTML={{ __html: t.raw('noChargesUntilApproved') }} /></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
