// app/partner/settings/components/NotificationsTab.tsx
'use client'

import { useTranslations } from 'next-intl'
import { IoSaveOutline } from 'react-icons/io5'

interface NotificationsTabProps {
  settings: {
    emailNotifications: boolean
    bookingAlerts: boolean
    payoutAlerts: boolean
    marketingEmails: boolean
  }
  setSettings: (updater: (prev: any) => any) => void
  onSave: (section: string) => Promise<void>
  isSaving: boolean
}

export function NotificationsTab({ settings, setSettings, onSave, isSaving }: NotificationsTabProps) {
  const t = useTranslations('PartnerSettings')

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('notificationPreferences')}</h2>

      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t('emailNotificationsLabel')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('emailNotificationsDesc')}</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
            className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t('bookingAlertsLabel')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookingAlertsDesc')}</p>
          </div>
          <input
            type="checkbox"
            checked={settings.bookingAlerts}
            onChange={(e) => setSettings(prev => ({ ...prev, bookingAlerts: e.target.checked }))}
            className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t('payoutAlertsLabel')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('payoutAlertsDesc')}</p>
          </div>
          <input
            type="checkbox"
            checked={settings.payoutAlerts}
            onChange={(e) => setSettings(prev => ({ ...prev, payoutAlerts: e.target.checked }))}
            className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t('marketingEmailsLabel')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('marketingEmailsDesc')}</p>
          </div>
          <input
            type="checkbox"
            checked={settings.marketingEmails}
            onChange={(e) => setSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
            className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
          />
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onSave('notifications')}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-5 h-5" />
          {isSaving ? t('saving') : t('savePreferences')}
        </button>
      </div>
    </div>
  )
}
