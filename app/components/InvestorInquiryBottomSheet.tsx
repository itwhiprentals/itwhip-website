// app/components/InvestorInquiryBottomSheet.tsx
'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { IoCloseOutline, IoCheckmarkCircle } from 'react-icons/io5'

interface InvestorFormData {
  name: string
  email: string
  firm: string
  message: string
  investmentSize: string
}

interface InvestorInquiryBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function InvestorInquiryBottomSheet({ isOpen, onClose }: InvestorInquiryBottomSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    email: '',
    firm: '',
    message: '',
    investmentSize: ''
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', firm: '', message: '', investmentSize: '' })
        setTimeout(() => {
          onClose()
          setSubmitStatus('idle')
        }, 2500)
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      // Reset form state after close animation
      setTimeout(() => {
        setSubmitStatus('idle')
        setFormData({ name: '', email: '', firm: '', message: '', investmentSize: '' })
      }, 300)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          {/* Mobile: bottom sheet, Desktop: centered modal */}
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all max-h-[75vh] flex flex-col">
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                    Investor Inquiry
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    <IoCloseOutline className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-5">
                  {submitStatus === 'success' ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IoCheckmarkCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Thank You!
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We&apos;ve received your inquiry. Check your email for confirmation.
                      </p>
                    </div>
                  ) : (
                    <>
                      {submitStatus === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-700 dark:text-red-400">
                            Something went wrong. Please try again or email us directly at info@itwhip.com
                          </p>
                        </div>
                      )}

                      <form id="investor-form" onSubmit={handleFormSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          required
                          disabled={isSubmitting}
                        />

                        <input
                          type="email"
                          placeholder="Email *"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          required
                          disabled={isSubmitting}
                        />

                        <input
                          type="text"
                          placeholder="Firm / Organization *"
                          value={formData.firm}
                          onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          required
                          disabled={isSubmitting}
                        />

                        <select
                          value={formData.investmentSize}
                          onChange={(e) => setFormData({ ...formData, investmentSize: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          required
                          disabled={isSubmitting}
                        >
                          <option value="">Investment Range *</option>
                          <option value="$250K - $500K">$250K - $500K</option>
                          <option value="$500K - $1M">$500K - $1M</option>
                          <option value="$1M - $2M">$1M - $2M</option>
                          <option value="$2M+">$2M+</option>
                        </select>

                        <textarea
                          placeholder="Message (optional)"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                          rows={2}
                          disabled={isSubmitting}
                        />

                        {/* Accredited Investor Notice */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                            <span className="font-bold">For Accredited Investors Only.</span> This is not a marketing solicitation or an offer to sell securities. By submitting this form, you confirm that you are an accredited investor as defined by SEC Rule 501 of Regulation D, with the financial sophistication and means to evaluate private investment opportunities. Investment in startups involves substantial risk of loss.
                          </p>
                        </div>
                      </form>
                    </>
                  )}
                </div>

                {/* Fixed Footer with Buttons - Always visible */}
                {submitStatus !== 'success' && (
                  <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="investor-form"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
