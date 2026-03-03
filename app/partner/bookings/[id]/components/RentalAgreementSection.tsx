// app/partner/bookings/[id]/components/RentalAgreementSection.tsx
// Extracted rental agreement section for manual bookings

'use client'

import { useTranslations } from 'next-intl'
import {
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoSendOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
} from 'react-icons/io5'

interface RentalAgreementSectionProps {
  booking: {
    id: string
    agreementStatus: string | null
    signerName: string | null
    agreementSignedAt: string | null
    agreementSentAt: string | null
    agreementSignedPdfUrl: string | null
    guestName: string | null
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    pickupLocation: string | null
    numberOfDays: number
  }
  renter: { name: string } | null
  partner: { companyName: string | null; name: string } | null
  vehicle: { year: number; make: string; model: string; carType: string; seats: number } | null
  expanded: boolean
  onToggle: () => void
  sendAgreement: () => void
  sendingAgreement: boolean
  formatDate: (dateStr: string) => string
}

export function RentalAgreementSection({
  booking,
  renter,
  partner,
  vehicle,
  expanded,
  onToggle,
  sendAgreement,
  sendingAgreement,
  formatDate,
}: RentalAgreementSectionProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdRentalAgreement')}</h3>
          {booking.agreementStatus === 'signed' ? (
            <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t('bdSigned')}
            </span>
          ) : booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? (
            <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {booking.agreementStatus === 'viewed' ? t('bdViewed') : t('bdSent')}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {t('bdNotSent')}
            </span>
          )}
        </div>
        {expanded ? (
          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Agreement Status Banner */}
          {booking.agreementStatus === 'signed' && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">{t('bdAgreementSigned')}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('bdSignedByOn', { name: booking.signerName || '', date: booking.agreementSignedAt ? new Date(booking.agreementSignedAt).toLocaleDateString() : 'N/A' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed') && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <IoTimeOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">
                    {booking.agreementStatus === 'viewed' ? t('bdCustomerReviewing') : t('bdAwaitingSignature')}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('bdSentOn', { date: booking.agreementSentAt ? new Date(booking.agreementSentAt).toLocaleDateString() : 'N/A' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agreement Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 bg-gray-200/70 dark:bg-gray-900/50">
            <div className="text-center mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{t('bdVehicleRentalAgreement')}</h4>
              <p className="text-sm text-gray-500">{t('bdBooking')}: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('bdRenterGuest')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{renter?.name || booking.guestName}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('bdVehicleOwnerPartner')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{partner?.companyName || partner?.name}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-500 dark:text-gray-400 mb-2">{t('bdVehicle')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {vehicle?.year} {vehicle?.make} {vehicle?.model}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {vehicle?.carType} ({vehicle?.seats} {t('bdSeats')})
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('bdPickup')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(booking.startDate)} {t('bdAt')} {booking.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('bdReturn')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(booking.endDate)} {t('bdAt')} {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-500 dark:text-gray-400 mb-1">{t('bdPickupLocation')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{booking.pickupLocation}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-500 dark:text-gray-400 mb-1">{t('bdTotalDays')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{booking.numberOfDays}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
              <p><strong>{t('bdGoverningLaw')}:</strong> {t('bdStateOfArizona')}</p>
              <p><strong>{t('bdVenue')}:</strong> {t('bdMaricopaCounty')}</p>
            </div>
          </div>

          {/* Agreement Actions */}
          <div className="flex flex-wrap gap-3">
            {booking.agreementStatus === 'signed' && booking.agreementSignedPdfUrl ? (
              <a
                href={booking.agreementSignedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <IoDownloadOutline className="w-4 h-4" />
                {t('bdDownloadSignedAgreement')}
              </a>
            ) : (
              <>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IoPrintOutline className="w-4 h-4" />
                  {t('bdPrintPreview')}
                </button>
                <button
                  onClick={sendAgreement}
                  disabled={sendingAgreement}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center gap-2"
                >
                  {sendingAgreement ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <IoSendOutline className="w-4 h-4" />
                  )}
                  {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed'
                    ? t('bdResendAgreement')
                    : t('bdSendForSignature')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
