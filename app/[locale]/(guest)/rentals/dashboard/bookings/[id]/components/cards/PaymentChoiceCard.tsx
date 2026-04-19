'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { calculateAppliedBalances, type GuestBalances } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
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

  // Guest wallet balances + toggles (default: all applied)
  const [balances, setBalances] = useState<GuestBalances>({ creditBalance: 0, bonusBalance: 0, depositWalletBalance: 0 })
  const [applyCredit, setApplyCredit] = useState(true)
  const [applyBonus, setApplyBonus] = useState(true)
  const [applyDeposit, setApplyDeposit] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [balRes, depRes] = await Promise.all([
          fetch('/api/payments/balance', { credentials: 'include' }),
          fetch('/api/payments/deposit-wallet', { credentials: 'include' }),
        ])
        const bal = balRes.ok ? await balRes.json() : {}
        const dep = depRes.ok ? await depRes.json() : {}
        setBalances({
          creditBalance: bal.creditBalance || 0,
          bonusBalance: bal.bonusBalance || 0,
          depositWalletBalance: dep.balance || 0,
        })
      } catch {}
    })()
  }, [])

  // Apply balances using the shared rule set
  const effectiveBalances: GuestBalances = {
    creditBalance: applyCredit ? balances.creditBalance : 0,
    bonusBalance: applyBonus ? balances.bonusBalance : 0,
    depositWalletBalance: applyDeposit ? balances.depositWalletBalance : 0,
  }
  const applied = calculateAppliedBalances(
    { total: displayTotal, basePrice: booking.subtotal } as any,
    deposit,
    effectiveBalances,
  )
  const remainingToPay = Math.max(0, applied.amountToPay + applied.depositFromCard)

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
    const amount = Math.ceil(remainingToPay)
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
        body: JSON.stringify({
          choice: 'CASHAPP',
          underAge: isUnder25,
          amount: remainingToPay,
          applyCredit,
          applyBonus,
          applyDeposit,
          additionalDriver: addingDriver ? { firstName: driverFirst, lastName: driverLast, dob: driverDob?.toISOString().split('T')[0] || null, licenseNumber: driverLicense } : null,
        }),
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
          {/* Apply balances — credit, bonus, deposit wallet */}
          {(balances.creditBalance > 0 || balances.bonusBalance > 0 || balances.depositWalletBalance > 0) && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
              {balances.creditBalance > 0 && (
                <label className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={applyCredit} onChange={(e) => setApplyCredit(e.target.checked)} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">Apply credit <span className="text-xs text-gray-400">(${balances.creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available)</span></span>
                  </div>
                  <span className={applied.creditsApplied > 0 ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-400'}>-{formatCurrency(applied.creditsApplied)}</span>
                </label>
              )}
              {balances.bonusBalance > 0 && (
                <label className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={applyBonus} onChange={(e) => setApplyBonus(e.target.checked)} className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">Apply bonus <span className="text-xs text-gray-400">(${balances.bonusBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · 25% max of base)</span></span>
                  </div>
                  <span className={applied.bonusApplied > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400'}>-{formatCurrency(applied.bonusApplied)}</span>
                </label>
              )}
              {balances.depositWalletBalance > 0 && deposit > 0 && (
                <label className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={applyDeposit} onChange={(e) => setApplyDeposit(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">Apply deposit wallet <span className="text-xs text-gray-400">(${balances.depositWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available)</span></span>
                  </div>
                  <span className={applied.depositFromWallet > 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400'}>-{formatCurrency(applied.depositFromWallet)}</span>
                </label>
              )}
            </div>
          )}
          {deposit > 0 && (
            <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-gray-700 font-bold text-base">
              <span className="text-gray-900 dark:text-white">Total Due</span>
              <span className="text-orange-600 dark:text-orange-400">{formatCurrency(remainingToPay)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Options */}
      <div className="p-4 sm:p-6 space-y-3">
        {isModifiedBooking ? (
          /* CashApp only for modified bookings (ItWhip's customer) */
          <div className="space-y-3">
            {remainingToPay < 1 ? (
              /* Fully covered by balances — single Confirm button, no CashApp needed */
              <button
                onClick={handleConfirmCashApp}
                disabled={loading || !driverFormValid}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="w-5 h-5" />
                    Confirm Booking — Fully covered by your balance
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleChooseCashApp}
                  disabled={loading || !driverFormValid}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-[#00D632] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-full bg-[#00D632]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D632]/20 transition-colors">
                    <svg className="w-7 h-7" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#00D632">
                      <title>Cash App</title>
                      <path d="M23.59 3.475a5.1 5.1 0 00-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 00-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 003.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 003.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zm-6.17 4.63l-.93.93a.5.5 0 01-.67.01 5 5 0 00-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 01-.48.39H9.63l-.09-.01a.5.5 0 01-.38-.59l.28-1.27a6.54 6.54 0 01-2.88-1.57v-.01a.48.48 0 010-.68l1-.97a.49.49 0 01.67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 01.48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"/>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{cashappOpened ? 'Open CashApp Again' : 'Pay with CashApp'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pay {formatCurrency(remainingToPay)} directly to $itwhip</p>
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
              </>
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
