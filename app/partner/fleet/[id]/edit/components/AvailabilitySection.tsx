// app/partner/fleet/[id]/edit/components/AvailabilitySection.tsx
// THREE independent groups: Booking Approval | Timing | Pickup Hours
// No dependencies between groups — toggling one NEVER changes another.

import { ADVANCE_NOTICE_OPTIONS, TRIP_BUFFER_OPTIONS } from '@/app/lib/booking/booking-time-rules'

// Generate HH:MM options for check-in/check-out time dropdowns
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  const value = `${hour.toString().padStart(2, '0')}:${minute}`
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const ampm = hour < 12 ? 'AM' : 'PM'
  const label = `${h12}:${minute} ${ampm}`
  return { value, label }
})

interface AvailabilitySectionProps {
  vehicleType: 'RENTAL' | 'RIDESHARE'
  instantBook: boolean
  advanceNotice: number
  tripBuffer: number
  allow24HourPickup: boolean
  checkInTime: string | null
  checkOutTime: string | null
  onChange: (field: string, value: any) => void
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function AvailabilitySection({
  vehicleType,
  instantBook,
  advanceNotice,
  tripBuffer,
  allow24HourPickup,
  checkInTime,
  checkOutTime,
  onChange,
}: AvailabilitySectionProps) {
  return (
    <div className="space-y-4">

      {/* ─── Group 1: Booking Approval ─── */}
      {vehicleType !== 'RIDESHARE' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Booking Approval</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Instant Book</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Guests book without host approval. Best for lockbox/keyless vehicles.
              </p>
            </div>
            <Toggle checked={instantBook} onChange={(v) => onChange('instantBook', v)} />
          </div>
        </div>
      )}

      {/* ─── Group 2: Timing ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Timing</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Advance Notice
            </label>
            <select
              value={advanceNotice}
              onChange={(e) => onChange('advanceNotice', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              {ADVANCE_NOTICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">How far ahead must guests book before pickup? Shorter = more bookings.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trip Buffer
            </label>
            <select
              value={tripBuffer}
              onChange={(e) => onChange('tripBuffer', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              {TRIP_BUFFER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time needed between trips to clean and prep. Minimum 2 hours.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Trip Duration
            </label>
          </div>
          {/* Min/max trip duration stays in parent — not duplicated here */}
        </div>
      </div>

      {/* ─── Group 3: Pickup Hours ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Pickup Hours</h4>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Allow 24-Hour Pickup</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Default: 5AM–10PM only. Enable for any-time pickup (overnight capable).
            </p>
          </div>
          <Toggle checked={allow24HourPickup} onChange={(v) => onChange('allow24HourPickup', v)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Pickup Time
            </label>
            <select
              value={checkInTime || '10:00'}
              onChange={(e) => onChange('checkInTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Return Time
            </label>
            <select
              value={checkOutTime || '10:00'}
              onChange={(e) => onChange('checkOutTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
