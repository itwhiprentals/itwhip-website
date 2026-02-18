// app/(guest)/dashboard/components/AppealModal.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface AppealModalProps {
  isOpen: boolean
  onClose: () => void
  guestId: string
  onSuccess: () => void
}

export default function AppealModal({ isOpen, onClose, guestId, onSuccess }: AppealModalProps) {
  const t = useTranslations('AppealModal')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert(t('provideReason'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/guest/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim()
        })
      })

      if (response.ok) {
        alert(t('appealSuccess'))
        setReason('')
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        alert(data.error || t('appealFailed'))
      }
    } catch (error) {
      console.error('Appeal submission error:', error)
      alert(t('appealFailedRetry'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('submitAppeal')}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('appealDescription')}
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white mb-4"
          rows={6}
          placeholder={t('appealPlaceholder')}
          disabled={submitting}
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('submitting') : t('submitAppeal')}
          </button>
        </div>
      </div>
    </div>
  )
}