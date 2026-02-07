// app/help/choe/components/ChoeTips.tsx
'use client'

import { tips } from '../data/tips'
import { IoSparklesOutline } from 'react-icons/io5'

export function ChoeTips() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            <IoSparklesOutline className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 dark:text-violet-400" />
            Tips for Best Results
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Get the most out of your conversations with Choé
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div
              key={tip.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {tip.description}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-mono truncate">
                      {tip.example}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
