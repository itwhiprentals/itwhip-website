'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslations } from 'next-intl'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  IoCashOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoPersonAddOutline,
  IoOpenOutline,
} from 'react-icons/io5'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentChoiceCardProps {
  booking: {
    id: string
    bookingCode: string
    totalAmount: number
    subtotal: number
    numberOfDays: number
    dailyRate: number
    carName?: string
    securityDeposit?: number
    insuranceFee?: number
    serviceFee?: number
    taxes?: number
  }
  isManualBooking?: boolean
  isModifiedBooking?: boolean
  onComplete: () => void
}

type Step = 'choose' | 'card-form' | 'success'

const YOUNG_DRIVER_SURCHARGE_PER_DAY = 50
const YOUNG_DRIVER_DEPOSIT = 1500

export default function PaymentChoiceCard({ booking, isManualBooking, isModifiedBooking, onComplete }: PaymentChoiceCardProps) {
  const t = useTranslations('BookingDetail')
  const [step, setStep] = useState<Step>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [successType, setSuccessType] = useState<'CARD' | 'CASH' | 'CASHAPP' | null>(null)
  const [cashappOpened, setCashappOpened] = useState(false)

  // Additional driver state
  const [addingDriver, setAddingDriver] = useState(false)
  const [driverFirst, setDriverFirst] = useState('')
  const [driverLast, setDriverLast] = useState('')
  const [driverDob, setDriverDob] = useState<Date | null>(null)
  const [driverLicense, setDriverLicense] = useState('')

  // Auto-capitalize first letter
  const capitalize = (val: string) => val.charAt(0).toUpperCase() + val.slice(1)

  // Validate driver form is complete
  const driverFormValid = !addingDriver || (
    driverFirst.trim().length >= 2 &&
    driverLast.trim().length >= 2 &&
    driverDob !== null &&
    driverLicense.trim().length >= 4
  )

  // Calculate driver age from DOB
  const driverAge = driverDob ? (() => {
    const today = new Date()
    let age = today.getFullYear() - driverDob.getFullYear()
    const m = today.getMonth() - driverDob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < driverDob.getDate())) age--
    return age
  })() : null
  const isUnder25 = addingDriver && driverAge !== null && driverAge < 25

  // Calculate amounts based on additional driver age
  const surcharge = isUnder25 ? YOUNG_DRIVER_SURCHARGE_PER_DAY * booking.numberOfDays : 0
  const deposit = isUnder25 ? YOUNG_DRIVER_DEPOSIT : (booking.securityDeposit || 0)
  const displayTotal = booking.totalAmount + surcharge
  const displayGrandTotal = displayTotal + deposit

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleChooseCash = async () => {
    if (!confirm(t('cashConfirmDialog'))) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'CASH', underAge: isUnder25, additionalDriver: addingDriver ? { firstName: driverFirst, lastName: driverLast, dob: driverDob?.toISOString().split('T')[0] || null, licenseNumber: driverLicense } : null }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessType('CASH')
        setStep('success')
        setTimeout(() => onComplete(), 2000)
      } else {
        setError(data.error || 'Failed to select cash payment')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChooseCard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'CARD', underAge: isUnder25, additionalDriver: addingDriver ? { firstName: driverFirst, lastName: driverLast, dob: driverDob?.toISOString().split('T')[0] || null, licenseNumber: driverLicense } : null }),
      })
      const data = await res.json()
      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret)
        setStep('card-form')
      } else {
        setError(data.error || 'Failed to initialize payment')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChooseCashApp = () => {
    const amount = Math.ceil(displayGrandTotal)
    window.open(`https://cash.app/$itwhip/${amount}`, '_blank')
    setCashappOpened(true)
  }

  const handleConfirmCashApp = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'CASHAPP', underAge: isUnder25, amount: displayGrandTotal, additionalDriver: addingDriver ? { firstName: driverFirst, lastName: driverLast, dob: driverDob?.toISOString().split('T')[0] || null, licenseNumber: driverLicense } : null }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessType('CASHAPP')
        setStep('success')
        setTimeout(() => onComplete(), 2000)
      } else {
        setError(data.error || 'Failed to confirm payment')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardSuccess = async (paymentIntentId: string) => {
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessType('CARD')
        setStep('success')
        setTimeout(() => onComplete(), 2000)
      } else {
        setError(data.error || 'Failed to confirm payment')
      }
    } catch {
      setError('Failed to confirm payment')
    }
  }

  // ─── SUCCESS STATE ──────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {successType === 'CASHAPP' ? 'Payment Submitted' : successType === 'CARD' ? t('cardAuthorizedTitle') : t('cashConfirmedTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {successType === 'CASHAPP'
            ? 'Your payment is being verified. You will be notified once confirmed.'
            : successType === 'CARD' ? t('cardAuthorizedDesc') : t('cashConfirmedDesc')}
        </p>
      </div>
    )
  }

  // ─── CARD FORM STATE ────────────────────────────────────
  if (step === 'card-form' && clientSecret) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <IoCardOutline className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('addPaymentMethod')}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('cardAuthHoldDesc', { amount: formatCurrency(displayTotal) })}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#ea580c',
                  borderRadius: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSizeBase: '14px',
                },
              },
            }}
          >
            <CardPaymentForm
              bookingId={booking.id}
              amount={displayTotal}
              onSuccess={handleCardSuccess}
              onError={(msg) => setError(msg)}
              formatCurrency={formatCurrency}
            />
          </Elements>
        </div>

        {error && (
          <div className="px-4 sm:px-6 pb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="px-4 sm:px-6 pb-4 flex items-center gap-2 text-xs text-gray-400">
          <IoLockClosedOutline className="w-3.5 h-3.5" />
          {t('stripeSecureNote')}
        </div>
      </div>
    )
  }

  // ─── CHOOSE STATE ───────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/20 p-4 sm:p-6 border-b border-orange-200 dark:border-orange-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {isModifiedBooking ? 'Complete Payment' : t('paymentChoiceTitle')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isModifiedBooking ? 'Review your total and pay securely via CashApp' : t('paymentChoiceSubtitle')}
        </p>
      </div>

      {/* Add Additional Driver — all manual bookings */}
      {isManualBooking && (
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => { setAddingDriver(!addingDriver); if (addingDriver) { setDriverFirst(''); setDriverLast(''); setDriverDob(null); setDriverLicense('') } }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              addingDriver
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              addingDriver ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <IoPersonAddOutline className={`w-5 h-5 ${addingDriver ? 'text-orange-600' : 'text-gray-400'}`} />
            </div>
            <div className="text-left flex-1">
              <p className={`text-sm font-semibold ${addingDriver ? 'text-orange-800 dark:text-orange-300' : 'text-gray-900 dark:text-white'}`}>
                Add Additional Driver
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Drivers under 25 require additional insurance and deposit
              </p>
            </div>
            <div className={`w-10 h-5 rounded-full flex-shrink-0 relative transition-colors ${
              addingDriver ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                addingDriver ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {/* Driver info form */}
          {addingDriver && (
            <div className="mt-3 space-y-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">First Name</label>
                  <input
                    type="text"
                    value={driverFirst}
                    onChange={(e) => setDriverFirst(capitalize(e.target.value))}
                    placeholder="First name"
                    autoCapitalize="words"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                      driverFirst && driverFirst.trim().length < 2 ? 'border-red-400' : 'border-gray-300 dark:border-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Last Name</label>
                  <input
                    type="text"
                    value={driverLast}
                    onChange={(e) => setDriverLast(capitalize(e.target.value))}
                    placeholder="Last name"
                    autoCapitalize="words"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                      driverLast && driverLast.trim().length < 2 ? 'border-red-400' : 'border-gray-300 dark:border-gray-500'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Date of Birth</label>
                <DatePicker
                  selected={driverDob}
                  onChange={(date) => setDriverDob(date)}
                  showYearDropdown
                  showMonthDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select date of birth"
                  maxDate={new Date()}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  wrapperClassName="w-full"
                  calendarClassName="!rounded-xl !border-0 !shadow-xl"
                  popperClassName="!z-[60]"
                />
                {driverAge !== null && (
                  <p className={`mt-1.5 text-xs font-medium ${isUnder25 ? 'text-orange-600' : 'text-green-600'}`}>
                    {driverAge} years old {isUnder25 ? '— young driver surcharge applies' : '— no surcharge'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Driver License #</label>
                <input
                  type="text"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value.toUpperCase())}
                  placeholder="License number"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                    driverLicense && driverLicense.trim().length < 4 ? 'border-red-400' : 'border-gray-300 dark:border-gray-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Summary */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(booking.dailyRate)} x {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
          </div>
          {(booking.insuranceFee || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trip Insurance</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(booking.insuranceFee!)}</span>
            </div>
          )}
          {isUnder25 && (
            <div className="flex justify-between text-orange-700 dark:text-orange-400">
              <span>Young Driver Surcharge</span>
              <span>{formatCurrency(surcharge)}</span>
            </div>
          )}
          {(booking.serviceFee || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(booking.serviceFee!)}</span>
            </div>
          )}
          {(booking.taxes || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Taxes</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(booking.taxes!)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700 font-semibold">
            <span className="text-gray-900 dark:text-white">Trip Total</span>
            <span className="text-orange-600 dark:text-orange-400">{formatCurrency(displayTotal)}</span>
          </div>
          {deposit > 0 && (
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Security Deposit {isUnder25 && '(under 25)'}</span>
              <span>{formatCurrency(deposit)}</span>
            </div>
          )}
          {deposit > 0 && (
            <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-gray-700 font-bold text-base">
              <span className="text-gray-900 dark:text-white">Total Due</span>
              <span className="text-orange-600 dark:text-orange-400">{formatCurrency(displayGrandTotal)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Options */}
      <div className="p-4 sm:p-6 space-y-3">
        {isModifiedBooking ? (
          /* CashApp only for modified bookings (ItWhip's customer) */
          <div className="space-y-3">
            <button
              onClick={handleChooseCashApp}
              disabled={loading || !driverFormValid}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-[#00D632] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-[#00D632]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D632]/20 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#00D632">
                  <path d="M23.59 3.47A5.1 5.1 0 0 0 20.05.13C19.52 0 18.96 0 17.85 0H6.15C5.04 0 4.48 0 3.95.13A5.1 5.1 0 0 0 .41 3.47 5.15 5.15 0 0 0 0 5.96v12.08c0 1.13 0 1.69.13 2.22a5.1 5.1 0 0 0 3.54 3.54c.53.13 1.09.13 2.22.13h11.22c1.13 0 1.69 0 2.22-.13a5.1 5.1 0 0 0 3.54-3.54c.13-.53.13-1.09.13-2.22V5.96c0-1.11 0-1.67-.13-2.2zM17.3 8.27l-.93.93a.63.63 0 0 1-.76.1A4.87 4.87 0 0 0 13.22 9a4.78 4.78 0 0 0-2.32.94c-.66.51-1.14 1.2-1.39 1.98a4.16 4.16 0 0 0 .29 3.2c.36.66.87 1.21 1.5 1.6.62.39 1.33.61 2.07.63a4.87 4.87 0 0 0 2.39-.3.63.63 0 0 1 .76.1l.93.93a.63.63 0 0 1-.06.93 7.11 7.11 0 0 1-4.08 1.58 7.13 7.13 0 0 1-4.32-1.12 7.14 7.14 0 0 1-2.64-3.26A7.13 7.13 0 0 1 6 11.75a7.14 7.14 0 0 1 2.19-3.52A7.13 7.13 0 0 1 11.94 6.5a7.11 7.11 0 0 1 4.27 1.12c.36.22.69.47 1 .75a.63.63 0 0 1 .06.9z"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{cashappOpened ? 'Open CashApp Again' : 'Pay with CashApp'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pay {formatCurrency(displayGrandTotal)} directly to $itwhip</p>
              </div>
              <IoOpenOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>

            {cashappOpened && (
              <button
                onClick={handleConfirmCashApp}
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="w-4 h-4" />
                    I&apos;ve Paid
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          /* Standard options for non-modified bookings */
          <>
            {/* Pay with Card */}
            <button
              onClick={handleChooseCard}
              disabled={loading || !driverFormValid}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60 transition-colors">
                <IoCardOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{t('payWithCard')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('payWithCardDesc')}</p>
              </div>
              <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>

            {/* Pay Cash at Pickup */}
            <button
              onClick={handleChooseCash}
              disabled={loading || !driverFormValid}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                <IoCashOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{t('payCashAtPickup')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('payCashDesc')}</p>
              </div>
            </button>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {t('paymentChoiceOnce')}
        </p>
      </div>
    </div>
  )
}

// ─── Stripe Card Payment Form (inner component) ──────────
function CardPaymentForm({
  bookingId,
  amount,
  onSuccess,
  onError,
  formatCurrency,
}: {
  bookingId: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (msg: string) => void
  formatCurrency: (n: number) => string
}) {
  const t = useTranslations('BookingDetail')
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    onError('')

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/en/rentals/dashboard/bookings/${bookingId}`,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      onError(result.error.message || 'Payment failed')
      setProcessing(false)
    } else if (
      result.paymentIntent?.status === 'requires_capture' ||
      result.paymentIntent?.status === 'succeeded'
    ) {
      onSuccess(result.paymentIntent.id)
    } else {
      onError(`Unexpected payment status: ${result.paymentIntent?.status}`)
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !ready || processing}
        className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            {t('processing')}
          </>
        ) : (
          <>
            <IoLockClosedOutline className="w-4 h-4" />
            {t('authorizePayment', { amount: formatCurrency(amount) })}
          </>
        )}
      </button>
    </form>
  )
}
