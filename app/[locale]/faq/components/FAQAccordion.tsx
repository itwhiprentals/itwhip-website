// app/faq/components/FAQAccordion.tsx
'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { IoChevronDownOutline, IoArrowForwardOutline } from 'react-icons/io5'

interface FAQItem {
  id: string
  question: string
  answer: string
  link?: {
    text: string
    href: string
  }
}

interface FAQAccordionProps {
  item: FAQItem
}

export default function FAQAccordion({ item }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-4">
          {item.question}
        </h3>
        <IoChevronDownOutline 
          className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        id={`faq-answer-${item.id}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-4">
            {item.answer}
          </p>
          
          {item.link && (
            <Link
              href={item.link.href}
              className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              {item.link.text}
              <IoArrowForwardOutline className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}