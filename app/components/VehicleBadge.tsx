// app/components/VehicleBadge.tsx
'use client'

interface VehicleBadgeProps {
  label: string
  className?: string
}

/**
 * Vehicle classification badge component
 * Displays vehicle class (Economy, Standard, Premium, Luxury, Sport, Exotic)
 * or fuel type (Gas, Hybrid, Electric, Diesel) with consistent styling
 */
export default function VehicleBadge({ label, className = '' }: VehicleBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-1
        text-xs font-medium
        border border-gray-300 dark:border-gray-600
        rounded
        text-gray-700 dark:text-gray-300
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {label}
    </span>
  )
}
