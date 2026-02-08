// app/fleet/choe/components/StatCard.tsx

'use client'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  highlight?: boolean
}

export default function StatCard({ label, value, subtext, trend, highlight }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
      )}
    </div>
  )
}
