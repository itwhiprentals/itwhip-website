// app/fleet/choe/components/FunnelStep.tsx

'use client'

interface FunnelStepProps {
  label: string
  value: number
  percentage: number
  highlight?: boolean
}

export default function FunnelStep({ label, value, percentage, highlight }: FunnelStepProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
        <div
          className={`h-full ${highlight ? 'bg-purple-500' : 'bg-blue-500'} transition-all`}
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {value.toLocaleString()} ({percentage}%)
        </span>
      </div>
    </div>
  )
}
