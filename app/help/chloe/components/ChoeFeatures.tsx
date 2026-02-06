// app/help/chloe/components/ChoeFeatures.tsx
'use client'

import { features } from '../data/features'

// Arizona desert warm color palette
const warmAccents = [
  '#e87040', // sunset orange
  '#ff7f50', // coral
  '#d4a574', // desert gold
  '#c94c24', // terracotta
  '#e87040',
  '#ff7f50',
  '#d4a574',
  '#c94c24',
]

export function ChoeFeatures() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative border-t border-gray-300 dark:border-[#222]">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Smart Features
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8]">
            What makes Choé more than just a search box
          </p>
        </div>

        {/* Features Grid - All cards same layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const accentColor = warmAccents[index % warmAccents.length]

            return (
              <div
                key={feature.id}
                className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-5 sm:p-6 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#e87040]/10 dark:hover:shadow-[#e87040]/5 choe-animate-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <feature.icon
                      className="w-7 h-7"
                      style={{ color: accentColor }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#a8a8a8] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
