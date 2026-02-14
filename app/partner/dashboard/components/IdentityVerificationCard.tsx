'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoShieldCheckmarkOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoPersonOutline,
  IoCopyOutline,
  IoOpenOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface VerificationStats {
  total: number
  verified: number
  pending: number
  notStarted: number
}

interface Guest {
  id: string
  name: string
  email: string
  verificationStatus: string
  verifiedAt?: string
}

export default function IdentityVerificationCard() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState<VerificationStats | null>(null)
  const [recentGuests, setRecentGuests] = useState<Guest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: 'rental'
  })
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const t = useTranslations('PartnerDashboard')

  useEffect(() => {
    fetchVerificationData()
  }, [])

  const fetchVerificationData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/partner/verify/send-link')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStats(data.stats)
          setRecentGuests(data.guests?.slice(0, 5) || [])
        }
      }
    } catch (err) {
      console.error('Error fetching verification data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    setVerificationUrl(null)
    setEmailSent(false)

    try {
      const res = await fetch('/api/partner/verify/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate verification link')
      }

      if (data.status === 'already_verified') {
        setError(t('ivAlreadyVerified', { name: formData.name }))
      } else if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl)
        setEmailSent(data.emailSent || false)
        fetchVerificationData()
      } else {
        throw new Error('No verification URL returned')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send verification')
    } finally {
      setSending(false)
    }
  }

  const copyToClipboard = async () => {
    if (verificationUrl) {
      await navigator.clipboard.writeText(verificationUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', purpose: 'rental' })
    setVerificationUrl(null)
    setEmailSent(false)
    setError(null)
    setShowForm(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
      case 'pending':
        return <IoTimeOutline className="w-4 h-4 text-yellow-500" />
      default:
        return <IoAlertCircleOutline className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('ivIdentityVerification')}</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('ivIdentityVerification')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('ivStripeIdentity')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVerificationData}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <IoRefreshOutline className="w-4 h-4" />
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                <IoSendOutline className="w-4 h-4" />
                {t('ivVerify')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('ivTotal')}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.verified}</div>
              <div className="text-xs text-green-600 dark:text-green-400">{t('ivVerified')}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 text-center">
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">{t('ivPending')}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
              <div className="text-xl font-bold text-gray-400">{stats.notStarted}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('ivUnverified')}</div>
            </div>
          </div>
        )}

        {/* Send Verification Form */}
        {showForm && (
          <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 mb-4">
            <form onSubmit={handleSendVerification} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ivCustomerName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ivEmailAddress')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ivPhoneOptional')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ivPurpose')}
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="rental">{t('ivCarRental')}</option>
                    <option value="rideshare">{t('ivRideshare')}</option>
                    <option value="driver">{t('ivDriver')}</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {verificationUrl && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm mb-2">
                    <IoCheckmarkCircleOutline className="w-4 h-4" />
                    {emailSent ? t('ivVerificationEmailSent') : t('ivLinkGenerated')}
                  </div>
                  {emailSent && (
                    <p className="text-xs text-green-600 dark:text-green-500 mb-2">
                      {t('ivEmailSentTo', { email: formData.email })}
                    </p>
                  )}
                  {formData.phone && !emailSent && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {t('ivSmsComing')}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={verificationUrl}
                      className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-xs text-gray-600 dark:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      title={t('ivCopyLink')}
                    >
                      {copiedUrl ? <IoCheckmarkCircleOutline className="w-4 h-4" /> : <IoCopyOutline className="w-4 h-4" />}
                    </button>
                    <a
                      href={verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      title={t('ivOpenLink')}
                    >
                      <IoOpenOutline className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('ivSending')}
                    </>
                  ) : verificationUrl ? (
                    t('ivSendAnother')
                  ) : (
                    <>
                      <IoSendOutline className="w-4 h-4" />
                      {t('ivSendVerification')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  {t('ivCancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Customers */}
        {recentGuests.length > 0 && !showForm && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <IoPersonOutline className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{guest.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{guest.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(guest.verificationStatus)}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(guest.verificationStatus)}`}>
                    {guest.verificationStatus === 'not_started'
                      ? t('ivUnverified')
                      : guest.verificationStatus.charAt(0).toUpperCase() + guest.verificationStatus.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!showForm && recentGuests.length === 0 && (
          <div className="text-center py-4">
            <IoShieldCheckmarkOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('ivNoCustomersYet')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
