// app/fleet/partners/[id]/page.tsx
// Fleet Partner Detail View - Comprehensive partner management

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoStarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoMailOutline,
  IoCallOutline,
  IoLinkOutline,
  IoSettingsOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoCreateOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface Partner {
  id: string
  name: string
  email: string
  phone: string
  hostType: string
  approvalStatus: string
  active: boolean

  // Partner fields
  partnerCompanyName: string
  partnerSlug?: string
  partnerLogo?: string
  partnerBio?: string
  partnerSupportEmail?: string
  partnerSupportPhone?: string

  // Commission
  currentCommissionRate: number
  tier1VehicleCount: number
  tier1CommissionRate: number
  tier2VehicleCount: number
  tier2CommissionRate: number
  tier3VehicleCount: number
  tier3CommissionRate: number

  // Stats
  partnerFleetSize: number
  partnerTotalBookings: number
  partnerTotalRevenue: number
  partnerAvgRating: number

  // Stripe
  stripeConnectAccountId?: string

  // Timestamps
  createdAt: string
  updatedAt: string

  // Relations
  partnerApplication?: {
    id: string
    status: string
    submittedAt: string
    reviewedAt?: string
    reviewedBy?: string
    reviewNotes?: string
    businessType: string
    yearsInBusiness: number
    fleetSize: number
    vehicleTypes: string[]
    operatingCities: string[]
  }
  partnerDocuments: {
    id: string
    type: string
    status: string
    url: string
    expiresAt?: string
    isExpired: boolean
  }[]
  commissionHistory: {
    id: string
    oldRate: number
    newRate: number
    reason?: string
    changedBy: string
    createdAt: string
  }[]
  _count: {
    vehicles: number
  }
}

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showEditCommissionModal, setShowEditCommissionModal] = useState(false)
  const [newCommissionRate, setNewCommissionRate] = useState(0.25)
  const [suspendReason, setSuspendReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPartner()
  }, [resolvedParams.id])

  const fetchPartner = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/partners/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setPartner(data.partner)
        setNewCommissionRate(data.partner.currentCommissionRate)
      }
    } catch (error) {
      console.error('Failed to fetch partner:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!partner) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspendReason })
      })

      const data = await response.json()
      if (data.success) {
        setShowSuspendModal(false)
        setSuspendReason('')
        fetchPartner()
      } else {
        alert(data.error || 'Failed to update partner status')
      }
    } catch (error) {
      console.error('Failed to suspend partner:', error)
      alert('Failed to update partner status')
    } finally {
      setProcessing(false)
    }
  }

  const handleReactivate = async () => {
    if (!partner) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/reactivate`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchPartner()
      } else {
        alert(data.error || 'Failed to reactivate partner')
      }
    } catch (error) {
      console.error('Failed to reactivate partner:', error)
      alert('Failed to reactivate partner')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateCommission = async () => {
    if (!partner) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/commission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate: newCommissionRate,
          reason: 'Manual adjustment by fleet admin'
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowEditCommissionModal(false)
        fetchPartner()
      } else {
        alert(data.error || 'Failed to update commission rate')
      }
    } catch (error) {
      console.error('Failed to update commission:', error)
      alert('Failed to update commission rate')
    } finally {
      setProcessing(false)
    }
  }

  const getTierBadge = (rate: number) => {
    if (rate <= 0.10) return { label: 'Diamond', color: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' }
    if (rate <= 0.15) return { label: 'Platinum', color: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' }
    if (rate <= 0.20) return { label: 'Gold', color: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' }
    return { label: 'Standard', color: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700' }
  }

  const getDocumentTypeName = (type: string) => {
    const names: Record<string, string> = {
      'BUSINESS_LICENSE': 'Business License',
      'INSURANCE_CERTIFICATE': 'Insurance Certificate',
      'COMMERCIAL_AUTO_POLICY': 'Commercial Auto Policy',
      'BACKGROUND_CHECK': 'Background Check',
      'W9_FORM': 'W-9 Form',
      'ARTICLES_OF_INCORPORATION': 'Articles of Incorporation'
    }
    return names[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading partner details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <IoBusinessOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Partner not found</h2>
            <Link href="/fleet/partners" className="text-orange-600 hover:text-orange-700">
              Back to partners
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tier = getTierBadge(partner.currentCommissionRate)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/fleet/partners"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  {partner.partnerLogo ? (
                    <img src={partner.partnerLogo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {partner.partnerCompanyName?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {partner.partnerCompanyName || partner.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      partner.active
                        ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                        : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                    }`}>
                      {partner.active ? 'Active' : 'Suspended'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
                      {tier.label}
                    </span>
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{partner.email}</span>
                    {partner.partnerSlug && (
                      <a
                        href={`/rideshare/${partner.partnerSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                      >
                        <IoLinkOutline className="w-4 h-4" />
                        /rideshare/{partner.partnerSlug}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {partner.active ? (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <IoPauseCircleOutline className="w-4 h-4" />
                  Suspend
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <IoPlayCircleOutline className="w-4 h-4" />
                  Reactivate
                </button>
              )}
              <Link
                href={`/fleet/partners/${partner.id}/impersonate`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <IoEyeOutline className="w-4 h-4" />
                View as Partner
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-gray-200 dark:border-gray-700 -mb-px">
            {['overview', 'documents', 'commission', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoCarOutline className="w-4 h-4" />
                    <span className="text-xs">Fleet Size</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.partnerFleetSize}
                  </div>
                  <div className="text-xs text-gray-500">vehicles</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoTrendingUpOutline className="w-4 h-4" />
                    <span className="text-xs">Bookings</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.partnerTotalBookings}
                  </div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoCashOutline className="w-4 h-4" />
                    <span className="text-xs">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(partner.partnerTotalRevenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoStarOutline className="w-4 h-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.partnerAvgRating > 0 ? partner.partnerAvgRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-gray-500">average</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Primary Contact</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoPersonOutline className="w-4 h-4" />
                      {partner.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoMailOutline className="w-4 h-4" />
                      {partner.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoCallOutline className="w-4 h-4" />
                      {partner.phone || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Support Email</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoMailOutline className="w-4 h-4" />
                      {partner.partnerSupportEmail || partner.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              {partner.partnerApplication && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Business Type</div>
                      <div className="text-gray-900 dark:text-white">{partner.partnerApplication.businessType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Years in Business</div>
                      <div className="text-gray-900 dark:text-white">{partner.partnerApplication.yearsInBusiness} years</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vehicle Types</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.partnerApplication.vehicleTypes.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Operating Cities</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.partnerApplication.operatingCities.map((city, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted</div>
                      <div className="text-gray-900 dark:text-white">
                        {partner.partnerApplication.submittedAt
                          ? formatDate(partner.partnerApplication.submittedAt)
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reviewed</div>
                      <div className="text-gray-900 dark:text-white">
                        {partner.partnerApplication.reviewedAt
                          ? formatDate(partner.partnerApplication.reviewedAt)
                          : '-'}
                        {partner.partnerApplication.reviewedBy && (
                          <span className="text-gray-500 text-sm"> by {partner.partnerApplication.reviewedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Commission Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commission</h3>
                  <button
                    onClick={() => setShowEditCommissionModal(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <IoCreateOutline className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {Math.round(partner.currentCommissionRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">platform fee</div>
                </div>
                <div className={`text-center px-3 py-2 rounded-lg ${tier.color}`}>
                  <span className="font-medium">{tier.label} Tier</span>
                </div>

                {/* Tier Progress */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Standard (25%)</span>
                    <span>0-9 vehicles</span>
                  </div>
                  <div className={`flex justify-between ${partner.partnerFleetSize >= 10 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Gold (20%)</span>
                    <span>10+ vehicles</span>
                  </div>
                  <div className={`flex justify-between ${partner.partnerFleetSize >= 50 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Platinum (15%)</span>
                    <span>50+ vehicles</span>
                  </div>
                  <div className={`flex justify-between ${partner.partnerFleetSize >= 100 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Diamond (10%)</span>
                    <span>100+ vehicles</span>
                  </div>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
                {partner.partnerDocuments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded</p>
                ) : (
                  <div className="space-y-3">
                    {partner.partnerDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IoDocumentTextOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {getDocumentTypeName(doc.type)}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.isExpired
                            ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            : doc.status === 'VERIFIED'
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                            : 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
                        }`}>
                          {doc.isExpired ? 'Expired' : doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href={`/fleet/partners/${partner.id}/documents`}
                  className="block mt-4 text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Manage Documents
                </Link>
              </div>

              {/* Stripe Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payouts</h3>
                {partner.stripeConnectAccountId ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <IoShieldCheckmarkOutline className="w-5 h-5" />
                    <span className="text-sm font-medium">Stripe Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <IoWarningOutline className="w-5 h-5" />
                    <span className="text-sm font-medium">Stripe Not Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Partner Documents</h3>
            {partner.partnerDocuments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {partner.partnerDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <IoDocumentTextOutline className="w-6 h-6 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getDocumentTypeName(doc.type)}
                        </div>
                        {doc.expiresAt && (
                          <div className={`text-sm ${doc.isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                            {doc.isExpired ? 'Expired: ' : 'Expires: '}
                            {formatDate(doc.expiresAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.isExpired
                          ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                          : doc.status === 'VERIFIED'
                          ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                          : 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
                      }`}>
                        {doc.isExpired ? 'EXPIRED' : doc.status}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-sm font-medium transition-colors"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'commission' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission History</h3>
            {partner.commissionHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No commission changes recorded.</p>
            ) : (
              <div className="space-y-4">
                {partner.commissionHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {Math.round(history.oldRate * 100)}% → {Math.round(history.newRate * 100)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {history.reason || 'Commission rate updated'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(history.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        by {history.changedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Log</h3>
            <p className="text-gray-500 dark:text-gray-400">Activity log coming soon...</p>
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Suspend Partner
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {partner.partnerCompanyName}
              </p>
            </div>

            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Suspending this partner will deactivate all their vehicle listings and prevent new bookings.
                </p>
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for suspension
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter the reason for suspension..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false)
                  setSuspendReason('')
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={processing || !suspendReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Suspend Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {showEditCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Commission Rate
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={Math.round(newCommissionRate * 100)}
                onChange={(e) => setNewCommissionRate(parseInt(e.target.value) / 100)}
                min="5"
                max="50"
                step="1"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Partner keeps {100 - Math.round(newCommissionRate * 100)}% of each booking
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowEditCommissionModal(false)
                  setNewCommissionRate(partner.currentCommissionRate)
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCommission}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
