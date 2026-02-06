// app/help/chloe/components/ChoeTips.tsx
'use client'

import { tips } from '../data/tips'
import { IoSparklesOutline } from 'react-icons/io5'

// Warm colors for sticky-note style
const warmColors = [
  { bg: 'bg-[#e87040]/10', border: 'border-[#e87040]/20', icon: 'text-[#e87040]' },
  { bg: 'bg-[#ff7f50]/10', border: 'border-[#ff7f50]/20', icon: 'text-[#ff7f50]' },
  { bg: 'bg-[#d4a574]/10', border: 'border-[#d4a574]/20', icon: 'text-[#d4a574]' },
  { bg: 'bg-[#c94c24]/10', border: 'border-[#c94c24]/20', icon: 'text-[#c94c24]' },
  { bg: 'bg-[#e87040]/10', border: 'border-[#e87040]/20', icon: 'text-[#e87040]' },
  { bg: 'bg-[#ff7f50]/10', border: 'border-[#ff7f50]/20', icon: 'text-[#ff7f50]' },
]

export function ChoeTips() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-200 dark:border-[#222]">
      {/* Warm ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#d4a574]/5 dark:bg-[#d4a574]/5 rounded-full blur-[100px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-[#e87040]/20 to-[#d4a574]/20 border border-[#e87040]/20 mb-4">
            <IoSparklesOutline className="w-8 h-8 text-[#e87040]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Tips for Best Results
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8]">
            Get the most out of your conversations with Choé
          </p>
        </div>

        {/* Tips grid - warm sticky-note style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, index) => {
            const colors = warmColors[index % warmColors.length]
            return (
              <div
                key={tip.id}
                className={`group ${colors.bg} rounded-lg p-5 border ${colors.border} hover:border-[#e87040]/40 transition-all choe-animate-in`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white dark:bg-[#1a1a1a]`}>
                    <tip.icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#a8a8a8] mb-3 leading-relaxed">
                      {tip.description}
                    </p>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg px-3 py-2 border border-gray-200 dark:border-[#333]">
                      <code className="text-xs text-[#e87040] font-mono line-clamp-1">
                        {tip.example}
                      </code>
                    </div>
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
