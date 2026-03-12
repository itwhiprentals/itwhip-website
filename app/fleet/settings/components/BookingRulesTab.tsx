'use client'

interface BookingRulesTabProps {
  settings: any
  handleChange: (field: string, value: string | number | boolean) => void
}

export default function BookingRulesTab({ settings, handleChange }: BookingRulesTabProps) {
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
  const labelClass = 'block text-sm text-gray-600 dark:text-gray-400 mb-1'
  const hintClass = 'text-xs text-gray-400 mt-1'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Booking Time Rules</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Platform-wide minimums and defaults for advance notice and trip buffers.
        </p>
      </div>

      {/* Platform Minimums */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Platform Minimums</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Hard floors — hosts cannot set values below these.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Advance Notice (hours)</label>
            <input
              type="number"
              min={1}
              max={72}
              defaultValue={settings?.booking?.platformMinAdvanceNotice ?? 1}
              onChange={(e) => handleChange('platformMinAdvanceNotice', e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>Guests cannot book less than this many hours before pickup.</p>
          </div>
          <div>
            <label className={labelClass}>Min Trip Buffer (hours)</label>
            <input
              type="number"
              min={1}
              max={24}
              defaultValue={settings?.booking?.platformMinTripBuffer ?? 2}
              onChange={(e) => handleChange('platformMinTripBuffer', e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>Minimum gap required between trips regardless of host setting.</p>
          </div>
        </div>
      </div>

      {/* New Car Defaults */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">New Car Defaults</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Applied when a host creates a new car and has no custom fleet defaults set.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Default Advance Notice (hours)</label>
            <input
              type="number"
              min={1}
              max={72}
              defaultValue={settings?.booking?.defaultAdvanceNotice ?? 2}
              onChange={(e) => handleChange('defaultAdvanceNotice', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Default Trip Buffer (hours)</label>
            <input
              type="number"
              min={1}
              max={24}
              defaultValue={settings?.booking?.defaultTripBuffer ?? 3}
              onChange={(e) => handleChange('defaultTripBuffer', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
