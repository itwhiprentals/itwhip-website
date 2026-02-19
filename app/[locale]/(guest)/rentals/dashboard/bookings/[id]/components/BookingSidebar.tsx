// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingSidebar.tsx

import React, { useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../types'
import {
  ShieldCheck, CheckCircle, User, Phone, Calendar,
  AlertCircle
} from './Icons'
import { IoHourglassOutline as HourglassOutline } from 'react-icons/io5'
import {
  calculateTripDays, formatCurrency, getHoursUntilPickup
} from '../utils/helpers'
import { TIME_THRESHOLDS } from '../constants'

interface BookingSidebarProps {
  booking: Booking
  onCancelClick: () => void
  onUploadClick: () => void
  onAddToCalendar: () => void
  uploadingFile: boolean
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  booking,
  onCancelClick,
  onUploadClick,
  onAddToCalendar,
  uploadingFile
}) => {
  const t = useTranslations('BookingDetail')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tripDays = calculateTripDays(booking.startDate, booking.endDate)
  const hoursUntilPickup = getHoursUntilPickup(booking.startDate)

  const handlePrintInvoice = () => {
    window.print() // In production, implement proper invoice generation
  }

  const handleReportIssue = () => {
    // Navigate to issue reporting or open support chat
    window.location.href = `/support?booking=${booking.bookingCode}`
  }

  const handleEmergency = () => {
    if (confirm('Call ItWhip Support? For life-threatening emergencies, please call 911.')) {
      window.location.href = 'tel:+18557030806'
    }
  }

  const handleModifyDates = () => {
    window.location.href = `/support?booking=${booking.bookingCode}&action=modify-dates`
  }

  const handleUpdatePayment = () => {
    window.location.href = `/support?booking=${booking.bookingCode}&action=update-payment`
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Payment Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('paymentSummary')}</h2>
        
        {/* Payment Failed */}
        {booking.verificationStatus === 'approved' && (booking.paymentStatus === 'failed' || booking.paymentStatus === 'FAILED') && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                <p className="font-medium mb-1">{t('paymentFailedTitle')}</p>
                <p className="text-xs mb-2">
                  {t('paymentFailedDesc')}
                </p>
                <button
                  onClick={handleUpdatePayment}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                >
                  {t('updatePaymentMethod')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Successful - FIXED to check both cases */}
        {(booking.paymentStatus === 'paid' || booking.paymentStatus === 'PAID' || booking.paymentStatus === 'captured' || booking.paymentStatus === 'CAPTURED') && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                <p className="font-medium mb-1">{t('paymentConfirmed')}</p>
                <p className="text-xs">
                  {t('paymentConfirmedDesc', { amount: formatCurrency(booking.totalAmount), email: booking.guestEmail || '' })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('perDayTimeDays', { rate: formatCurrency(booking.dailyRate), days: tripDays })}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(booking.dailyRate * tripDays)}
            </span>
          </div>
          
          {booking.deliveryFee > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('deliveryFee')}</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.deliveryFee)}</span>
            </div>
          )}
          
          {booking.insuranceFee > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('insuranceProtection')}</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.insuranceFee)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('itwhipServiceFee')}</span>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.serviceFee)}</span>
          </div>

          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('azTaxesFees')}</span>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(booking.taxes)}</span>
          </div>

          <div className="border-t dark:border-gray-700 pt-2.5 sm:pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">{t('tripTotal')}</span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(booking.totalAmount)}
                </span>
                {booking.status === 'PENDING' && !(booking.paymentStatus === 'paid' || booking.paymentStatus === 'PAID') && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {booking.verificationStatus === 'approved' ? t('processingNow') : t('dueAtConfirmation')}
                  </p>
                )}
              </div>
            </div>

            {/* Credits/bonus applied + card charge */}
            {((booking.creditsApplied ?? 0) > 0 || (booking.bonusApplied ?? 0) > 0) && (
              <div className="mt-2 space-y-1.5">
                {(booking.creditsApplied ?? 0) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-700 dark:text-green-400">{t('creditsApplied')}</span>
                    <span className="text-green-700 dark:text-green-400 font-medium">-{formatCurrency(booking.creditsApplied!)}</span>
                  </div>
                )}
                {(booking.bonusApplied ?? 0) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-700 dark:text-green-400">{t('bonusApplied')}</span>
                    <span className="text-green-700 dark:text-green-400 font-medium">-{formatCurrency(booking.bonusApplied!)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm font-medium">
                  <span className="text-gray-900 dark:text-gray-100">
                    {booking.cardBrand && booking.cardLast4
                      ? t('paidWithCard', { brand: booking.cardBrand, last4: booking.cardLast4 })
                      : t('cardCharge')}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatCurrency(booking.chargeAmount ?? (booking.totalAmount - (booking.creditsApplied || 0) - (booking.bonusApplied || 0)))}
                  </span>
                </div>
              </div>
            )}

            {/* Security Deposit */}
            {booking.depositAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('securityDepositHold')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(booking.depositAmount)}</span>
                </div>
                {(booking.depositFromWallet ?? 0) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-blue-600">{t('depositFromWalletLabel')}</span>
                    <span className="text-blue-600 font-medium">-{formatCurrency(booking.depositFromWallet!)}</span>
                  </div>
                )}
                {(booking.depositFromCard ?? 0) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-red-600">{t('depositFromCardLabel')}</span>
                    <span className="text-red-600 font-medium">{formatCurrency(booking.depositFromCard!)}</span>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">{t('depositRefundNote')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Host & Messages */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('host')}</h2>

        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">{booking.host.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
              <div className="flex items-center">
                <span className="text-yellow-500 text-xs sm:text-sm">★</span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-0.5">{booking.host.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">~{booking.host.responseTime}min</span>
            </div>
          </div>
        </div>

        {(booking.status === 'ACTIVE' || booking.status === 'CONFIRMED') && booking.tripStatus !== 'COMPLETED' && (
          <CallHostButton bookingId={booking.id} t={t} />
        )}

      </div>
    </div>
  )
}

// Masked "Call Host" button — calls through ItWhip number
function CallHostButton({ bookingId, t }: { bookingId: string; t: ReturnType<typeof useTranslations> }) {
  const [calling, setCalling] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'error'>('idle')

  const handleCallHost = useCallback(async () => {
    if (calling) return
    setCalling(true)
    setCallStatus('calling')

    try {
      const res = await fetch('/api/twilio/masked-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Call failed')
      }

      setCallStatus('connected')
      setTimeout(() => setCallStatus('idle'), 5000)
    } catch (err: any) {
      console.error('[Call Host]', err)
      setCallStatus('error')
      setTimeout(() => setCallStatus('idle'), 3000)
    } finally {
      setCalling(false)
    }
  }, [bookingId, calling])

  return (
    <div className="mt-3 sm:mt-4">
      <button
        onClick={handleCallHost}
        disabled={calling}
        className={`w-full px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
          callStatus === 'connected'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : callStatus === 'error'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
        }`}
      >
        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {callStatus === 'calling' ? t('callingHost') :
         callStatus === 'connected' ? t('callConnecting') :
         callStatus === 'error' ? t('callFailed') :
         t('callHost')}
      </button>
      {callStatus === 'connected' && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center">
          {t('callHostHint')}
        </p>
      )}
    </div>
  )
}