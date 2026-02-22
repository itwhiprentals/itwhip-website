'use client'

import { useState } from 'react'
import {
  IoClose,
  IoTimeOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5'
import { useTranslations } from 'next-intl'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PolicyCardProps {
  onDismiss?: () => void
}

// ---------------------------------------------------------------------------
// Cancellation tier data
// ---------------------------------------------------------------------------

const CANCEL_TIERS = [
  { label: '72+ hrs', refund: '100%', color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400', width: 'w-full' },
  { label: '24-72 hrs', refund: '75%', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400', width: 'w-3/4' },
  { label: '12-24 hrs', refund: '50%', color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-400', width: 'w-1/2' },
  { label: '<12 hrs', refund: '0%', color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400', width: 'w-0' },
]

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 py-2 px-1 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded"
      >
        <span className="text-primary flex-shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-gray-900 dark:text-white flex-1">{title}</span>
        {open ? (
          <IoChevronUp size={12} className="text-gray-400" />
        ) : (
          <IoChevronDown size={12} className="text-gray-400" />
        )}
      </button>
      {open && (
        <ul className="pb-2 px-1 pl-6 text-[11px] text-gray-500 dark:text-gray-400 leading-snug space-y-0.5 list-disc list-outside ml-2.5">
          {children}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PolicyCard({ onDismiss }: PolicyCardProps) {
  const t = useTranslations('ChoeAI')

  return (
    <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white">
          {t('policyCardTitle')}
        </h3>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Dismiss"
          >
            <IoClose size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      <div className="px-3 pb-2.5 space-y-0">
        {/* Cancellation — always open by default */}
        <Section
          icon={<IoTimeOutline size={14} />}
          title={t('policyCancellation')}
          defaultOpen
        >
          {/* Visual tier bar */}
          <div className="space-y-1 mb-1.5">
            {CANCEL_TIERS.map((tier) => (
              <div key={tier.label} className="flex items-center gap-1.5">
                <span className="w-14 text-[10px] font-medium text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                  {tier.label}
                </span>
                <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  {tier.width !== 'w-0' && (
                    <div className={`h-full ${tier.color} ${tier.width} rounded-full flex items-center justify-end pr-1`}>
                      <span className="text-[9px] font-bold text-white">{tier.refund}</span>
                    </div>
                  )}
                </div>
                <span className={`w-8 text-[10px] font-semibold ${tier.textColor} flex-shrink-0`}>
                  {tier.refund === '0%' ? t('policyNoRefund') : tier.refund}
                </span>
              </div>
            ))}
          </div>
          <li>{t('policyCancellationServiceFees')}</li>
          <li>{t('policyCancellationNoShow')}</li>
          <li>{t('policyCancellationSelfCancel')}</li>
        </Section>

        {/* Deposits */}
        <Section icon={<IoWalletOutline size={14} />} title={t('policyDeposits')}>
          <li>{t('policyDepositHold')}</li>
          <li>{t('policyDepositRelease')}</li>
          <li>{t('policyDepositConditions')}</li>
          <li>{t('policyDepositDispute')}</li>
        </Section>

        {/* Insurance & Protection */}
        <Section icon={<IoShieldCheckmarkOutline size={14} />} title={t('policyProtection')}>
          <li>{t('policyProtectionTiers')}</li>
          <li>{t('policyProtectionNoTrip')}</li>
          <li>{t('policyProtectionP2P')}</li>
        </Section>

        {/* Verification & Early Return */}
        <Section icon={<IoCarSportOutline size={14} />} title={t('policyOther')}>
          <li>{t('policyVerificationFailure')}</li>
          <li>{t('policyEarlyReturn')}</li>
        </Section>
      </div>
    </div>
  )
}
