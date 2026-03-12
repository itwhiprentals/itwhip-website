// app/partner/settings/components/AvailabilityTab.tsx
// Fleet-wide availability defaults — apply to new cars automatically

import { ADVANCE_NOTICE_OPTIONS, TRIP_BUFFER_OPTIONS } from '@/app/lib/booking/booking-time-rules'

interface AvailabilityTabProps {
  settings: {
    defaultInstantBook: boolean
    defaultAdvanceNotice: number
    defaultTripBuffer: number
    defaultAllow24HourPickup: boolean
  }
  setSettings: (fn: (prev: any) => any) => void
  onSave: (section: string) => void
  isSaving: boolean
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
          checked ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function AvailabilityTab({ settings, setSettings, onSave, isSaving }: AvailabilityTabProps) {
  const update = (field: string, value: any) => setSettings((prev: any) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Availability Defaults</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          These settings apply automatically to new vehicles added to your fleet. Existing cars keep their current settings.
        </p>
      </div>

      {/* Booking Approval */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 divide-y divide-gray-200 dark:divide-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Booking Approval</h3>
        <Toggle
          checked={settings.defaultInstantBook}
          onChange={(v) => update('defaultInstantBook', v)}
          label="Instant Book by Default"
          description="New cars allow guests to book without approval. Best for lockbox/keyless setups."
        />
      </div>

      {/* Timing */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timing Defaults</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Advance Notice</label>
            <select
              value={settings.defaultAdvanceNotice}
              onChange={(e) => update('defaultAdvanceNotice', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {ADVANCE_NOTICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum notice before pickup. Shorter = more bookings.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Trip Buffer</label>
            <select
              value={settings.defaultTripBuffer}
              onChange={(e) => update('defaultTripBuffer', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {TRIP_BUFFER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cleanup time between trips. Minimum 2 hours platform-wide.</p>
          </div>
        </div>
      </div>

      {/* Pickup Hours */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 divide-y divide-gray-200 dark:divide-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Pickup Hours</h3>
        <Toggle
          checked={settings.defaultAllow24HourPickup}
          onChange={(v) => update('defaultAllow24HourPickup', v)}
          label="Allow 24-Hour Pickup by Default"
          description="Default: 5AM–10PM only. Enable for any-time pickup including overnight (lockbox vehicles)."
        />
      </div>

      <button
        onClick={() => onSave('availability')}
        disabled={isSaving}
        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {isSaving ? 'Saving…' : 'Save Availability Defaults'}
      </button>
    </div>
  )
}
