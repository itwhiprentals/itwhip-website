// app/rideshare/components/FAQAccordion.tsx
// Collapsible FAQ accordion

'use client'

import { useState } from 'react'
import { IoChevronDownOutline, IoHelpCircleOutline } from 'react-icons/io5'
import { useEditMode } from '../[partnerSlug]/EditModeContext'

interface FAQ {
  id: string
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQ[]
  title?: string
}

export default function FAQAccordion({ faqs, title = 'Frequently Asked Questions' }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const { isEditMode: contextEditMode, data: contextData } = useEditMode()

  // Use context data when in edit mode for real-time updates
  const effectiveFaqs = contextEditMode && contextData?.faqs
    ? contextData.faqs.map((faq, index) => ({ ...faq, id: faq.id || `faq-${index}` }))
    : faqs

  if (effectiveFaqs.length === 0) return null

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <IoHelpCircleOutline className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className="space-y-3">
        {effectiveFaqs.map((faq) => {
          const isOpen = openId === faq.id

          return (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <IoChevronDownOutline
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
