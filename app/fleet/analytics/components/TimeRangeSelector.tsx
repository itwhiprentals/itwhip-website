// app/fleet/analytics/components/TimeRangeSelector.tsx
// Time range filter for analytics dashboard

'use client'

interface TimeRangeSelectorProps {
  value: string
  onChange: (range: string) => void
}

const ranges = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' }
]

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all
            ${value === range.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
