'use client'

// Fleet E-Sign Dashboard
// Manages partner agreement uploads, AI validation, and booking e-signatures

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IoDocumentText,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoAlertCircle,
  IoRefresh,
  IoDownload,
  IoEye,
  IoSparkles,
} from 'react-icons/io5'
import { format, formatDistanceToNow } from 'date-fns'

// Types
interface PartnerAgreement {
  id: string
  name: string  // Prospect name (from HostProspect)
  email: string // Prospect email
  hostAgreementUrl: string
  hostAgreementName: string | null
  agreementValidationScore: number | null
  agreementValidationSummary: string | null
  itwhipAgreementAccepted: boolean
  testAgreementSignedAt: string | null
  createdAt: string
  updatedAt: string
}

interface BookingAgreement {
  id: string
  agreementStatus: string
  agreementSentAt: string | null
  agreementViewedAt: string | null
  agreementSignedAt: string | null
  agreementExpiresAt: string | null
  renter: { name: string; email: string } | null  // Changed from guest to renter
  car: {
    make: string
    model: string
    year: number
    host: { businessName: string } | null
  } | null
}

interface ESignData {
  success: boolean
  partnerAgreements: {
    total: number
    validated: number
    pending: number
    avgScore: number
    passRate: string
    recent: PartnerAgreement[]
  }
  bookingAgreements: {
    total: number
    signed: number
    pending: number
    expired: number
    signatureRate: string
    byStatus: { agreementStatus: string; _count: number }[]
    recent: BookingAgreement[]
  }
  updatedAt: string
}

// Score color helper
function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-gray-100'
  if (score >= 80) return 'bg-emerald-50'
  if (score >= 60) return 'bg-yellow-50'
  if (score >= 40) return 'bg-orange-50'
  return 'bg-red-50'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'signed': return 'text-emerald-600 bg-emerald-50'
    case 'viewed': return 'text-blue-600 bg-blue-50'
    case 'sent': return 'text-yellow-600 bg-yellow-50'
    case 'expired': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export default function ESignDashboard() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || ''

  const [data, setData] = useState<ESignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'partner' | 'booking'>('partner')

  const fetchData = useCallback(async () => {
    if (!apiKey) {
      setError('API key required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/fleet/api/esign?key=${apiKey}`)
      if (!res.ok) throw new Error('Failed to fetch data')
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">API key required in URL: ?key=your-key</p>
        </div>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <IoDocumentText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">E-Sign Dashboard</h1>
                <p className="text-sm text-gray-500">Agreement validation & e-signatures</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <IoRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
              activeTab === 'partner'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoSparkles className="w-4 h-4" />
              Partner Agreements (AI)
            </div>
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
              activeTab === 'booking'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoDocumentText className="w-4 h-4" />
              Booking E-Signatures
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'partner' ? (
          <PartnerAgreementsTab data={data?.partnerAgreements} />
        ) : (
          <BookingAgreementsTab data={data?.bookingAgreements} />
        )}
      </div>
    </div>
  )
}

// Partner Agreements Tab (AI Validation)
function PartnerAgreementsTab({ data }: { data: ESignData['partnerAgreements'] | undefined }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IoDocumentText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.total}</div>
              <div className="text-sm text-gray-500">Total Uploaded</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.validated}</div>
              <div className="text-sm text-gray-500">Passed ({data.passRate}%)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.pending}</div>
              <div className="text-sm text-gray-500">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <IoSparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.avgScore}</div>
              <div className="text-sm text-gray-500">Avg AI Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Agreements Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Recent Partner Agreements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Partner</th>
                <th className="px-4 py-3 text-left">File</th>
                <th className="px-4 py-3 text-center">AI Score</th>
                <th className="px-4 py-3 text-left">Summary</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No partner agreements uploaded yet
                  </td>
                </tr>
              ) : (
                data.recent.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {agreement.name || 'Unnamed Prospect'}
                      </div>
                      <div className="text-xs text-gray-500">{agreement.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={agreement.hostAgreementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <IoDownload className="w-4 h-4" />
                        {agreement.hostAgreementName || 'View PDF'}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {agreement.agreementValidationScore !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-full font-bold text-sm ${getScoreBg(agreement.agreementValidationScore)} ${getScoreColor(agreement.agreementValidationScore)}`}>
                          {agreement.agreementValidationScore}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {agreement.agreementValidationSummary || 'No summary available'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {agreement.itwhipAgreementAccepted && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                            Terms Accepted
                          </span>
                        )}
                        {agreement.testAgreementSignedAt && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            Test Signed
                          </span>
                        )}
                        {!agreement.itwhipAgreementAccepted && !agreement.testAgreementSignedAt && (
                          <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      {formatDistanceToNow(new Date(agreement.updatedAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Validation Info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 p-4">
        <div className="flex items-start gap-3">
          <IoSparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-900">AI-Powered Validation</h4>
            <p className="text-sm text-purple-700 mt-1">
              Partner rental agreements are validated using Claude Sonnet AI. The system checks for:
              proper document structure, signature sections, legal terms, and vehicle rental language.
              Scores 80+ are automatically approved. Scores 40-79 need review. Below 40 are rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Booking Agreements Tab (E-Signatures)
function BookingAgreementsTab({ data }: { data: ESignData['bookingAgreements'] | undefined }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IoDocumentText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.total}</div>
              <div className="text-sm text-gray-500">Agreements Sent</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.signed}</div>
              <div className="text-sm text-gray-500">Signed ({data.signatureRate}%)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.pending}</div>
              <div className="text-sm text-gray-500">Awaiting Signature</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <IoAlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.expired}</div>
              <div className="text-sm text-gray-500">Expired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {data.byStatus.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Agreement Status Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {data.byStatus.map((status) => (
              <div
                key={status.agreementStatus}
                className={`px-4 py-2 rounded-lg ${getStatusColor(status.agreementStatus)}`}
              >
                <span className="font-semibold">{status._count}</span>
                <span className="ml-1 capitalize">{status.agreementStatus.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Booking Agreements Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Recent Booking Agreements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Guest</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Host</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No booking agreements sent yet
                  </td>
                </tr>
              ) : (
                data.recent.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {agreement.renter?.name || 'Unknown Renter'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {agreement.renter?.email || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {agreement.car ? (
                        <div className="text-sm text-gray-900">
                          {agreement.car.year} {agreement.car.make} {agreement.car.model}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {agreement.car?.host?.businessName || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(agreement.agreementStatus)}`}>
                        {agreement.agreementStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      <div className="space-y-1">
                        {agreement.agreementSentAt && (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-400">Sent:</span>
                            {format(new Date(agreement.agreementSentAt), 'MMM d, h:mm a')}
                          </div>
                        )}
                        {agreement.agreementViewedAt && (
                          <div className="flex items-center justify-end gap-1 text-blue-600">
                            <IoEye className="w-3 h-3" />
                            {format(new Date(agreement.agreementViewedAt), 'MMM d, h:mm a')}
                          </div>
                        )}
                        {agreement.agreementSignedAt && (
                          <div className="flex items-center justify-end gap-1 text-emerald-600">
                            <IoCheckmarkCircle className="w-3 h-3" />
                            {format(new Date(agreement.agreementSignedAt), 'MMM d, h:mm a')}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
