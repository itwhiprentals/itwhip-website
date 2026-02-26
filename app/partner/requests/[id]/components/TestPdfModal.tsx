'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCloseOutline,
  IoDocumentOutline,
  IoDocumentTextOutline,
  IoMailOutline,
  IoSendOutline
} from 'react-icons/io5'

interface TestPdfModalProps {
  isOpen: boolean
  onClose: () => void
  hostEmail: string
}

export default function TestPdfModal({ isOpen, onClose, hostEmail }: TestPdfModalProps) {
  const t = useTranslations('PartnerRequestDetail')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/partner/onboarding/agreement/test', {
        method: 'POST'
      })
      const result = await response.json()

      if (!response.ok) {
        alert(result.error || t('failedToSendTestEmail'))
        return
      }

      onClose()
      alert(t('testEmailSentSuccess', { sentTo: result.sentTo }))
    } catch (err) {
      console.error('Test e-sign error:', err)
      alert(t('failedToSendTestEmail'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoDocumentOutline className="w-5 h-5 text-blue-600" />
            {t('testESignExperience')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* What will be sent */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('testWillSendEmail')}
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t('yourRentalAgreement')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('thePdfYouUploaded')}</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoDocumentTextOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t('itwhipStandardAgreement')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('requiredPlatformTerms')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email destination */}
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <IoMailOutline className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('testEmailSentTo')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{hostEmail}</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{t('previewWhatGuestsSee')}</strong> {t('previewWhatGuestsSeeDesc')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {t('sending')}
              </>
            ) : (
              <>
                <IoSendOutline className="w-4 h-4" />
                {t('sendTestEmail')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
