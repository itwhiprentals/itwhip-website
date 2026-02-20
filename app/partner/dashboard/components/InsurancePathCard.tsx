// app/partner/dashboard/components/InsurancePathCard.tsx
// Insurance Path Card - Shows when host selected insurance revenue path

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  IoShieldCheckmarkOutline,
  IoSettingsOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5'

interface InsurancePathCardProps {
  revenueTier: string | null
  commissionRate: number
}

export default function InsurancePathCard({
  revenueTier,
  commissionRate,
}: InsurancePathCardProps) {
  const t = useTranslations('PartnerDashboard')

  const payoutPercent = Math.round((1 - commissionRate) * 100)
  const commissionPercent = Math.round(commissionRate * 100)

  const getInsuranceLabel = () => {
    if (revenueTier === 'commercial') return 'Commercial Insurance'
    if (revenueTier === 'p2p') return 'P2P Insurance'
    if (revenueTier === 'self_manage') return 'Self-Manage'
    return 'Platform Insurance'
  }

  const getBadgeColor = () => {
    if (revenueTier === 'commercial') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    if (revenueTier === 'p2p') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('insurancePathTitle')}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('insurancePathSubtitle')}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getBadgeColor()}`}>
            {getInsuranceLabel()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rate Display */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tierCommissionRate')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {commissionPercent}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('tierYouKeep', { percent: payoutPercent })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('insurancePathType')}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{getInsuranceLabel()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/partner/insurance"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <IoSettingsOutline className="w-4 h-4" />
            {t('insuranceManage')}
          </Link>
          <Link
            href="/partner/revenue"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <IoSwapHorizontalOutline className="w-4 h-4" />
            {t('insuranceChangePath')}
          </Link>
        </div>
      </div>
    </div>
  )
}
