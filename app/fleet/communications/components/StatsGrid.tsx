'use client'

interface StatsGridProps {
  tab: 'sms' | 'calls'
  stats: Record<string, any>
}

export function StatsGrid({ tab, stats }: StatsGridProps) {
  if (tab === 'sms') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <StatCard label="Total SMS" value={stats.totalSms || 0} />
        <StatCard label="Delivered" value={stats.delivered || 0} color="green" />
        <StatCard label="Failed" value={stats.failed || 0} color="red" />
        <StatCard label="Inbound" value={stats.inbound || 0} color="purple" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-4">
      <StatCard label="Total Calls" value={stats.totalCalls || 0} />
      <StatCard label="Voicemails" value={stats.withVoicemail || 0} color="purple" />
      <StatCard label="Avg Duration" value={`${stats.avgDuration || 0}s`} color="blue" />
    </div>
  )
}

const COLOR_CLASSES: Record<string, string> = {
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 ${color ? COLOR_CLASSES[color] : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}
