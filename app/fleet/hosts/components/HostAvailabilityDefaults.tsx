interface HostAvailabilityDefaultsProps {
  defaultInstantBook?: boolean
  defaultAdvanceNotice?: number
  defaultTripBuffer?: number
  defaultAllow24HourPickup?: boolean
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

export default function HostAvailabilityDefaults({
  defaultInstantBook,
  defaultAdvanceNotice,
  defaultTripBuffer,
  defaultAllow24HourPickup,
}: HostAvailabilityDefaultsProps) {
  const hasDefaults =
    defaultInstantBook !== undefined ||
    defaultAdvanceNotice !== undefined ||
    defaultTripBuffer !== undefined ||
    defaultAllow24HourPickup !== undefined

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Fleet Availability Defaults</h3>
      <p className="text-xs text-gray-400 mb-3">Applied to new cars created by this host.</p>
      {hasDefaults ? (
        <>
          <Row
            label="Instant Book"
            value={
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${(defaultInstantBook ?? true) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                {(defaultInstantBook ?? true) ? 'Enabled' : 'Disabled'}
              </span>
            }
          />
          <Row label="Advance Notice" value={`${defaultAdvanceNotice ?? 2} hours`} />
          <Row label="Trip Buffer" value={`${defaultTripBuffer ?? 3} hours`} />
          <Row
            label="Pickup Hours"
            value={defaultAllow24HourPickup ? '24 hours' : '5:00 AM – 10:00 PM'}
          />
        </>
      ) : (
        <p className="text-sm text-gray-400">Using platform defaults.</p>
      )}
    </div>
  )
}
