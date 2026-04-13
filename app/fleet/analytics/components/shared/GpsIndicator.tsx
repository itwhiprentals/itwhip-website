// app/fleet/analytics/components/shared/GpsIndicator.tsx
// GPS accuracy badge — shows precision level

'use client'

interface GpsIndicatorProps {
  accuracy: number | null // meters
}

export default function GpsIndicator({ accuracy }: GpsIndicatorProps) {
  if (accuracy == null) return null

  const rounded = Math.round(accuracy)
  let color: string
  let label: string

  if (rounded <= 50) {
    color = 'bg-green-100 text-green-700'
    label = `±${rounded}m`
  } else if (rounded <= 100) {
    color = 'bg-green-100 text-green-600'
    label = `±${rounded}m`
  } else if (rounded <= 500) {
    color = 'bg-yellow-100 text-yellow-700'
    label = `±${rounded}m`
  } else {
    color = 'bg-orange-100 text-orange-700'
    label = `±${(rounded / 1000).toFixed(1)}km`
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${color}`}>
      GPS {label}
    </span>
  )
}
