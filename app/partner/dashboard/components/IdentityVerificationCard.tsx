'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    fetchVerificationData()
  }, [])

  const fetchVerificationData = async () => {
    try {
      const res = await fetch('/api/partner/verify/send-link')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentGuests(data.guests?.slice(0, 5) || [])
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
        setError(`${formData.name} is already verified.`)
      } else {
        setVerificationUrl(data.verificationUrl)
        // Refresh data
        fetchVerificationData()
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
    setError(null)
    setShowForm(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
            <p className="text-sm text-gray-500">Verify customers with Stripe Identity</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            Send Verification
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-xs text-green-600">Verified</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.notStarted}</div>
            <div className="text-xs text-gray-500">Not Started</div>
          </div>
        </div>
      )}

      {/* Send Verification Form */}
      {showForm && (
        <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4 mb-6">
          <form onSubmit={handleSendVerification} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rental">Car Rental</option>
                  <option value="rideshare">Rideshare Driver</option>
                  <option value="driver">Professional Driver</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {verificationUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Verification Link Generated
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verificationUrl}
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {copiedUrl ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Share this link with the customer to verify their identity
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : verificationUrl ? (
                  'Generate New Link'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Verification Link
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Customers */}
      {recentGuests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Customers</h4>
          <div className="space-y-2">
            {recentGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-full">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{guest.name}</div>
                    <div className="text-xs text-gray-500">{guest.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(guest.verificationStatus)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      guest.verificationStatus
                    )}`}
                  >
                    {guest.verificationStatus === 'not_started'
                      ? 'Not Verified'
                      : guest.verificationStatus.charAt(0).toUpperCase() +
                        guest.verificationStatus.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!showForm && recentGuests.length === 0 && (
        <div className="text-center py-6">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No customers verified yet. Send your first verification link!
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Powered by Stripe Identity:</strong> Customers verify their driver&apos;s license
          with a secure face match. Verified data is stored securely and compliant with regulations.
        </p>
      </div>
    </div>
  )
}
