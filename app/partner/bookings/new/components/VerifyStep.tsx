// app/partner/bookings/new/components/VerifyStep.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoMailOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5'
import { Customer } from '../types'

interface VerifyStepProps {
  selectedCustomer: Customer | null
  onCustomerUpdate: (customer: Customer | null) => void
  onBack: () => void
  onNext: () => void
}

export default function VerifyStep({
  selectedCustomer,
  onCustomerUpdate,
  onBack,
  onNext,
}: VerifyStepProps) {
  const t = useTranslations('PartnerBookingNew')

  const [sendingVerification, setSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [skipVerification, setSkipVerification] = useState(false)

  const isCustomerVerified = selectedCustomer?.stripeIdentityStatus === 'verified'
  const isCustomerPendingVerification = selectedCustomer?.stripeIdentityStatus === 'pending'

  const sendVerificationEmail = async () => {
    if (!selectedCustomer) return

    setSendingVerification(true)
    setVerificationError('')

    try {
      const response = await fetch('/api/partner/verify/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone || '',
          existingProfileId: selectedCustomer.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setVerificationSent(true)
        onCustomerUpdate(selectedCustomer ? {
          ...selectedCustomer,
          stripeIdentityStatus: 'pending'
        } : null)
      } else {
        setVerificationError(data.error || t('failedSendVerification'))
      }
    } catch {
      setVerificationError(t('failedSendVerificationEmail'))
    } finally {
      setSendingVerification(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Customer Info Card */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {selectedCustomer?.photo ? (
          <img src={selectedCustomer.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <IoPersonOutline className="w-6 h-6 text-gray-500" />
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer?.email}</p>
          {selectedCustomer?.phone && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.phone}</p>
          )}
        </div>
      </div>

      {/* Verification Status */}
      {isCustomerVerified ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <IoCheckmarkCircleOutline className="w-8 h-8 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">{t('identityVerified')}</p>
              <p className="text-sm text-green-600 dark:text-green-500">
                {selectedCustomer?.stripeVerifiedFirstName} {selectedCustomer?.stripeVerifiedLastName}
                {selectedCustomer?.stripeIdentityVerifiedAt && (
                  <> • {t('verifiedOn', { date: new Date(selectedCustomer.stripeIdentityVerifiedAt).toLocaleDateString() })}</>
                )}
              </p>
            </div>
          </div>
        </div>
      ) : isCustomerPendingVerification || verificationSent ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <IoTimeOutline className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="font-semibold text-yellow-700 dark:text-yellow-400">{t('verificationPending')}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                {t('verificationPendingDescription')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">{t('verifyCustomerIdentity')}</p>
                <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                  {t('verifyCustomerIdentityDescription')}
                </p>
              </div>
            </div>
          </div>

          {verificationError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
              <IoAlertCircleOutline className="w-5 h-5 flex-shrink-0" />
              {verificationError}
            </div>
          )}

          <button
            onClick={sendVerificationEmail}
            disabled={sendingVerification}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
          >
            {sendingVerification ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {t('sendingVerification')}
              </>
            ) : (
              <>
                <IoMailOutline className="w-5 h-5" />
                {t('sendVerificationEmail')}
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('or')}
          </div>

          {/* In-Person Verification Option */}
          <div className="p-4 bg-gray-200/70 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <IoPersonOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">{t('inPersonVerification')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('inPersonVerificationDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip Verification Checkbox */}
      {!isCustomerVerified && (
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            id="skipVerification"
            checked={skipVerification}
            onChange={(e) => setSkipVerification(e.target.checked)}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="skipVerification" className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">{t('skipVerificationLabel')}</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {t('skipVerificationNote')}
            </span>
          </label>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          {t('back')}
        </button>
        <button
          onClick={onNext}
          disabled={!isCustomerVerified && !skipVerification && !verificationSent}
          className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
        >
          {isCustomerVerified ? t('continueToVehicle') : t('continueSkipVerification')}
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
