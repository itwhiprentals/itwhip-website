// ManualBookingGuestView — Guest experience for manual/recruited bookings (PENDING only)
// After CONFIRMED, guest falls through to standard booking flow
// Flow: Booked → Agreement → Payment → Confirmed

'use client'

import { useTranslations } from 'next-intl'
import { Booking, Message } from '../types'
import ManualBookingProgress from './ManualBookingProgress'
import {
  CarPhotoOverlay,
  TripDetailsBar,
  PaymentChoiceCard,
  HostMessagesCard,
  CollapsiblePaymentSummary,
} from './cards'
import {
  IoCardOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoLockClosedOutline,
} from 'react-icons/io5'

interface ManualBookingGuestViewProps {
  booking: Booking
  messages: Message[]
  messagesLoading: boolean
  messageSending: boolean
  messageError: string | null
  messageUploading: boolean
  onSendMessage: (text: string) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBookingRefresh: () => void
  onCancel: () => void
  onModify: () => void
  onViewAgreement: () => void
}

export default function ManualBookingGuestView({
  booking,
  messages,
  messagesLoading,
  messageSending,
  messageError,
  messageUploading,
  onSendMessage,
  onFileUpload,
  onBookingRefresh,
  onCancel,
  onModify,
  onViewAgreement,
}: ManualBookingGuestViewProps) {
  const t = useTranslations('ManualBooking')
  const tBd = useTranslations('BookingDetail')

  // paymentType is set when guest SELECTS a method (before card form completion).
  // hasPayment should only be true when payment is actually authorized/paid.
  const hasPayment = !!booking.paymentType && booking.paymentStatus !== 'PENDING'
  const needsCardForm = booking.paymentType === 'CARD' && booking.paymentStatus === 'PENDING'
  const agreementStatus = booking.agreementStatus || 'not_sent'
  const isSigned = agreementStatus === 'signed'

  const statusBadge = { label: 'PENDING', color: 'text-blue-600 dark:text-blue-400' }

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Progress Bar */}
      <ManualBookingProgress
        status={booking.status}
        paymentType={booking.paymentType || null}
        paymentStatus={booking.paymentStatus || null}
        agreementStatus={booking.agreementStatus || null}
        tripStartedAt={booking.tripStartedAt}
        tripEndedAt={booking.tripEndedAt}
      />

      {/* Car Photo + Trip Details */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <TripDetailsBar
          bookingCode={booking.bookingCode}
          startDate={booking.startDate}
          endDate={booking.endDate}
          startTime={booking.startTime}
          endTime={booking.endTime}
          statusBadge={statusBadge}
          showLocationNote={true}
          locationNoteKey="locationAfterConfirmation"
        />
      </div>

      {/* Host Messages — right after car + trip details */}
      <HostMessagesCard
        booking={booking}
        messages={messages}
        messagesLoading={messagesLoading}
        messageSending={messageSending}
        messageError={messageError}
        messageUploading={messageUploading}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        defaultOpen
      />

      {/* Agreement Status Card — single card for all states */}
      <AgreementStatusCard
        agreementStatus={agreementStatus}
        agreementSignedAt={booking.agreementSignedAt}
        agreementSignedPdfUrl={booking.agreementSignedPdfUrl}
        onViewAgreement={onViewAgreement}
      />

      {/* Payment — locked until agreement signed */}
      {!hasPayment && !needsCardForm && !isSigned && (
        <LockedPaymentCard />
      )}

      {/* Payment Choice — unlocked after agreement signed, OR card selected but not yet completed */}
      {((!hasPayment && !needsCardForm && isSigned) || needsCardForm) && (
        <PaymentChoiceCard
          booking={{
            id: booking.id,
            bookingCode: booking.bookingCode,
            totalAmount: booking.totalAmount,
            subtotal: booking.subtotal || booking.totalAmount,
            numberOfDays: booking.numberOfDays || 1,
            dailyRate: booking.dailyRate,
            carName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
          }}
          onComplete={onBookingRefresh}
        />
      )}

      {/* Payment Info Card — after payment actually authorized/paid */}
      {hasPayment && (
        <PaymentInfoCard
          paymentType={booking.paymentType!}
          cardBrand={booking.cardBrand}
          cardLast4={booking.cardLast4}
        />
      )}

      {/* Payment Summary */}
      <CollapsiblePaymentSummary booking={booking} />

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
        >
          {tBd('cancel')}
        </button>
        <button
          onClick={onModify}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
        >
          {tBd('modify')}
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
        Need help? <a href="tel:+18557030806" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">(855) 703-0806</a>
      </p>
    </div>
  )
}

// ─── Locked Payment Card ─────────────────────────────────────────────────────

function LockedPaymentCard() {
  const t = useTranslations('ManualBooking')

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 opacity-60">
      <div className="flex items-center gap-2 mb-3">
        <IoLockClosedOutline className="w-4 h-4 text-gray-400" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('paymentLocked')}</p>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{t('paymentLockedDesc')}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed">
          <IoCardOutline className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          <span className="text-sm font-medium text-gray-300 dark:text-gray-600">{t('paymentMethodCard')}</span>
        </div>
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed">
          <IoCashOutline className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          <span className="text-sm font-medium text-gray-300 dark:text-gray-600">{t('paymentMethodCash')}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Payment Info Card ───────────────────────────────────────────────────────

function PaymentInfoCard({
  paymentType,
  cardBrand,
  cardLast4,
}: {
  paymentType: string
  cardBrand?: string | null
  cardLast4?: string | null
}) {
  const t = useTranslations('ManualBooking')

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        {paymentType === 'CARD' ? (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
            <IoCardOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <IoCashOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {paymentType === 'CARD' ? t('paymentMethodCard') : t('paymentMethodCash')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {paymentType === 'CARD'
              ? cardBrand && cardLast4
                ? t('cardDetail', { brand: cardBrand, last4: cardLast4 })
                : t('paymentMethodCardDesc')
              : t('paymentMethodCashDesc')}
          </p>
        </div>
        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0" />
      </div>
    </div>
  )
}

// ─── Agreement Status Card ───────────────────────────────────────────────────

function AgreementStatusCard({
  agreementStatus,
  agreementSignedAt,
  agreementSignedPdfUrl,
  onViewAgreement,
}: {
  agreementStatus: string
  agreementSignedAt?: string | Date | null
  agreementSignedPdfUrl?: string | null
  onViewAgreement: () => void
}) {
  const t = useTranslations('ManualBooking')

  if (agreementStatus === 'signed') {
    const signedDate = agreementSignedAt
      ? new Date(agreementSignedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
      : null

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-green-200 dark:border-green-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <IoDocumentTextOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('agreementSigned')}
            </p>
            {signedDate && (
              <p className="text-xs text-green-600 dark:text-green-400">{t('signedOn', { date: signedDate })}</p>
            )}
          </div>
          {agreementSignedPdfUrl && (
            <a
              href={agreementSignedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400"
            >
              <IoDownloadOutline className="w-4 h-4" />
              {t('download')}
            </a>
          )}
        </div>
      </div>
    )
  }

  // sent/viewed — green prompt to sign
  if (agreementStatus === 'sent' || agreementStatus === 'viewed') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-green-200 dark:border-green-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <IoDocumentTextOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('statusSignAgreement')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">{t('agreementCheckInbox')}</p>
          </div>
          <button
            onClick={onViewAgreement}
            className="text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400 whitespace-nowrap"
          >
            {t('openAgreement')}
          </button>
        </div>
      </div>
    )
  }

  // not_sent — grayed out
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 opacity-60">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('agreementTitle')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('statusAgreementNotSentYet')}
          </p>
        </div>
      </div>
    </div>
  )
}
