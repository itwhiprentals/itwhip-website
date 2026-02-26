'use client'

import { useLocale, useTranslations } from 'next-intl'
import { IoCloseOutline, IoDocumentTextOutline } from 'react-icons/io5'

interface AgreementPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  prospectId: string
  guestName: string
  hostName: string
  vehicleInfo?: string
  startDate?: string
  endDate?: string
  pickupCity?: string
  pickupState?: string
  durationDays?: number
  offeredRate?: number
  totalAmount?: number
}

export default function AgreementPreviewModal({
  isOpen,
  onClose,
  prospectId,
  guestName,
  hostName,
  vehicleInfo,
  startDate,
  endDate,
  pickupCity,
  pickupState,
  durationDays,
  offeredRate,
  totalAmount,
}: AgreementPreviewModalProps) {
  const t = useTranslations('PartnerRequestDetail')
  const locale = useLocale()

  if (!isOpen) return null

  const formatPreviewDate = (dateStr?: string) => {
    if (!dateStr) return t('tbd')
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoDocumentTextOutline className="w-5 h-5 text-purple-600" />
            {t('vehicleRentalAgreement')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Agreement Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('vehicleRentalAgreement')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('requestNumber', { id: prospectId.slice(0, 8).toUpperCase() })}</p>
          </div>

          <div className="space-y-4">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('renterGuest')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{guestName || t('guest')}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vehicleOwnerPartner')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{hostName}</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vehicle')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {vehicleInfo || t('vehicleDetailsPending')}
              </p>
            </div>

            {/* Dates */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pickupDate')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatPreviewDate(startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('returnDate')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatPreviewDate(endDate)}</p>
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pickupLocation')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {pickupCity && pickupState ? `${pickupCity}, ${pickupState}` : t('locationTbd')}
              </p>
            </div>

            {/* Duration & Rate */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalDays')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{t('durationDays', { count: durationDays || 0 })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dailyRate')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{t('ratePerDay', { rate: offeredRate || 0 })}</p>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{t('totalRentalAmount')}</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    ${totalAmount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p><strong>{t('governingLaw')}</strong> {t('governingLawValue')}</p>
              <p><strong>{t('venue')}</strong> {t('venueValue')}</p>
              <p className="text-xs mt-4">{t('bySigningAgreement')}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            {t('close')}
          </button>
          <a
            href="https://itwhip.com/rentals/cmjutqr7k0001ju04qwg6ds9a/book"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <IoDocumentTextOutline className="w-4 h-4" />
            {t('viewFullAgreement')}
          </a>
        </div>
      </div>
    </div>
  )
}
