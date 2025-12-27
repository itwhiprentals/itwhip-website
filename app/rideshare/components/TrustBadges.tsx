// app/rideshare/components/TrustBadges.tsx
// Horizontal row of trust badges (BBB, Insurance, Awards, etc.)

'use client'

import Image from 'next/image'

interface Badge {
  name: string
  imageUrl: string
}

interface TrustBadgesProps {
  badges?: Badge[] | null
}

export default function TrustBadges({ badges }: TrustBadgesProps) {
  // Don't render if no badges
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-4 uppercase tracking-wider">
        Trusted & Verified By
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 group"
            title={badge.name}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-md transition-shadow flex items-center justify-center">
              <Image
                src={badge.imageUrl}
                alt={badge.name}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[80px] truncate">
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
