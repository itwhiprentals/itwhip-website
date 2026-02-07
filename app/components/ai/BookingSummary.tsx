'use client'

import Image from 'next/image'
import {
  IoLocationSharp,
  IoCalendar,
  IoCar,
  IoShield,
} from 'react-icons/io5'
import type { BookingSummary } from '@/app/lib/ai-booking/types'

interface BookingSummaryProps {
  summary: BookingSummary
  onConfirm: () => void
  onChangeVehicle: () => void
}

export default function BookingSummaryCard({
  summary,
  onConfirm,
  onChangeVehicle,
}: BookingSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <SummaryHeader vehicle={summary.vehicle} />
      <SummaryDetails summary={summary} />
      <PriceBreakdown summary={summary} />
      <SummaryActions onConfirm={onConfirm} onChangeVehicle={onChangeVehicle} />
    </div>
  )
}

function SummaryHeader({ vehicle }: { vehicle: BookingSummary['vehicle'] }) {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700">
      {vehicle.photo && (
        <div className="w-16 h-12 rounded-md overflow-hidden relative flex-shrink-0">
          <Image
            src={vehicle.photo}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Booking Summary
        </p>
      </div>
    </div>
  )
}

function SummaryDetails({ summary }: { summary: BookingSummary }) {
  return (
    <div className="p-3 space-y-2">
      <DetailRow
        icon={<IoLocationSharp size={14} className="text-primary" />}
        label="Location"
        value={summary.location}
      />
      <DetailRow
        icon={<IoCalendar size={14} className="text-primary" />}
        label="Dates"
        value={`${formatDate(summary.startDate)} – ${formatDate(summary.endDate)} (${summary.numberOfDays} day${summary.numberOfDays > 1 ? 's' : ''})`}
      />
      <DetailRow
        icon={<IoCar size={14} className="text-primary" />}
        label="Vehicle"
        value={`${summary.vehicle.year} ${summary.vehicle.make} ${summary.vehicle.model}`}
      />
      <DetailRow
        icon={<IoShield size={14} className="text-primary" />}
        label="Deposit"
        value={`$${summary.depositAmount} (refundable)`}
      />
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500">
          {label}
        </span>
        <p className="text-sm text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function PriceBreakdown({ summary }: { summary: BookingSummary }) {
  // Use real insurance rate from InsuranceProvider if available, fall back to estimate
  const hasRealInsurance = summary.vehicle.insuranceBasicDaily != null
  const insuranceDaily = summary.vehicle.insuranceBasicDaily ?? Math.max(Math.round(summary.dailyRate * 0.12), 8)
  const insuranceEstimate = insuranceDaily * summary.numberOfDays
  const totalAtCheckout = summary.estimatedTotal + insuranceEstimate + summary.depositAmount

  return (
    <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
      <PriceLine label={`$${summary.dailyRate} × ${summary.numberOfDays} day${summary.numberOfDays > 1 ? 's' : ''}`} amount={summary.subtotal} />
      <PriceLine label="Service fee (15%)" amount={summary.serviceFee} />
      <PriceLine label="Estimated tax (8.4%)" amount={summary.estimatedTax} />
      <PriceLine label={`Insurance (${hasRealInsurance ? 'Basic' : 'est., Basic'})`} amount={insuranceEstimate} />
      {summary.depositAmount > 0 && (
        <PriceLine label="Security deposit (refundable)" amount={summary.depositAmount} />
      )}
      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-bold text-gray-900 dark:text-white">Total at checkout</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">${totalAtCheckout.toFixed(2)}</span>
      </div>
    </div>
  )
}

function PriceLine({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 py-0.5">
      <span>{label}</span>
      <span>${amount.toFixed(2)}</span>
    </div>
  )
}

function SummaryActions({
  onConfirm,
  onChangeVehicle,
}: {
  onConfirm: () => void
  onChangeVehicle: () => void
}) {
  return (
    <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={onChangeVehicle}
        className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        Change Vehicle
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
      >
        Continue to Checkout
      </button>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
