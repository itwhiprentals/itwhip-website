// app/fleet/verifications/components/StatBox.tsx
'use client'

interface StatBoxProps {
  label: string
  value: number
  color: string
}

export default function StatBox({ label, value, color }: StatBoxProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
