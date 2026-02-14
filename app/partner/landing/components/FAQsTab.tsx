// app/partner/landing/components/FAQsTab.tsx
// FAQ management tab

'use client'

import { useTranslations } from 'next-intl'
import { IoSaveOutline, IoAddCircleOutline, IoTrashOutline } from 'react-icons/io5'
import { LandingPageData, FAQ } from './types'

interface FAQsTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

export default function FAQsTab({ data, onChange, onSave, isSaving }: FAQsTabProps) {
  const t = useTranslations('PartnerLanding')

  const addFAQ = () => {
    onChange({
      faqs: [
        ...data.faqs,
        { id: Date.now().toString(), question: '', answer: '' }
      ]
    })
  }

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    onChange({
      faqs: data.faqs.map(faq =>
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    })
  }

  const removeFAQ = (id: string) => {
    onChange({
      faqs: data.faqs.filter(faq => faq.id !== id)
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('frequentlyAskedQuestions')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('faqDescription')}
          </p>
        </div>
        <button
          onClick={addFAQ}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
        >
          <IoAddCircleOutline className="w-5 h-5" />
          {t('addFaq')}
        </button>
      </div>

      {data.faqs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('noFaqsYet')}
          </p>
          <button
            onClick={addFAQ}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <IoAddCircleOutline className="w-5 h-5" />
            {t('addYourFirstFaq')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full flex-shrink-0">
                  {index + 1}
                </span>
                <button
                  onClick={() => removeFAQ(faq.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('question')}
                </label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                  placeholder={t('questionPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('answer')}
                </label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                  rows={3}
                  placeholder={t('answerPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-4 h-4" />
          {isSaving ? t('saving') : t('saveFaqs')}
        </button>
      </div>
    </div>
  )
}
