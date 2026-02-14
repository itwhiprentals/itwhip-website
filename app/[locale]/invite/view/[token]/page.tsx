// app/invite/view/[token]/page.tsx
// View and respond to fleet management invitations
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoPersonOutline,
  IoCarOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoSwapHorizontalOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoCreateOutline,
  IoCashOutline,
  IoChatbubbleOutline,
  IoCheckmarkOutline,
  IoAlertCircleOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface InvitationData {
  id: string
  token: string
  type: 'OWNER_INVITES_MANAGER' | 'MANAGER_INVITES_OWNER'
  sender: {
    id: string
    name: string
    email: string
    profilePhoto?: string
  }
  recipientEmail: string
  recipient?: {
    id: string
    name: string
    email: string
  }
  vehicles?: {
    id: string
    make: string
    model: string
    year: number
    photos?: string[]
  }[]
  proposedOwnerPercent: number
  proposedManagerPercent: number
  counterOfferOwnerPercent?: number
  counterOfferManagerPercent?: number
  negotiationRounds: number
  negotiationHistory: {
    round: number
    proposedBy: 'OWNER' | 'MANAGER'
    ownerPercent: number
    managerPercent: number
    message?: string
    timestamp: string
  }[]
  permissions: {
    canEditListing: boolean
    canAdjustPricing: boolean
    canCommunicateGuests: boolean
    canApproveBookings: boolean
    canHandleIssues: boolean
  }
  status: string
  expiresAt: string
  createdAt: string
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default function ViewInvitationPage({ params }: PageProps) {
  const { token } = use(params)
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [computed, setComputed] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Counter-offer state
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterOwnerPercent, setCounterOwnerPercent] = useState(70)
  const [counterManagerPercent, setCounterManagerPercent] = useState(30)
  const [counterMessage, setCounterMessage] = useState('')

  // Decline state
  const [showDecline, setShowDecline] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  useEffect(() => {
    fetchInvitation()
  }, [token])

  async function fetchInvitation() {
    try {
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load invitation')
        return
      }

      setInvitation(data.invitation)
      setComputed(data.computed)

      // Set counter-offer defaults to current terms
      setCounterOwnerPercent(data.computed.currentOwnerPercent)
      setCounterManagerPercent(data.computed.currentManagerPercent)
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation')
        return
      }

      router.push('/host/dashboard?invitation=accepted')
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCounterOffer() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invitations/${token}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedOwnerPercent: counterOwnerPercent,
          proposedManagerPercent: counterManagerPercent,
          message: counterMessage || undefined
        })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit counter-offer')
        return
      }

      // Refresh invitation data
      fetchInvitation()
      setShowCounterOffer(false)
      setCounterMessage('')
    } catch (err) {
      setError('Failed to submit counter-offer')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDecline() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: declineReason || undefined
        })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to decline invitation')
        return
      }

      router.push('/host/dashboard?invitation=declined')
    } catch (err) {
      setError('Failed to decline invitation')
    } finally {
      setActionLoading(false)
    }
  }

  function handleSliderChange(value: number) {
    setCounterOwnerPercent(value)
    setCounterManagerPercent(100 - value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <IoAlertCircleOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This invitation may have expired or been cancelled.'}</p>
            <Link href="/host/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Go to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isOwnerInvitingManager = invitation.type === 'OWNER_INVITES_MANAGER'
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COUNTER_OFFERED: 'bg-orange-100 text-orange-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    DECLINED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Status Banner */}
        {!computed?.canRespond && (
          <div className={`rounded-lg p-4 mb-6 ${
            invitation.status === 'ACCEPTED' ? 'bg-green-50 border border-green-200' :
            invitation.status === 'EXPIRED' ? 'bg-gray-50 border border-gray-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {invitation.status === 'ACCEPTED' ? (
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              ) : (
                <IoCloseCircle className="w-6 h-6 text-gray-500" />
              )}
              <div>
                <p className="font-medium">
                  {invitation.status === 'ACCEPTED' && 'This invitation has been accepted'}
                  {invitation.status === 'DECLINED' && 'This invitation was declined'}
                  {invitation.status === 'EXPIRED' && 'This invitation has expired'}
                  {invitation.status === 'CANCELLED' && 'This invitation was cancelled'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[invitation.status]}`}>
                {invitation.status.replace('_', ' ')}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                {isOwnerInvitingManager ? 'Vehicle Management Invitation' : 'Fleet Partnership Invitation'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isOwnerInvitingManager
                  ? `${invitation.sender.name} wants you to manage their vehicle${invitation.vehicles && invitation.vehicles.length > 1 ? 's' : ''}`
                  : `${invitation.sender.name} wants to manage your vehicles in their fleet`
                }
              </p>
            </div>
          </div>

          {/* Sender Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              {invitation.sender.profilePhoto ? (
                <Image
                  src={invitation.sender.profilePhoto}
                  alt={invitation.sender.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-indigo-600">
                  {invitation.sender.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{invitation.sender.name}</p>
              <p className="text-sm text-gray-600">{invitation.sender.email}</p>
              <p className="text-sm text-indigo-600 font-medium mt-1">
                {isOwnerInvitingManager ? 'Vehicle Owner' : 'Fleet Manager'}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        {invitation.vehicles && invitation.vehicles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoCarOutline className="w-5 h-5" />
              Vehicle{invitation.vehicles.length > 1 ? 's' : ''} Included
            </h2>
            <div className="space-y-3">
              {invitation.vehicles.map(vehicle => (
                <div key={vehicle.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {vehicle.photos?.[0] && (
                    <Image
                      src={vehicle.photos[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      width={80}
                      height={60}
                      className="rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commission Split */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IoCashOutline className="w-5 h-5" />
            Commission Split
          </h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Platform Fee</p>
                <p className="text-2xl font-bold text-gray-900">10%</p>
                <p className="text-xs text-gray-500">Non-negotiable</p>
              </div>
              <div className="text-center border-l border-r border-amber-200">
                <p className="text-gray-600">Owner</p>
                <p className="text-2xl font-bold text-indigo-600">{computed?.currentOwnerPercent}%</p>
                <p className="text-xs text-gray-500">{computed?.effectiveOwnerPercent?.toFixed(0)}% of total</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Manager</p>
                <p className="text-2xl font-bold text-purple-600">{computed?.currentManagerPercent}%</p>
                <p className="text-xs text-gray-500">{computed?.effectiveManagerPercent?.toFixed(0)}% of total</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Example: On a $100 booking, platform takes $10, owner gets ${computed?.effectiveOwnerPercent?.toFixed(0)}, manager gets ${computed?.effectiveManagerPercent?.toFixed(0)}
          </p>
        </div>

        {/* Manager Permissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-5 h-5" />
            Manager Permissions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'canEditListing', label: 'Edit vehicle listings', icon: IoCreateOutline },
              { key: 'canAdjustPricing', label: 'Adjust pricing', icon: IoCashOutline },
              { key: 'canCommunicateGuests', label: 'Communicate with guests', icon: IoChatbubbleOutline },
              { key: 'canApproveBookings', label: 'Approve/decline bookings', icon: IoCheckmarkOutline },
              { key: 'canHandleIssues', label: 'Handle issues and claims', icon: IoAlertCircleOutline }
            ].map(perm => (
              <div
                key={perm.key}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  invitation.permissions[perm.key as keyof typeof invitation.permissions]
                    ? 'bg-green-50'
                    : 'bg-gray-50'
                }`}
              >
                {invitation.permissions[perm.key as keyof typeof invitation.permissions] ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <IoCloseCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700">{perm.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Negotiation History */}
        {invitation.negotiationHistory.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoSwapHorizontalOutline className="w-5 h-5" />
              Negotiation History
            </h2>
            <div className="space-y-3">
              {invitation.negotiationHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-600">{entry.round}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {entry.proposedBy === 'OWNER' ? 'Owner' : 'Manager'} proposed {entry.ownerPercent}/{entry.managerPercent}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.message && (
                      <p className="text-sm text-gray-600 mt-1">{entry.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              {computed?.roundsRemaining} negotiation round{computed?.roundsRemaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}

        {/* Expiration Notice */}
        {computed?.canRespond && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <IoTimeOutline className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                This invitation expires on{' '}
                <strong>{new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {computed?.canRespond && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {!showCounterOffer && !showDecline ? (
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <IoCheckmarkCircle className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Accept Invitation'}
                </button>

                {computed?.canCounterOffer && (
                  <button
                    onClick={() => setShowCounterOffer(true)}
                    disabled={actionLoading}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IoSwapHorizontalOutline className="w-5 h-5" />
                    Counter-Offer
                  </button>
                )}

                <button
                  onClick={() => setShowDecline(true)}
                  disabled={actionLoading}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <IoCloseCircle className="w-5 h-5" />
                  Decline
                </button>
              </div>
            ) : showCounterOffer ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Propose New Terms</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Split
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-600 w-24">Owner: {counterOwnerPercent}%</span>
                    <input
                      type="range"
                      min={50}
                      max={90}
                      value={counterOwnerPercent}
                      onChange={(e) => handleSliderChange(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-28">Manager: {counterManagerPercent}%</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Owner must get 50-90%, Manager gets 10-50%
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    placeholder="Explain your counter-offer..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCounterOffer(false)}
                    className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCounterOffer}
                    disabled={actionLoading}
                    className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Sending...' : 'Send Counter-Offer'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Decline Invitation</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Let them know why you're declining..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDecline(false)}
                    className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Declining...' : 'Confirm Decline'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
