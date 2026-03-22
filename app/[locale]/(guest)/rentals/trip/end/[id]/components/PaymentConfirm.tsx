// app/(guest)/rentals/trip/end/[id]/components/PaymentConfirm.tsx
// Final confirmation — mirrors app ReturnConfirm + PaymentReceipt + LegalCompliance

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { getTaxRate, getCityFromAddress } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'
import {
  IoCheckmarkCircleOutline,
  IoReceiptOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5'

interface PaymentConfirmProps {
  booking: any
  data: any
  charges: any
  depositAmount?: number
  onTermsAcceptance?: (accepted: boolean) => void
  onSubmit?: () => void
  submitting?: boolean
}

const fmt = (n: number | undefined | null) => {
  if (n == null || isNaN(n)) return '0.00'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PaymentConfirm({
  booking,
  data,
  charges,
  depositAmount = 500,
  onTermsAcceptance,
  onSubmit,
  submitting = false,
}: PaymentConfirmProps) {
  const t = useTranslations('PaymentConfirm')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [legalExpanded, setLegalExpanded] = useState(false)

  const hasDisputes = data.disputes && data.disputes.length > 0
  const photoCount = data.photos ? Object.keys(data.photos).filter((k: string) => data.photos[k]).length : 0

  // Booking line items
  const dailyRate = booking.dailyRate || 0
  const tripDays = booking.numberOfDays || 1
  const subtotal = booking.subtotal || dailyRate * tripDays
  const deliveryFee = booking.deliveryFee || 0
  const insuranceFee = booking.insuranceFee || 0
  const serviceFee = booking.serviceFee || 0
  const taxes = booking.taxes || 0
  const totalPaid = booking.totalAmount || 0
  const creditsApplied = booking.creditsApplied || 0
  const bonusApplied = booking.bonusApplied || 0

  // Trip charges
  const startMileage = booking.startMileage || 0
  const endMileage = data.odometer || 0
  const milesDriven = Math.max(0, endMileage - startMileage)
  const includedMiles = tripDays * 200
  const overageMiles = Math.max(0, milesDriven - includedMiles)
  const mileageCharge = overageMiles * 0.45

  const FUEL_PCT: Record<string, number> = { empty: 0, quarter: 25, half: 50, three_quarter: 75, full: 100, Empty: 0, '1/4': 25, '1/2': 50, '3/4': 75, Full: 100 }
  const startFuelPct = FUEL_PCT[booking.fuelLevelStart] ?? 100
  const endFuelPct = FUEL_PCT[data.fuelLevel] ?? 100
  const quartersDown = Math.max(0, Math.ceil((startFuelPct - endFuelPct) / 25))
  const fuelCharge = quartersDown * 75

  const totalCharges = mileageCharge + fuelCharge
  const depositReturn = Math.max(0, depositAmount - totalCharges)
  const additionalDue = Math.max(0, totalCharges - depositAmount)

  return (
    <div className="space-y-4">
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Confirm & End Trip</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review everything before completing your rental</p>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 divide-x divide-gray-200 dark:divide-gray-700">
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{booking.car?.year} {booking.car?.make}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{booking.car?.model}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{milesDriven.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Miles driven</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{photoCount}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Photos</p>
        </div>
      </div>

      {/* Disputes Banner */}
      {hasDisputes && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <IoAlertCircleOutline className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">{data.disputes.length} dispute{data.disputes.length > 1 ? 's' : ''} filed</p>
            <p className="text-[10px] text-amber-800 dark:text-amber-300">Disputed charges will be held pending resolution (24-48h)</p>
          </div>
        </div>
      )}

      {/* Payment Summary Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <IoReceiptOutline className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payment Summary</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Complete breakdown of your rental</p>
        </div>
      </div>

      {/* INITIAL BOOKING Section */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 space-y-2">
        <p className="text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-1">Initial Booking</p>
        <Row label={`${tripDays} day${tripDays > 1 ? 's' : ''} × $${fmt(dailyRate)}`} value={`$${fmt(subtotal)}`} />
        {deliveryFee > 0 && <Row label="Delivery fee" value={`$${fmt(deliveryFee)}`} />}
        {insuranceFee > 0 && <Row label="Insurance" value={`$${fmt(insuranceFee)}`} />}
        {serviceFee > 0 && <Row label="Service fee" value={`$${fmt(serviceFee)}`} />}
        {taxes > 0 && <Row label="Taxes" value={`$${fmt(taxes)}`} />}
        {creditsApplied > 0 && <Row label="Credits applied" value={`-$${fmt(creditsApplied)}`} green />}
        {bonusApplied > 0 && <Row label="Bonus applied" value={`-$${fmt(bonusApplied)}`} green />}
        <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200 dark:border-gray-600">
          <span className="text-[13px] font-bold text-gray-900 dark:text-white">Total Paid</span>
          <span className="text-[15px] font-extrabold text-gray-900 dark:text-white">${fmt(totalPaid)}</span>
        </div>
      </div>

      {/* TRIP CHARGES Section */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 space-y-2">
        <p className="text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-1">Trip Charges</p>
        {totalCharges === 0 ? (
          <div className="flex items-center gap-1.5 py-1">
            <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-600">No additional charges</span>
          </div>
        ) : (
          <>
            {mileageCharge > 0 && <Row label={`Mileage overage (${overageMiles} mi)`} value={`$${fmt(mileageCharge)}`} red />}
            {fuelCharge > 0 && <Row label={`Fuel refill (${quartersDown}Q)`} value={`$${fmt(fuelCharge)}`} red />}
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200 dark:border-gray-600">
              <span className="text-[13px] font-bold text-red-600">Total Charges</span>
              <span className="text-[15px] font-extrabold text-red-600">${fmt(totalCharges)}</span>
            </div>
          </>
        )}
      </div>

      {/* DEPOSIT SETTLEMENT Section */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 space-y-2">
        <p className="text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-1">Deposit Settlement</p>
        <Row label="Security deposit held" value={`$${fmt(depositAmount)}`} />
        {totalCharges > 0 && <Row label="Charges deducted" value={`-$${fmt(totalCharges)}`} red />}
        <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-1.5">
            <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[13px] font-bold text-green-600">Deposit Return</span>
          </div>
          <span className="text-[15px] font-extrabold text-green-600">${fmt(depositReturn)}</span>
        </div>
        {additionalDue > 0 && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-1">
            <IoAlertCircleOutline className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <p className="text-[11px] text-red-800 dark:text-red-300">Additional ${fmt(additionalDue)} will be charged to your payment method</p>
          </div>
        )}
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Deposit returned within 3–5 business days per A.R.S. §33-1321</p>
      </div>

      {/* DEPOSIT RETURN REQUIREMENTS */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 space-y-1.5">
        <p className="text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-1">Deposit Return Requirements</p>
        {[
          { text: 'Return on time (avoid late fees)', color: 'text-blue-600' },
          { text: 'Same fuel level (avoid fuel fee)', color: 'text-blue-600' },
          { text: 'Stay within mileage (avoid overage)', color: 'text-blue-600' },
          { text: 'No damage (normal wear accepted)', color: 'text-green-600' },
          { text: 'Follow rules (avoid smoking fee)', color: 'text-amber-600' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <IoCheckmarkCircleOutline className={`w-3.5 h-3.5 ${item.color} flex-shrink-0`} />
            <span className="text-[11px] text-gray-600 dark:text-gray-400">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Legal Compliance Accordion */}
      <button
        onClick={() => setLegalExpanded(!legalExpanded)}
        className="w-full flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
        <span className="text-[11px] font-semibold text-gray-900 dark:text-white flex-1 text-left">Arizona Legal Compliance</span>
        {legalExpanded ? <IoChevronUp className="w-4 h-4 text-gray-500" /> : <IoChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {legalExpanded && (
        <div className="p-3 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg -mt-4 space-y-1">
          <p className="text-[11px] font-bold text-gray-900 dark:text-white">A.R.S. §33-1321</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">• Security deposit released within 7-14 business days</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">• Itemized statement provided within 14 days</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">• 48-hour window to dispute charges</p>
          <p className="text-[11px] font-bold text-gray-900 dark:text-white mt-2">Your Rights</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">• Normal wear and tear is exempt from charges</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">• Email receipt sent upon trip completion</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">• Photo evidence available for all inspections</p>
        </div>
      )}

      {/* Terms Checkbox */}
      <button
        onClick={() => {
          setAcceptedTerms(!acceptedTerms)
          onTermsAcceptance?.(!acceptedTerms)
        }}
        className={`w-full flex items-start gap-2.5 p-3 rounded-lg border-[1.5px] transition-colors text-left ${
          acceptedTerms
            ? 'border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
        }`}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          acceptedTerms
            ? 'bg-green-600 border-green-600'
            : 'bg-transparent border-gray-300 dark:border-gray-600'
        }`}>
          {acceptedTerms && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-4">
          I confirm the vehicle is returned. Deposit will be settled per A.R.S. §33-1321. I'll receive an itemized statement within 14 days and have 48 hours to dispute.
        </p>
      </button>

      {/* End Trip Button */}
      <button
        onClick={() => onSubmit?.()}
        disabled={!acceptedTerms || submitting}
        className={`w-full py-3.5 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all ${
          acceptedTerms && !submitting
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <span>Processing...</span>
        ) : (
          <>
            <IoCheckmarkCircleOutline className="w-5 h-5" />
            <span>End Trip</span>
          </>
        )}
      </button>

      <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center">
        By ending the trip, you agree to the terms above. An email receipt will be sent to your registered email.
      </p>
    </div>
  )
}

function Row({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-semibold ${green ? 'text-green-600' : red ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{value}</span>
    </div>
  )
}
