'use client'

import Image from 'next/image'
import {
  IoLocationSharp,
  IoCalendar,
  IoCar,
  IoShield,
} from 'react-icons/io5'
import type { BookingSummary } from '@/app/lib/ai-booking/types'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

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
  const t = useTranslations('ChoeAI')
  const locale = useLocale()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <SummaryHeader vehicle={summary.vehicle} t={t} />
      <SummaryDetails summary={summary} t={t} locale={locale} />
      <PriceBreakdown summary={summary} t={t} />
      <SummaryActions onConfirm={onConfirm} onChangeVehicle={onChangeVehicle} t={t} />
    </div>
  )
}

function SummaryHeader({ vehicle, t }: { vehicle: BookingSummary['vehicle']; t: any }) {
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
          {t('bookingSummary')}
        </p>
      </div>
    </div>
  )
}

function SummaryDetails({ summary, t, locale }: { summary: BookingSummary; t: any; locale: string }) {
  const dayLabel = summary.numberOfDays > 1 ? t('days') : t('day')
  return (
    <div className="p-3 space-y-2">
      <DetailRow
        icon={<IoLocationSharp size={14} className="text-primary" />}
        label={t('detailLocation')}
        value={summary.location}
      />
      <DetailRow
        icon={<IoCalendar size={14} className="text-primary" />}
        label={t('detailDates')}
        value={`${formatDate(summary.startDate, locale)} – ${formatDate(summary.endDate, locale)} (${summary.numberOfDays} ${dayLabel})`}
      />
      <DetailRow
        icon={<IoCar size={14} className="text-primary" />}
        label={t('detailVehicle')}
        value={`${summary.vehicle.year} ${summary.vehicle.make} ${summary.vehicle.model}`}
      />
      <DetailRow
        icon={<IoShield size={14} className="text-primary" />}
        label={t('detailDeposit')}
        value={`$${summary.depositAmount} ${t('refundable')}`}
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

function PriceBreakdown({ summary, t }: { summary: BookingSummary; t: any }) {
  // Use real insurance rate from InsuranceProvider if available, fall back to estimate
  const hasRealInsurance = summary.vehicle.insuranceBasicDaily != null
  const insuranceDaily = summary.vehicle.insuranceBasicDaily ?? Math.max(Math.round(summary.dailyRate * 0.12), 8)
  const insuranceEstimate = insuranceDaily * summary.numberOfDays
  const totalAtCheckout = summary.estimatedTotal + insuranceEstimate + summary.depositAmount
  const dayLabel = summary.numberOfDays > 1 ? t('days') : t('day')

  return (
    <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
      <PriceLine label={`$${summary.dailyRate} × ${summary.numberOfDays} ${dayLabel}`} amount={summary.subtotal} />
      <PriceLine label={t('serviceFee')} amount={summary.serviceFee} />
      <PriceLine label={t('estimatedTax')} amount={summary.estimatedTax} />
      <PriceLine label={hasRealInsurance ? t('insuranceBasic') : t('insuranceEstBasic')} amount={insuranceEstimate} />
      {summary.depositAmount > 0 && (
        <PriceLine label={t('securityDeposit')} amount={summary.depositAmount} />
      )}
      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{t('totalAtCheckout')}</span>
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
  t,
}: {
  onConfirm: () => void
  onChangeVehicle: () => void
  t: any
}) {
  return (
    <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={onChangeVehicle}
        className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {t('changeVehicle')}
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
      >
        {t('continueToCheckout')}
      </button>
    </div>
  )
}

const LOCALE_MAP: Record<string, string> = { en: 'en-US', es: 'es-ES', fr: 'fr-FR' }

function formatDate(iso: string, locale = 'en'): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(LOCALE_MAP[locale] || 'en-US', { month: 'short', day: 'numeric' })
}
