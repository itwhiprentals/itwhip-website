// app/partner/tracking/demo/components/feature-demos/shared/ProviderBadges.tsx
'use client'

// Primary providers that power ItWhip+ (yellow highlight)
const PRIMARY_PROVIDERS = ['Bouncie', 'Smartcar']

// Provider type indicators
const PROVIDER_TYPES: Record<string, string> = {
  'Bouncie': 'OBD',
  'Smartcar': 'API',
  'Zubie': 'OBD',
  'MooveTrax': 'GPS',
  'Trackimo': 'GPS',
  'ItWhip+': '★'
}

interface ProviderBadgesProps {
  providers: string[]
  label?: string
  className?: string
}

export default function ProviderBadges({ providers, label = 'Powered by:', className = '' }: ProviderBadgesProps) {
  // Check if this is ItWhip+ exclusive
  const isItWhipPlusExclusive = providers.length === 1 && providers[0] === 'ItWhip+'

  return (
    <div className={`text-sm text-gray-400 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-white">{label}</p>
        {/* ItWhip+™ branding badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded text-[10px] font-bold text-white shadow-sm">
          ItWhip+<sup className="text-[8px]">™</sup>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.map(provider => {
          const isPrimary = PRIMARY_PROVIDERS.includes(provider)
          const isItWhipPlus = provider === 'ItWhip+'
          const providerType = PROVIDER_TYPES[provider]

          return (
            <span
              key={provider}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                isItWhipPlus
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-2 border-amber-500'
                  : isPrimary
                  ? 'bg-amber-500/10 text-amber-300 border-2 border-amber-400/60'
                  : 'bg-gray-700 text-gray-300 border border-gray-600'
              }`}
            >
              {providerType && (
                <span className={`text-[9px] px-1 py-0.5 rounded ${
                  isItWhipPlus
                    ? 'bg-amber-500/30 text-amber-300'
                    : isPrimary
                    ? 'bg-amber-400/20 text-amber-400'
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  {providerType}
                </span>
              )}
              {provider}
              {isPrimary && !isItWhipPlus && (
                <span className="text-[8px] text-amber-400">★</span>
              )}
            </span>
          )
        })}
      </div>
      {/* ItWhip+ explanation for features using multiple providers */}
      {!isItWhipPlusExclusive && providers.some(p => PRIMARY_PROVIDERS.includes(p)) && (
        <p className="text-[10px] text-amber-400/80 mt-2 flex items-center gap-1">
          <span className="text-amber-400">★</span>
          Primary ItWhip+ providers (OBD + API = Unified Dashboard)
        </p>
      )}
      {isItWhipPlusExclusive && (
        <p className="text-[10px] text-amber-400/80 mt-2">
          Exclusive feature • Requires Bouncie + Smartcar
        </p>
      )}
    </div>
  )
}
