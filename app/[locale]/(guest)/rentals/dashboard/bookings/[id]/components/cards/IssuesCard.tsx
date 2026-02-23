// IssuesCard — payment failed / verification rejected / dispute

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { TripDetailsBar } from './TripDetailsBar'
import { ActionButtons } from './ActionButtons'

interface IssuesCardProps {
  booking: Booking
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const IssuesCard: React.FC<IssuesCardProps> = ({
  booking,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')
  const vsLower = booking.verificationStatus?.toLowerCase()

  return (
    <div className="mt-3">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-red-200 dark:border-red-800 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />

        {/* Issue-specific content */}
        <div className="p-4 space-y-3">
          {booking.paymentStatus?.toLowerCase() === 'failed' && (
            <IssueAlert
              icon="error"
              title={t('issuePaymentFailed')}
              description={t('issuePaymentFailedDesc')}
              actionLabel={t('updatePaymentBtn')}
              onAction={() => {
                window.location.href = `/support?booking=${booking.bookingCode}&action=update-payment`
              }}
            />
          )}

          {vsLower === 'rejected' && (
            <IssueAlert
              icon="shield"
              title={t('issueVerificationRejected')}
              description={t('issueVerificationRejectedDesc')}
              actionLabel={t('resubmitDocsBtn')}
              onAction={() => {
                window.location.href = `/support?booking=${booking.bookingCode}&action=resubmit-docs`
              }}
            />
          )}

          {(booking as any).disputeCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    {t('issueDisputeOpen')}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    {t('issueDisputeOpenDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <TripDetailsBar
          bookingCode={booking.bookingCode}
          startDate={booking.startDate}
          endDate={booking.endDate}
          startTime={booking.startTime}
          endTime={booking.endTime}
          statusBadge={{
            label: t('issuesBadge'),
            color: 'text-red-600 dark:text-red-400',
          }}
        />

        <ActionButtons
          onCancel={onCancel}
          onModify={onModify}
          onAgreement={onAgreement}
        />
      </div>
    </div>
  )
}

function IssueAlert({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: 'error' | 'shield'
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon === 'error' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          )}
        </svg>
        <div>
          <p className="text-sm font-medium text-red-900 dark:text-red-200">{title}</p>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">{description}</p>
          <button
            onClick={onAction}
            className="mt-2 w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
