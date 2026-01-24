// app/fleet/monitoring/components/AlertSettingsModal.tsx
// Modal for configuring alert notification settings

'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoMailOutline,
  IoLogoSlack,
  IoPhonePortraitOutline,
  IoGlobeOutline,
  IoSaveOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface AlertSettings {
  emailEnabled: boolean
  emailRecipients: string
  slackEnabled: boolean
  slackWebhook: string
  smsEnabled: boolean
  smsRecipients: string
  webhookEnabled: boolean
  webhookUrl: string
  severityThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  silenceUntil: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave?: (settings: AlertSettings) => Promise<void>
}

const defaultSettings: AlertSettings = {
  emailEnabled: false,
  emailRecipients: '',
  slackEnabled: false,
  slackWebhook: '',
  smsEnabled: false,
  smsRecipients: '',
  webhookEnabled: false,
  webhookUrl: '',
  severityThreshold: 'MEDIUM',
  silenceUntil: null
}

export default function AlertSettingsModal({ isOpen, onClose, onSave }: Props) {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'channels' | 'thresholds' | 'silence'>('channels')

  // Load settings from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('alertSettings')
      if (stored) {
        try {
          setSettings(JSON.parse(stored))
        } catch {
          // Use defaults
        }
      }
    }
  }, [isOpen])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      // Save to localStorage
      localStorage.setItem('alertSettings', JSON.stringify(settings))

      // Call onSave callback if provided (for server-side persistence)
      if (onSave) {
        await onSave(settings)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleSilence = (hours: number) => {
    const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    setSettings(prev => ({ ...prev, silenceUntil: until }))
  }

  const clearSilence = () => {
    setSettings(prev => ({ ...prev, silenceUntil: null }))
  }

  if (!isOpen) return null

  const isSilenced = settings.silenceUntil && new Date(settings.silenceUntil) > new Date()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alert Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700">
          {[
            { id: 'channels', label: 'Channels' },
            { id: 'thresholds', label: 'Thresholds' },
            { id: 'silence', label: 'Silence' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              {/* Email */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IoMailOutline className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Email</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                {settings.emailEnabled && (
                  <input
                    type="text"
                    placeholder="email1@example.com, email2@example.com"
                    value={settings.emailRecipients}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailRecipients: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Slack */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IoLogoSlack className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Slack</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.slackEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, slackEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                {settings.slackEnabled && (
                  <input
                    type="text"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.slackWebhook}
                    onChange={(e) => setSettings(prev => ({ ...prev, slackWebhook: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* SMS */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IoPhonePortraitOutline className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900 dark:text-white">SMS</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                {settings.smsEnabled && (
                  <input
                    type="text"
                    placeholder="+1234567890, +0987654321"
                    value={settings.smsRecipients}
                    onChange={(e) => setSettings(prev => ({ ...prev, smsRecipients: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Webhook */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IoGlobeOutline className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Webhook</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.webhookEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, webhookEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                {settings.webhookEnabled && (
                  <input
                    type="text"
                    placeholder="https://your-webhook-url.com/alerts"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          )}

          {/* Thresholds Tab */}
          {activeTab === 'thresholds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Minimum Severity to Notify
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setSettings(prev => ({ ...prev, severityThreshold: level }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        settings.severityThreshold === level
                          ? level === 'CRITICAL'
                            ? 'bg-red-500 text-white'
                            : level === 'HIGH'
                            ? 'bg-orange-500 text-white'
                            : level === 'MEDIUM'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  You will only receive notifications for alerts at or above this severity level.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Severity Levels</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li><span className="font-medium">CRITICAL:</span> System down, data loss risk</li>
                      <li><span className="font-medium">HIGH:</span> Major feature broken, security threat</li>
                      <li><span className="font-medium">MEDIUM:</span> Degraded performance, minor issues</li>
                      <li><span className="font-medium">LOW:</span> Informational, minor anomalies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Silence Tab */}
          {activeTab === 'silence' && (
            <div className="space-y-4">
              {isSilenced ? (
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <IoWarningOutline className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Alerts Silenced
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Until {new Date(settings.silenceUntil!).toLocaleString()}
                      </p>
                      <button
                        onClick={clearSilence}
                        className="mt-3 px-3 py-1.5 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Resume Alerts
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Temporarily silence all alerts
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSilence(1)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      1 Hour
                    </button>
                    <button
                      onClick={() => handleSilence(4)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      4 Hours
                    </button>
                    <button
                      onClick={() => handleSilence(8)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      8 Hours
                    </button>
                    <button
                      onClick={() => handleSilence(24)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      24 Hours
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Silencing stops notifications but still records alerts.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saved ? (
              <>
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                Saved!
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
