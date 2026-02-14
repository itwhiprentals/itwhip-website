// app/help/choe/components/ChoeFAQs.tsx
'use client'

import { faqs } from '../data/faqs'
import { IoHelpCircleOutline, IoChevronForwardOutline } from 'react-icons/io5'

export function ChoeFAQs() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            <IoHelpCircleOutline className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 dark:text-violet-400" />
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Common questions about Choé
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer text-sm sm:text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="pr-4">{faq.question}</span>
                <IoChevronForwardOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
