// app/partner/settings/components/BankingTab.tsx
'use client'

import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoLinkOutline
} from 'react-icons/io5'

type StripeConnectStatus = 'not_connected' | 'pending' | 'connected' | 'restricted'

interface BankingTabProps {
  stripeConnectStatus: StripeConnectStatus
  stripeAccountId: string | null
  onConnectStripe: () => Promise<void>
}

export function BankingTab({ stripeConnectStatus, stripeAccountId, onConnectStripe }: BankingTabProps) {
  const t = useTranslations('PartnerSettings')

  const getStripeStatusBadge = () => {
    switch (stripeConnectStatus) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            {t('stripeConnected')}
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <IoAlertCircleOutline className="w-4 h-4" />
            {t('setupIncomplete')}
          </span>
        )
      case 'restricted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <IoAlertCircleOutline className="w-4 h-4" />
            {t('actionRequired')}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            {t('notConnected')}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6" id="banking">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bankingAndPayoutsTitle')}</h2>

      {/* Stripe Connect Status */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-gray-900 dark:text-white">{t('stripeConnect')}</p>
          {getStripeStatusBadge()}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {stripeConnectStatus === 'connected'
            ? t('payoutReady')
            : stripeConnectStatus === 'pending'
            ? t('setupNotFinished')
            : stripeConnectStatus === 'restricted'
            ? t('additionalInfoNeeded')
            : t('connectBankPrompt')}
        </p>

        {stripeConnectStatus === 'not_connected' && (
          <button
            onClick={onConnectStripe}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <IoLinkOutline className="w-5 h-5" />
            {t('connectWithStripe')}
          </button>
        )}

        {stripeConnectStatus === 'restricted' && (
          <button
            onClick={onConnectStripe}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <IoAlertCircleOutline className="w-5 h-5" />
            {t('completeVerification')}
          </button>
        )}

        {stripeConnectStatus === 'pending' && (
          <div className="mt-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {t('pendingSetupWarning')}
              </p>
            </div>
            <button
              onClick={onConnectStripe}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              <IoLinkOutline className="w-5 h-5" />
              {t('continueSetup')}
            </button>
          </div>
        )}
      </div>

      {/* Connected Account Details */}
      {stripeConnectStatus === 'connected' && stripeAccountId && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-300">{t('accountVerified')}</p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {t('accountVerifiedDesc')}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-mono">
                  {t('accountIdLabel', { id: stripeAccountId })}
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Express Dashboard Link */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('stripeExpressDashboard')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('stripeExpressDashboardDesc')}
                </p>
              </div>
              <a
                href="https://connect.stripe.com/express_login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors text-sm font-medium"
              >
                <IoLinkOutline className="w-4 h-4" />
                {t('openDashboard')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Payout Info */}
      {stripeConnectStatus === 'connected' && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('payoutInformation')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('payoutScheduleLabel')}</span>
              <span className="text-gray-900 dark:text-white font-medium">{t('platformManaged')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('currencyLabel')}</span>
              <span className="text-gray-900 dark:text-white font-medium">USD</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              {t('payoutProcessedDesc')}
            </p>
          </div>
        </div>
      )}

      {/* Not Connected Info */}
      {stripeConnectStatus === 'not_connected' && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('whyConnectStripe')}</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('receivePayouts')}</span>
            </li>
            <li className="flex items-start gap-2">
              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('securePayments')}</span>
            </li>
            <li className="flex items-start gap-2">
              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('accessPayoutHistory')}</span>
            </li>
            <li className="flex items-start gap-2">
              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('taxForms1099')}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
