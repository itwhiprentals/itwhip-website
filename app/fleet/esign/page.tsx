'use client'

// Fleet E-Sign Dashboard
// Manages partner agreement uploads, AI validation, and booking e-signatures
// Supports dark mode, mobile-responsive, and PDF viewing

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
  IoClose,
} from 'react-icons/io5'
import { format, formatDistanceToNow } from 'date-fns'

// Types
interface PartnerAgreement {
  id: string
  name: string
  email: string
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
  agreementSignedPdfUrl: string | null
  renter: { name: string; email: string } | null
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

// Score color helpers with dark mode
function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400 dark:text-gray-500'
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-gray-100 dark:bg-gray-700'
  if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/30'
  if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/30'
  if (score >= 40) return 'bg-orange-50 dark:bg-orange-900/30'
  return 'bg-red-50 dark:bg-red-900/30'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'signed': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
    case 'viewed': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
    case 'sent': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
    case 'expired': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
    default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700'
  }
}

// PDF Viewer Modal Component with optional AI Analysis Panel
function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  validationScore,
  validationSummary,
}: {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string | null
  title: string
  validationScore?: number | null
  validationSummary?: string | null
}) {
  if (!isOpen || !pdfUrl) return null

  const hasAnalysis = validationScore !== undefined && validationScore !== null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <IoDocumentText className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
            {hasAnalysis && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getScoreBg(validationScore)} ${getScoreColor(validationScore)}`}>
                Score: {validationScore}/100
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors"
            >
              <IoDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: PDF + Analysis Panel (if available) */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Embed */}
          <div className={`flex-1 p-2 ${hasAnalysis ? 'lg:w-2/3' : 'w-full'}`}>
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full rounded border border-gray-200 dark:border-gray-700"
              title={title}
            />
          </div>

          {/* AI Analysis Panel */}
          {hasAnalysis && (
            <div className="hidden lg:flex lg:w-1/3 flex-col border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <IoSparkles className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-semibold">AI Analysis</h4>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Score Breakdown */}
                <div className={`p-4 rounded-lg ${getScoreBg(validationScore)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Validation Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(validationScore)}`}>
                      {validationScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        validationScore >= 80 ? 'bg-emerald-500' :
                        validationScore >= 60 ? 'bg-yellow-500' :
                        validationScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${validationScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>0</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Score Legend */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600 dark:text-gray-400">80-100: Excellent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">60-79: Good</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">40-59: Needs Review</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600 dark:text-gray-400">0-39: Rejected</span>
                  </div>
                </div>

                {/* Summary */}
                {validationSummary && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Summary</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {validationSummary}
                    </p>
                  </div>
                )}

                {/* Status Badge */}
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  validationScore >= 40
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {validationScore >= 40 ? (
                    <>
                      <IoCheckmarkCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Agreement Approved</span>
                    </>
                  ) : (
                    <>
                      <IoAlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Agreement Needs Review</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ESignDashboard() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || ''

  const [data, setData] = useState<ESignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'partner' | 'booking'>('booking')

  // PDF Viewer state (with optional validation data for AI Analysis Panel)
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean
    url: string | null
    title: string
    validationScore?: number | null
    validationSummary?: string | null
  }>({
    isOpen: false,
    url: null,
    title: '',
  })

  const openPdfViewer = (
    url: string | null,
    title: string,
    validationScore?: number | null,
    validationSummary?: string | null
  ) => {
    if (url) {
      setPdfModal({ isOpen: true, url, title, validationScore, validationSummary })
    }
  }

  const closePdfViewer = () => {
    setPdfModal({ isOpen: false, url: null, title: '' })
  }

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">API key required in URL: ?key=your-key</p>
        </div>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={pdfModal.isOpen}
        onClose={closePdfViewer}
        pdfUrl={pdfModal.url}
        title={pdfModal.title}
        validationScore={pdfModal.validationScore}
        validationSummary={pdfModal.validationSummary}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoDocumentText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">E-Sign Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Agreement validation & e-signatures</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <IoRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-3 sm:px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === 'partner'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoSparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Partner Agreements (AI)</span>
              <span className="sm:hidden">Partner</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-3 sm:px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === 'booking'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoDocumentText className="w-4 h-4" />
              <span className="hidden sm:inline">Booking E-Signatures</span>
              <span className="sm:hidden">Bookings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'partner' ? (
          <PartnerAgreementsTab data={data?.partnerAgreements} onViewPdf={openPdfViewer} />
        ) : (
          <BookingAgreementsTab data={data?.bookingAgreements} onViewPdf={openPdfViewer} />
        )}
      </div>
    </div>
  )
}

// Partner Agreements Tab (AI Validation)
function PartnerAgreementsTab({
  data,
  onViewPdf,
}: {
  data: ESignData['partnerAgreements'] | undefined
  onViewPdf: (url: string | null, title: string, validationScore?: number | null, validationSummary?: string | null) => void
}) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards - Mobile: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoDocumentText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.total}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Uploaded</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.validated}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Passed ({data.passRate}%)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoTimeOutline className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.pending}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoSparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.avgScore}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg AI Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Agreements - Mobile Card View, Desktop Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Partner Agreements</h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Partner</th>
                <th className="px-4 py-3 text-left">File</th>
                <th className="px-4 py-3 text-center">AI Score</th>
                <th className="px-4 py-3 text-left">Summary</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No partner agreements uploaded yet
                  </td>
                </tr>
              ) : (
                data.recent.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {agreement.name || 'Unnamed Prospect'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{agreement.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onViewPdf(
                          agreement.hostAgreementUrl,
                          agreement.hostAgreementName || 'Partner Agreement',
                          agreement.agreementValidationScore,
                          agreement.agreementValidationSummary
                        )}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        <IoEye className="w-4 h-4" />
                        {agreement.hostAgreementName || 'View PDF'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {agreement.agreementValidationScore !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-full font-bold text-sm ${getScoreBg(agreement.agreementValidationScore)} ${getScoreColor(agreement.agreementValidationScore)}`}>
                          {agreement.agreementValidationScore}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {agreement.agreementValidationSummary || 'No summary available'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {agreement.itwhipAgreementAccepted && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                            Terms Accepted
                          </span>
                        )}
                        {agreement.testAgreementSignedAt && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                            Test Signed
                          </span>
                        )}
                        {!agreement.itwhipAgreementAccepted && !agreement.testAgreementSignedAt && (
                          <span className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(agreement.updatedAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {data.recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No partner agreements uploaded yet
            </div>
          ) : (
            data.recent.map((agreement) => (
              <div key={agreement.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agreement.name || 'Unnamed Prospect'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{agreement.email}</div>
                  </div>
                  {agreement.agreementValidationScore !== null && (
                    <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full font-bold text-xs ${getScoreBg(agreement.agreementValidationScore)} ${getScoreColor(agreement.agreementValidationScore)}`}>
                      {agreement.agreementValidationScore}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {agreement.agreementValidationSummary || 'No summary available'}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onViewPdf(
                      agreement.hostAgreementUrl,
                      agreement.hostAgreementName || 'Partner Agreement',
                      agreement.agreementValidationScore,
                      agreement.agreementValidationSummary
                    )}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm"
                  >
                    <IoEye className="w-4 h-4" />
                    View PDF
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(agreement.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Validation Info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-100 dark:border-purple-800 p-4">
        <div className="flex items-start gap-3">
          <IoSparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-200">AI-Powered Validation</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
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
function BookingAgreementsTab({
  data,
  onViewPdf,
}: {
  data: ESignData['bookingAgreements'] | undefined
  onViewPdf: (url: string | null, title: string) => void
}) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoDocumentText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.total}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Agreements Sent</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.signed}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Signed ({data.signatureRate}%)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoTimeOutline className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.pending}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Awaiting Signature</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{data.expired}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Expired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {data.byStatus.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Agreement Status Breakdown</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {data.byStatus.map((status) => (
              <div
                key={status.agreementStatus}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm ${getStatusColor(status.agreementStatus)}`}
              >
                <span className="font-semibold">{status._count}</span>
                <span className="ml-1 capitalize">{status.agreementStatus.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Booking Agreements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Booking Agreements</h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Renter</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Host</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">PDF</th>
                <th className="px-4 py-3 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No booking agreements sent yet
                  </td>
                </tr>
              ) : (
                data.recent.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {agreement.renter?.name || 'Unknown Renter'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {agreement.renter?.email || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {agreement.car ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {agreement.car.year} {agreement.car.make} {agreement.car.model}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {agreement.car?.host?.businessName || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(agreement.agreementStatus)}`}>
                        {agreement.agreementStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {agreement.agreementSignedPdfUrl ? (
                        <button
                          onClick={() => onViewPdf(
                            agreement.agreementSignedPdfUrl,
                            `${agreement.renter?.name || 'Renter'} - ${agreement.car?.year} ${agreement.car?.make} ${agreement.car?.model}`
                          )}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors"
                        >
                          <IoEye className="w-3 h-3" />
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        {agreement.agreementSentAt && (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-400 dark:text-gray-500">Sent:</span>
                            {format(new Date(agreement.agreementSentAt), 'MMM d, h:mm a')}
                          </div>
                        )}
                        {agreement.agreementViewedAt && (
                          <div className="flex items-center justify-end gap-1 text-blue-600 dark:text-blue-400">
                            <IoEye className="w-3 h-3" />
                            {format(new Date(agreement.agreementViewedAt), 'MMM d, h:mm a')}
                          </div>
                        )}
                        {agreement.agreementSignedAt && (
                          <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400">
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {data.recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No booking agreements sent yet
            </div>
          ) : (
            data.recent.map((agreement) => (
              <div key={agreement.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agreement.renter?.name || 'Unknown Renter'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{agreement.renter?.email || ''}</div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(agreement.agreementStatus)}`}>
                    {agreement.agreementStatus.replace('_', ' ')}
                  </span>
                </div>
                {agreement.car && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {agreement.car.year} {agreement.car.make} {agreement.car.model}
                    {agreement.car.host?.businessName && (
                      <span className="text-gray-400 dark:text-gray-500"> - {agreement.car.host.businessName}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    {agreement.agreementSignedAt ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <IoCheckmarkCircle className="w-3 h-3" />
                        Signed {format(new Date(agreement.agreementSignedAt), 'MMM d')}
                      </span>
                    ) : agreement.agreementViewedAt ? (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <IoEye className="w-3 h-3" />
                        Viewed {format(new Date(agreement.agreementViewedAt), 'MMM d')}
                      </span>
                    ) : agreement.agreementSentAt ? (
                      <span>Sent {format(new Date(agreement.agreementSentAt), 'MMM d')}</span>
                    ) : null}
                  </div>
                  {agreement.agreementSignedPdfUrl && (
                    <button
                      onClick={() => onViewPdf(
                        agreement.agreementSignedPdfUrl,
                        `${agreement.renter?.name || 'Renter'} - ${agreement.car?.year} ${agreement.car?.make} ${agreement.car?.model}`
                      )}
                      className="flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded"
                    >
                      <IoEye className="w-3 h-3" />
                      View PDF
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
