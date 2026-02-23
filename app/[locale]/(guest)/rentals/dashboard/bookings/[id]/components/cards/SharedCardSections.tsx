// Shared reusable sections for booking status cards
// Used by CompletedCard, OnHoldCard, and future Reject/CardDecline cards

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { User } from '../Icons'
import { BookingSidebar } from '../BookingSidebar'
import { MessagesPanel } from '../MessagesPanel'

// ─── Host + Messages Card ────────────────────────────────────────────────────

interface HostMessagesCardProps {
  booking: Booking
  messages: Message[]
  messagesLoading: boolean
  messageSending: boolean
  messageError: string | null
  messageUploading: boolean
  onSendMessage: (text: string) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean
  readOnlyLabel?: string
}

export const HostMessagesCard: React.FC<HostMessagesCardProps> = ({
  booking,
  messages = [],
  messagesLoading,
  messageSending,
  messageError,
  messageUploading,
  onSendMessage,
  onFileUpload,
  readOnly = false,
  readOnlyLabel,
}) => {
  const t = useTranslations('BookingDetail')

  if (booking.status === 'CANCELLED') return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Host section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border-[3px] border-gray-300 dark:border-gray-600">
            {booking.host.profilePhoto ? (
              <img src={booking.host.profilePhoto} alt={booking.host.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{booking.host.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-yellow-500 text-xs">★</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{booking.host.rating.toFixed(1)}</span>
              <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">~{booking.host.responseTime}min</span>
            </div>
          </div>
          <a
            href="/messages"
            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {t('messageHost')}
          </a>
        </div>
      </div>
      {/* Collapsible messages section */}
      <details className="group border-t border-gray-200 dark:border-gray-700">
        <summary className="flex items-center justify-between cursor-pointer px-4 py-3 select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('messages')}</span>
            {readOnly && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{readOnlyLabel || t('messagesLocked')}</span>
            )}
          </div>
          <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <MessagesPanel
            bookingId={booking.id}
            messages={messages}
            loading={messagesLoading}
            sending={messageSending}
            error={messageError}
            onSendMessage={onSendMessage}
            onFileUpload={onFileUpload}
            uploadingFile={messageUploading}
            noWrapper
            readOnly={readOnly}
          />
        </div>
      </details>
    </div>
  )
}

// ─── Collapsible Payment Summary ─────────────────────────────────────────────

interface CollapsiblePaymentSummaryProps {
  booking: Booking
}

export const CollapsiblePaymentSummary: React.FC<CollapsiblePaymentSummaryProps> = ({ booking }) => {
  const t = useTranslations('BookingDetail')

  return (
    <details className="group bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3 select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('paymentSummary')}</span>
        </div>
        <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <BookingSidebar
          booking={booking}
          onCancelClick={() => {}}
          onUploadClick={() => {}}
          onAddToCalendar={() => {}}
          uploadingFile={false}
        />
      </div>
    </details>
  )
}

// ─── Rental Agreement Button ─────────────────────────────────────────────────

interface RentalAgreementButtonProps {
  onViewAgreement: () => void
}

export const RentalAgreementButton: React.FC<RentalAgreementButtonProps> = ({ onViewAgreement }) => {
  const t = useTranslations('BookingDetail')

  return (
    <button
      onClick={onViewAgreement}
      className="w-full flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('rentalAgreement')}</span>
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

// ─── Minimal Legal Footer ────────────────────────────────────────────────────

export const MinimalLegalFooter: React.FC = () => {
  const t = useTranslations('BookingDetail')

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-2">
        {t('footerLegal')}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {t('copyright')}
      </p>
    </div>
  )
}
