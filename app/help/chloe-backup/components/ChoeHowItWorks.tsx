// app/help/chloe/components/ChoeHowItWorks.tsx
'use client'

import { workflowSteps } from '../data/workflow'

export function ChoeHowItWorks() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How Choé Works
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            From &quot;I need a car&quot; to &quot;You&apos;re booked&quot; in 7 simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-6 sm:left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-violet-500 via-purple-500 to-violet-500 hidden sm:block" />

          <div className="space-y-4 sm:space-y-5">
            {workflowSteps.map((step, index) => (
              <div
                key={step.step}
                className="relative bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Step Number & Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-gray-800 text-violet-600 text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-violet-500">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {step.description}
                    </p>
                    {step.example && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 font-mono">
                          {step.example}
                        </p>
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
