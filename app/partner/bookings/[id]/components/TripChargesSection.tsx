// app/partner/bookings/[id]/components/TripChargesSection.tsx
// Extracted trip charges collapsible section from booking detail page

'use client'

import { useTranslations } from 'next-intl'
import {
  IoReceiptOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoAddOutline,
} from 'react-icons/io5'

interface TripCharge {
  id: string
  description: string
  chargeType: string
  amount: number
  status: string
  createdAt: string
}

interface TripChargesSectionProps {
  tripCharges: TripCharge[]
  expanded: boolean
  onToggle: () => void
  onAddCharge: () => void
  formatCurrency: (amount: number) => string
}

export function TripChargesSection({
  tripCharges,
  expanded,
  onToggle,
  onAddCharge,
  formatCurrency,
}: TripChargesSectionProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <IoReceiptOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdTripCharges')}</h3>
          {tripCharges.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {tripCharges.length}
            </span>
          )}
        </div>
        {expanded ? (
          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {tripCharges.length > 0 ? (
            <div className="space-y-3">
              {tripCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between p-3 bg-gray-200/70 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-transparent"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{charge.description}</p>
                    <p className="text-xs text-gray-500">
                      {charge.chargeType} • {new Date(charge.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(charge.amount)}
                    </p>
                    <span className={`text-xs ${
                      charge.status === 'PAID' ? 'text-green-600' :
                      charge.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {charge.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              {t('bdNoAdditionalCharges')}
            </p>
          )}

          <button
            onClick={onAddCharge}
            className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <IoAddOutline className="w-4 h-4" />
            {t('bdAddCharge')}
          </button>
        </div>
      )}
    </div>
  )
}
