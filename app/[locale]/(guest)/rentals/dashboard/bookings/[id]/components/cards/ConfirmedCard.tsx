// ConfirmedCard — CONFIRMED status, onboarding NOT complete yet
// Layout matches CompletedCard (NoShow) template with confirmed content
// Messages are ACTIVE, onboarding is ACTIVE (clickable button)

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from './SharedCardSections'
import { Copy, CheckCircle } from '../Icons'
import { formatDate } from '../../utils/helpers'
import { BookingOnboarding } from '../BookingOnboarding'

interface ConfirmedCardProps {
  booking: Booking
  messages: Message[]
  messagesLoading: boolean
  messageSending: boolean
  messageError: string | null
  messageUploading: boolean
  onSendMessage: (text: string) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDocumentUploaded: () => void
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const ConfirmedCard: React.FC<ConfirmedCardProps> = ({
  booking,
  messages,
  messagesLoading,
  messageSending,
  messageError,
  messageUploading,
  onSendMessage,
  onFileUpload,
  onDocumentUploaded,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')
  const [copiedCode, setCopiedCode] = React.useState(false)

  const copyBookingCode = () => {
    navigator.clipboard.writeText(booking.bookingCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Build full address: street, city, state zip
  const fullAddress = [
    booking.exactAddress || booking.car.address,
    [booking.car.city, booking.car.state].filter(Boolean).join(', '),
    booking.car.zipCode,
  ].filter(Boolean).join(', ')

  // Late pickup detection: current time past scheduled pickup
  const now = new Date()
  const [hours, minutes] = (booking.startTime || '10:00').split(':').map(Number)
  const scheduled = new Date(booking.startDate)
  scheduled.setHours(hours, minutes, 0, 0)
  const isLatePickup = now.getTime() > scheduled.getTime()

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Main Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* CONFIRMED badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                {t('bookingConfirmed')}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {t('bookingConfirmedDesc')}
              </p>
            </div>
          </div>

          {/* Booking Info Grid */}
          <BookingInfoGrid
            booking={booking}
            bookingCode={booking.bookingCode}
            onCopyCode={copyBookingCode}
            copiedCode={copiedCode}
            pickupAddress={fullAddress}
            dropoffAddress={fullAddress}
            isLatePickup={isLatePickup}
          />
        </div>
      </div>

      {/* Onboarding — ACTIVE for CONFIRMED (clickable button) */}
      {!booking.onboardingCompletedAt && (
        <BookingOnboarding booking={booking} onDocumentUploaded={onDocumentUploaded} />
      )}

      {/* Host + Messages combined card (ACTIVE — guest can send messages) */}
      <HostMessagesCard
        booking={booking}
        messages={messages}
        messagesLoading={messagesLoading}
        messageSending={messageSending}
        messageError={messageError}
        messageUploading={messageUploading}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
      />

      {/* Payment Summary — collapsible */}
      <CollapsiblePaymentSummary booking={booking} />

      {/* Rental Agreement */}
      <RentalAgreementButton onViewAgreement={onAgreement} />

      {/* Cancel / Modify Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('cancel')}
        </button>
        <button
          onClick={onModify}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('modify')}
        </button>
      </div>
    </div>
  )
}

// ─── Booking Info Grid (confirmed status with real addresses) ───────────────

function BookingInfoGrid({ booking, bookingCode, onCopyCode, copiedCode, pickupAddress, dropoffAddress, isLatePickup }: {
  booking: Booking; bookingCode: string; onCopyCode: () => void; copiedCode: boolean;
  pickupAddress: string; dropoffAddress: string; isLatePickup: boolean
}) {
  const t = useTranslations('BookingDetail')

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-3">
      {/* Row 1: Booking # + Status */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('confirmationNumber')}</p>
          <div className="flex items-center gap-1.5">
            <code className="text-xs font-mono font-medium text-gray-900 dark:text-gray-100">{bookingCode}</code>
            <button onClick={onCopyCode} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5" title={t('copyBookingCode')}>
              {copiedCode ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('statusLabel')}</p>
          <p className="text-xs font-semibold text-green-600 dark:text-green-400">
            {t('confirmedBadge')}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Row 2: Pickup + Dropoff with addresses */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('pickup')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.startDate)}</p>
          <p className="text-[11px] text-gray-500">{booking.startTime}</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1.5 mb-0.5">{t('location')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{pickupAddress}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('dropoff')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.endDate)}</p>
          <p className="text-[11px] text-gray-500">{booking.endTime}</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1.5 mb-0.5">{t('location')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{dropoffAddress}</p>
        </div>
      </div>

      {/* Late pickup warning */}
      {isLatePickup && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t('latePickup')}</p>
          </div>
        </>
      )}
    </div>
  )
}
