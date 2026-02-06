// app/help/chloe/components/ChoeFAQs.tsx
'use client'

import { faqs } from '../data/faqs'
import { IoHelpCircleOutline, IoChevronDownOutline } from 'react-icons/io5'

export function ChoeFAQs() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative border-t border-gray-200 dark:border-[#222]">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] mb-4">
            <IoHelpCircleOutline className="w-8 h-8 text-[#e87040]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8]">
            Common questions about Choé
          </p>
        </div>

        {/* FAQ accordion - sleek expandable cards */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#333] overflow-hidden hover:border-[#e87040]/30 transition-colors choe-animate-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white pr-4 group-hover:text-[#e87040] transition-colors">
                  {faq.question}
                </span>
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e87040]/10 transition-colors">
                  <IoChevronDownOutline className="w-4 h-4 text-gray-500 dark:text-[#666] group-open:rotate-180 group-hover:text-[#e87040] transition-all" />
                </div>
              </summary>
              <div className="px-5 pb-5 border-t border-gray-200 dark:border-[#333]">
                <p className="text-sm text-gray-600 dark:text-[#a8a8a8] leading-relaxed pt-4">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
