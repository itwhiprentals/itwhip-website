'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoShieldOutline,
  IoCalendarOutline,
  IoReceiptOutline,
} from 'react-icons/io5'
import { formatPhoneNumber } from '@/app/utils/helpers'

interface GuestInfoCardProps {
  renter: {
    id: string
    name: string
    email: string
    phone: string | null
    photo: string | null
    memberSince: string | null
  }
  isVerified?: boolean
  guestInsurance?: { provided: boolean } | null
  bookingId?: string | null
  bookingStatus?: string | null
  guestHistory?: { totalBookings: number; totalSpent: number } | null
  formatCurrency?: (amount: number) => string
}

export function GuestInfoCard({ renter, isVerified, guestInsurance, bookingId, bookingStatus, guestHistory, formatCurrency }: GuestInfoCardProps) {
  const t = useTranslations('PartnerBookings')
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const isCovered = guestInsurance?.provided

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {renter.photo ? (
            <div className="w-14 h-14 rounded-full border border-white shadow-sm overflow-hidden">
              <img src={renter.photo} alt={renter.name} className="w-full h-full rounded-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full border border-white shadow-sm flex items-center justify-center">
              <IoPersonOutline className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white">{renter.name}</h3>
              {isVerified !== undefined && (
                isVerified ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-green-600 text-white">
                    <IoShieldCheckmarkOutline className="w-3 h-3" />
                    {t('bdVerified')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-red-600 text-white">
                    <IoShieldOutline className="w-3 h-3" />
                    {t('bdNotVerified')}
                  </span>
                )
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
              <IoMailOutline className="w-3.5 h-3.5 flex-shrink-0" />
              {renter.email}
            </div>
            {renter.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                <IoCallOutline className="w-3.5 h-3.5 flex-shrink-0" />
                +1 {formatPhoneNumber(renter.phone)}
              </div>
            )}
            {renter.memberSince && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <IoCalendarOutline className="w-3.5 h-3.5 flex-shrink-0" />
                {t('bdMemberSince')} {new Date(renter.memberSince).toLocaleDateString()}
              </div>
            )}
            {guestHistory && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <IoReceiptOutline className="w-3.5 h-3.5 flex-shrink-0" />
                {guestHistory.totalBookings} {t('bdBookingsLabel')} · {formatCurrency ? formatCurrency(guestHistory.totalSpent) : `$${guestHistory.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} {t('bdSpentLabel')}
              </div>
            )}
            {bookingId && bookingStatus === 'CONFIRMED' && renter.phone && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/twilio/masked-call', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ bookingId }),
                    })
                    if (res.ok) {
                      alert(t('bdCallGuestSuccess'))
                    } else {
                      const data = await res.json().catch(() => ({}))
                      alert(data.error || t('bdCallGuestFailed'))
                    }
                  } catch {
                    alert(t('bdCallGuestFailed'))
                  }
                }}
                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <IoCallOutline className="w-3.5 h-3.5" />
                {t('bdCallGuest')}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-green-600 text-white">
            ACTIVE MEMBER
          </span>
        </div>
      </div>

      {/* Status Badges + View Profile */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Insurance Badge — always optional, never red */}
        {guestInsurance !== undefined && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'insured' ? null : 'insured') }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
                isCovered
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <IoShieldOutline className="w-3 h-3" />
              {isCovered ? t('bdInsured') : t('bdInsuranceNotProvided')}
            </button>
            {activeTooltip === 'insured' && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                <p className="font-semibold mb-1">{isCovered ? t('bdInsuranceCoverage') : t('bdInsuranceNotCovered')}</p>
                <p>{isCovered ? t('bdInsuranceCoverageDesc') : t('bdInsuranceNotCoveredDesc')}</p>
                <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
              </div>
            )}
          </div>
        )}

        {/* View Profile — far right */}
        <Link
          href={`/partner/customers/${renter.id}`}
          className="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {t('bdViewProfile')} →
        </Link>
      </div>
    </div>
  )
}
