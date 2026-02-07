// app/help/choe/components/ChoeHowItWorks.tsx
'use client'

import Image from 'next/image'
import { workflowSteps } from '../data/workflow'

export function ChoeHowItWorks() {
  return (
    <section className="pt-0 pb-10 sm:pb-14 bg-white dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-300 dark:border-[#222]">
      {/* Subtle accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#e87040]/5 rounded-full blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <Image src="/images/choe-logo.png" alt="Choé" width={300} height={87} className="h-[90px] w-auto mx-auto -mb-5" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            How Choé Works
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8]">
            From &quot;I need a car&quot; to &quot;You&apos;re booked&quot; in 7 simple steps
          </p>
        </div>

        {/* Horizontal flow on desktop, vertical on mobile */}
        <div className="relative">
          {/* Desktop: Horizontal connection line */}
          <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5">
            <div className="h-full bg-gradient-to-r from-[#c94c24] via-[#e87040] to-[#d4a574]" />
          </div>

          {/* Mobile: Vertical connection line */}
          <div className="lg:hidden absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#c94c24] via-[#e87040] to-[#d4a574]" />

          {/* Steps grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.step}
                className="relative choe-animate-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Desktop card */}
                <div className="hidden lg:flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div className="relative mb-4">
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center border-2 transition-all hover:scale-110 bg-white dark:bg-[#1a1a1a] hover:shadow-lg"
                      style={{ borderColor: `hsl(${20 + index * 5}, 70%, ${55 - index * 3}%)` }}
                    >
                      <step.icon
                        className="w-8 h-8"
                        style={{ color: `hsl(${20 + index * 5}, 70%, ${55 - index * 3}%)` }}
                      />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-7 h-7 text-xs font-bold rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: `hsl(${20 + index * 5}, 70%, ${55 - index * 3}%)` }}
                    >
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#666] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mobile card */}
                <div className="lg:hidden flex items-start gap-4 pl-2">
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0 z-10">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center bg-white dark:bg-[#1a1a1a] border-2"
                      style={{ borderColor: `hsl(${20 + index * 5}, 70%, ${55 - index * 3}%)` }}
                    >
                      <step.icon
                        className="w-5 h-5"
                        style={{ color: `hsl(${20 + index * 5}, 70%, ${55 - index * 3}%)` }}
                      />
                    </div>
                    <span
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-bold rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: `hsl(${20 + index * 5}, 70%, ${55 - index * 3}%)` }}
                    >
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-gray-300 dark:border-[#333]">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#a8a8a8] mb-2">
                      {step.description}
                    </p>
                    {step.example && (
                      <div className="bg-gray-50 dark:bg-[#252525] rounded-lg px-3 py-2 border border-gray-300 dark:border-[#333]">
                        <code className="text-xs text-[#e87040] font-mono">
                          {step.example}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
