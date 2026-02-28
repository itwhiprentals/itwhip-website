// ManualBookingGuestView — Guest experience for manual/recruited bookings
// Separate view from standard booking flow

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
  IoTimeOutline,
  IoInformationCircleOutline,
  IoDownloadOutline,
  IoMailOutline,
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

  const hasPayment = !!booking.paymentType
  const isConfirmed = booking.status === 'CONFIRMED'
  const agreementStatus = booking.agreementStatus || 'not_sent'
  const isSigned = agreementStatus === 'signed'

  // Status badge for TripDetailsBar
  const statusBadge = isConfirmed
    ? { label: 'CONFIRMED', color: 'text-green-600 dark:text-green-400' }
    : { label: 'PENDING', color: 'text-blue-600 dark:text-blue-400' }

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Progress Bar */}
      <ManualBookingProgress
        status={booking.status}
        paymentType={booking.paymentType || null}
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
          pickupAddress={isConfirmed ? booking.pickupLocation : undefined}
          showLocationNote={!isConfirmed}
          locationNoteKey="locationAfterConfirmation"
        />
      </div>

      {/* Status Message */}
      <StatusMessage
        hasPayment={hasPayment}
        isConfirmed={isConfirmed}
        agreementStatus={agreementStatus}
        isSigned={isSigned}
      />

      {/* Payment Choice — only when guest hasn't selected yet */}
      {!hasPayment && (
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

      {/* Payment Info Card — after payment selected */}
      {hasPayment && (
        <PaymentInfoCard
          paymentType={booking.paymentType!}
          cardBrand={booking.cardBrand}
          cardLast4={booking.cardLast4}
        />
      )}

      {/* Agreement Status Card */}
      {hasPayment && (
        <AgreementStatusCard
          agreementStatus={agreementStatus}
          agreementSignedAt={booking.agreementSignedAt}
          agreementSignedPdfUrl={booking.agreementSignedPdfUrl}
          isConfirmed={isConfirmed}
          onViewAgreement={onViewAgreement}
        />
      )}

      {/* Host + Messages — after confirmed */}
      {isConfirmed && (
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
        {isConfirmed ? (
          <button
            onClick={onViewAgreement}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
          >
            <IoDocumentTextOutline className="w-3.5 h-3.5" />
            {tBd('agreement')}
          </button>
        ) : (
          <button
            onClick={onModify}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
          >
            {tBd('modify')}
          </button>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
        Need help? <a href="tel:+18557030806" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">(855) 703-0806</a>
      </p>
    </div>
  )
}

// ─── Status Message ──────────────────────────────────────────────────────────

function StatusMessage({
  hasPayment,
  isConfirmed,
  agreementStatus,
  isSigned,
}: {
  hasPayment: boolean
  isConfirmed: boolean
  agreementStatus: string
  isSigned: boolean
}) {
  const t = useTranslations('ManualBooking')

  if (!hasPayment) {
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IoCardOutline className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-200">{t('statusAwaitingPayment')}</p>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">{t('statusAwaitingPaymentDesc')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isConfirmed) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IoTimeOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{t('statusAwaitingConfirmation')}</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">{t('statusAwaitingConfirmationDesc')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isSigned) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IoMailOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t('statusConfirmed')}</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{t('statusConfirmedDesc')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-200">{t('statusAllSet')}</p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-1">{t('statusAllSetDesc')}</p>
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
  isConfirmed,
  onViewAgreement,
}: {
  agreementStatus: string
  agreementSignedAt?: string | Date | null
  agreementSignedPdfUrl?: string | null
  isConfirmed: boolean
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

  if (agreementStatus === 'sent' || agreementStatus === 'viewed') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
            <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t('agreementSent')}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">{t('agreementSentDesc')}</p>
          </div>
          <button
            onClick={onViewAgreement}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 whitespace-nowrap"
          >
            {t('openAgreement')}
          </button>
        </div>
      </div>
    )
  }

  // not_sent
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('agreementTitle')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isConfirmed ? t('agreementPendingSend') : t('agreementNotSent')}
          </p>
        </div>
      </div>
    </div>
  )
}
