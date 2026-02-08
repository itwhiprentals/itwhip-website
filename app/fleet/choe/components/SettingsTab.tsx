// app/fleet/choe/components/SettingsTab.tsx

'use client'

import type { ChoeAISettings } from '../types'
import { MODEL_OPTIONS } from '../constants'
import { ToggleSetting, ToggleSettingCard, FeatureCard } from './Toggle'
import SettingsSection from './SettingsSection'

interface SettingsTabProps {
  settings: ChoeAISettings
  editingSettings: Partial<ChoeAISettings>
  onChange: (key: keyof ChoeAISettings, value: unknown) => void
  onSave: () => void
  saving: boolean
}

export default function SettingsTab({ settings, editingSettings, onChange, onSave, saving }: SettingsTabProps) {
  const getValue = <K extends keyof ChoeAISettings>(key: K): ChoeAISettings[K] => {
    return key in editingSettings ? editingSettings[key] as ChoeAISettings[K] : settings[key]
  }

  // Safe accessor for number inputs — converts null/undefined to empty string to avoid React NaN warning
  const getNum = (key: keyof ChoeAISettings): number | string => {
    const v = getValue(key)
    if (v == null) return ''
    const n = Number(v)
    return isNaN(n) ? '' : n
  }

  const safeInt = (v: string) => { const n = parseInt(v); return isNaN(n) ? null : n }
  const safeFloat = (v: string) => { const n = parseFloat(v); return isNaN(n) ? null : n }

  const hasChanges = Object.keys(editingSettings).length > 0

  return (
    <div className="space-y-6">
      {/* Model Settings */}
      <SettingsSection title="Model Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
            <select
              value={getValue('modelId')}
              onChange={e => onChange('modelId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens</label>
            <input
              type="number"
              value={getNum('maxTokens')}
              onChange={e => onChange('maxTokens', safeInt(e.target.value))}
              min={256}
              max={4096}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperature</label>
            <input
              type="number"
              step={0.1}
              value={getNum('temperature')}
              onChange={e => onChange('temperature', safeFloat(e.target.value))}
              min={0}
              max={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Rate Limits */}
      <SettingsSection title="Rate Limits">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Messages per Window</label>
            <input
              type="number"
              value={getNum('messagesPerWindow')}
              onChange={e => onChange('messagesPerWindow', safeInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Window (minutes)</label>
            <input
              type="number"
              value={getNum('rateLimitWindowMins')}
              onChange={e => onChange('rateLimitWindowMins', safeInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily API Limit</label>
            <input
              type="number"
              value={getNum('dailyApiLimit')}
              onChange={e => onChange('dailyApiLimit', safeInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Limit</label>
            <input
              type="number"
              value={getNum('sessionMessageLimit')}
              onChange={e => onChange('sessionMessageLimit', safeInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Feature Flags */}
      <SettingsSection title="Feature Flags">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ToggleSetting
            label="Enabled"
            checked={getValue('enabled')}
            onChange={v => onChange('enabled', v)}
          />
          <ToggleSetting
            label="Weather"
            checked={getValue('weatherEnabled')}
            onChange={v => onChange('weatherEnabled', v)}
          />
          <ToggleSetting
            label="Risk Assessment"
            checked={getValue('riskAssessmentEnabled')}
            onChange={v => onChange('riskAssessmentEnabled', v)}
          />
          <ToggleSetting
            label="Anonymous Access"
            checked={getValue('anonymousAccessEnabled')}
            onChange={v => onChange('anonymousAccessEnabled', v)}
          />
        </div>
      </SettingsSection>

      {/* Advanced AI Features */}
      <SettingsSection title="Advanced AI Features">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Control streaming responses, tool use, and other advanced AI capabilities.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ToggleSettingCard
            label="Streaming"
            description="Real-time text streaming via SSE"
            checked={getValue('streamingEnabled')}
            onChange={v => onChange('streamingEnabled', v)}
          />
          <ToggleSettingCard
            label="Tool Use"
            description="Function calling for search & actions"
            checked={getValue('toolUseEnabled')}
            onChange={v => onChange('toolUseEnabled', v)}
            color="blue"
          />
          <ToggleSettingCard
            label="Extended Thinking"
            description="Deep reasoning for complex queries"
            checked={getValue('extendedThinkingEnabled')}
            onChange={v => onChange('extendedThinkingEnabled', v)}
            color="green"
          />
          <ToggleSettingCard
            label="Batch Analytics"
            description="50% cost reduction for bulk processing"
            checked={getValue('batchAnalyticsEnabled')}
            onChange={v => onChange('batchAnalyticsEnabled', v)}
            color="orange"
          />
        </div>
      </SettingsSection>

      {/* Vehicle Type Preferences */}
      <SettingsSection title="Vehicle Type Preferences">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Configure how Choé handles different vehicle types in search results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            title="Rideshare"
            description="For Uber, DoorDash, Instacart drivers. Weekly/monthly rentals with mileage packages."
            indicatorColor="orange"
            toggleLabel="Prioritize in results"
            checked={getValue('preferRideshare')}
            onChange={v => onChange('preferRideshare', v)}
          />
          <FeatureCard
            title="Rental (Instant)"
            description="Traditional peer-to-peer rentals. Daily/weekend rentals with standard pricing."
            indicatorColor="emerald"
            toggleLabel="Show type badges"
            checked={getValue('showVehicleTypeBadges')}
            onChange={v => onChange('showVehicleTypeBadges', v)}
          />
          <FeatureCard
            title="No Deposit"
            description="Highlight vehicles with no security deposit for budget-conscious renters."
            indicatorColor="blue"
            toggleLabel="Prioritize no-deposit"
            checked={getValue('preferNoDeposit')}
            onChange={v => onChange('preferNoDeposit', v)}
          />
        </div>
      </SettingsSection>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
