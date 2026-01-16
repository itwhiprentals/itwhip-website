// app/partner/tracking/demo/components/feature-demos/shared/ProviderBadges.tsx
'use client'

interface ProviderBadgesProps {
  providers: string[]
  label?: string
  className?: string
}

export default function ProviderBadges({ providers, label = 'Available on:', className = '' }: ProviderBadgesProps) {
  return (
    <div className={`text-sm text-gray-400 ${className}`}>
      <p className="font-semibold text-white mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map(provider => (
          <span
            key={provider}
            className="px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300 border border-gray-600"
          >
            {provider}
          </span>
        ))}
      </div>
    </div>
  )
}
