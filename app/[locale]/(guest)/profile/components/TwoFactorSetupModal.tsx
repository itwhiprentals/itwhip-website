// app/(guest)/profile/components/TwoFactorSetupModal.tsx
// Modal for setting up Two-Factor Authentication
'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoCopyOutline,
  IoCheckmark
} from 'react-icons/io5'

interface TwoFactorSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (backupCodes: string[]) => void
}

type SetupStep = 'loading' | 'scan' | 'verify' | 'success'

export default function TwoFactorSetupModal({
  isOpen,
  onClose,
  onSuccess
}: TwoFactorSetupModalProps) {
  const t = useTranslations('TwoFactorSetupModal')
  const [step, setStep] = useState<SetupStep>('loading')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const hasInitialized = useRef(false)

  // Start setup when modal opens
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true

      const startSetup = async () => {
        setStep('loading')
        setError('')

        try {
          const response = await fetch('/api/user/2fa/setup', {
            method: 'POST'
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Failed to setup 2FA')
          }

          setQrCode(data.qrCode)
          setSecret(data.secret)
          setStep('scan')
        } catch (err: any) {
          setError(err.message)
          setStep('scan')
        }
      }

      startSetup()
    }

    // Reset when modal closes
    if (!isOpen) {
      hasInitialized.current = false
    }
  }, [isOpen])

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      setError(t('enterSixDigit'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      setBackupCodes(data.backupCodes)
      setStep('success')
      onSuccess(data.backupCodes)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('loading')
    setQrCode('')
    setSecret('')
    setVerificationCode('')
    setError('')
    setBackupCodes([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step === 'success' ? t('titleSuccess') : t('title')}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('settingUp')}</p>
            </div>
          )}

          {step === 'scan' && (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('scanQrCode')}
                </p>

                {qrCode && (
                  <div className="inline-block p-4 bg-white rounded-lg border border-gray-200 mb-4">
                    <Image
                      src={qrCode}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t('enterCodeManually')}
                </p>

                <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">
                  <span className="select-all">{secret}</span>
                  <button
                    onClick={handleCopySecret}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title={t('copySecret')}
                  >
                    {secretCopied ? (
                      <IoCheckmark className="w-4 h-4 text-green-500" />
                    ) : (
                      <IoCopyOutline className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('enterCode')}
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('enabled')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('enabledDesc')}
              </p>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3">
                  {t('saveBackupCodes')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                  {t('backupCodesDesc')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-white dark:bg-gray-800 rounded font-mono text-sm text-gray-900 dark:text-white border border-amber-200 dark:border-amber-800"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'scan' && (
          <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{t('verifying')}</span>
                </>
              ) : (
                <span>{t('verifyAndEnable')}</span>
              )}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              {t('done')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
