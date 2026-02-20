// app/partner/fleet/invitations/[token]/page.tsx
// Partner-side invitation detail page (within partner layout)

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoChevronBack,
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
  IoPersonOutline
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
  recipient?: { id: string; name: string; email: string }
  vehicles?: { id: string; make: string; model: string; year: number; photos?: string[] }[]
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

export default function InvitationDetailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [computed, setComputed] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isSender, setIsSender] = useState(false)

  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterOwnerPercent, setCounterOwnerPercent] = useState(70)
  const [counterManagerPercent, setCounterManagerPercent] = useState(30)
  const [counterMessage, setCounterMessage] = useState('')
  const [showDecline, setShowDecline] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  useEffect(() => { fetchInvitation() }, [token])

  async function fetchInvitation() {
    try {
      // Fetch invitation and current session in parallel
      const [invRes, sessionRes] = await Promise.all([
        fetch(`/api/invitations/${token}`),
        fetch('/api/partner/session-info')
      ])
      const data = await invRes.json()
      if (!invRes.ok) { setError(data.error || 'Failed to load invitation'); return }
      setInvitation(data.invitation)
      setComputed(data.computed)
      setCounterOwnerPercent(data.computed.currentOwnerPercent)
      setCounterManagerPercent(data.computed.currentManagerPercent)

      // Check if current user is the sender
      if (sessionRes.ok) {
        const session = await sessionRes.json()
        const hostId = session.user?.id
        if (hostId && hostId === data.invitation.sender.id) {
          setIsSender(true)
        }
      }
    } catch { setError('Failed to load invitation') }
    finally { setLoading(false) }
  }

  async function handleAccept() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to accept'); return }
      router.push('/partner/dashboard?invitation=accepted')
    } catch { setError('Failed to accept invitation') }
    finally { setActionLoading(false) }
  }

  async function handleCounterOffer() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invitations/${token}/counter`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedOwnerPercent: counterOwnerPercent, proposedManagerPercent: counterManagerPercent, message: counterMessage || undefined })
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to submit counter-offer'); return }
      fetchInvitation()
      setShowCounterOffer(false)
      setCounterMessage('')
    } catch { setError('Failed to submit counter-offer') }
    finally { setActionLoading(false) }
  }

  async function handleDecline() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason || undefined })
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to decline'); return }
      router.push('/partner/dashboard')
    } catch { setError('Failed to decline invitation') }
    finally { setActionLoading(false) }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="p-4 sm:p-6">
        <Link href="/partner/fleet/invitations?tab=sent" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
          <IoChevronBack className="w-4 h-4" /> Back
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Invitation Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!invitation) return null

  const isOwnerInvitingManager = invitation.type === 'OWNER_INVITES_MANAGER'
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    COUNTER_OFFERED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const permissions = [
    { key: 'canEditListing', label: 'Edit vehicle listings', icon: IoCreateOutline },
    { key: 'canAdjustPricing', label: 'Adjust pricing', icon: IoCashOutline },
    { key: 'canCommunicateGuests', label: 'Communicate with guests', icon: IoChatbubbleOutline },
    { key: 'canApproveBookings', label: 'Approve/decline bookings', icon: IoCheckmarkOutline },
    { key: 'canHandleIssues', label: 'Handle issues and claims', icon: IoAlertCircleOutline }
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Link href="/partner/fleet/invitations?tab=sent" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <IoChevronBack className="w-4 h-4" /> Back
      </Link>

      {/* Status Banner */}
      {!computed?.canRespond && (
        <div className={`rounded-lg p-4 ${
          invitation.status === 'ACCEPTED' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          invitation.status === 'EXPIRED' ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' :
          'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {invitation.status === 'ACCEPTED' ? <IoCheckmarkCircle className="w-5 h-5 text-green-600" /> : <IoCloseCircle className="w-5 h-5 text-gray-500" />}
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {invitation.status === 'ACCEPTED' && 'This invitation has been accepted'}
              {invitation.status === 'DECLINED' && 'This invitation was declined'}
              {invitation.status === 'EXPIRED' && 'This invitation has expired'}
              {invitation.status === 'CANCELLED' && 'This invitation was cancelled'}
            </p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invitation.status]}`}>
              {invitation.status.replace('_', ' ')}
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
              {isOwnerInvitingManager ? 'Vehicle Management Invitation' : 'Fleet Partnership Invitation'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isSender
                ? `Sent to ${invitation.recipientEmail}`
                : isOwnerInvitingManager
                  ? `${invitation.sender.name} wants you to manage their vehicle${invitation.vehicles && invitation.vehicles.length > 1 ? 's' : ''}`
                  : `${invitation.sender.name} wants to manage your vehicles in their fleet`}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            {isSender ? (
              invitation.recipient ? (
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{invitation.recipient.name.charAt(0).toUpperCase()}</span>
              ) : (
                <IoPersonOutline className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )
            ) : invitation.sender.profilePhoto ? (
              <Image src={invitation.sender.profilePhoto} alt={invitation.sender.name} width={40} height={40} className="rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{invitation.sender.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            {isSender ? (
              <>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{invitation.recipient?.name || invitation.recipientEmail}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{invitation.recipientEmail}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Invited {isOwnerInvitingManager ? 'Manager' : 'Owner'}</p>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{invitation.sender.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{invitation.sender.email}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{isOwnerInvitingManager ? 'Vehicle Owner' : 'Fleet Manager'}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles */}
      {invitation.vehicles && invitation.vehicles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoCarOutline className="w-4 h-4" />
            Vehicle{invitation.vehicles.length > 1 ? 's' : ''} Included
          </h2>
          <div className="space-y-2">
            {invitation.vehicles.map(vehicle => (
              <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                {vehicle.photos?.[0] && (
                  <Image src={vehicle.photos[0]} alt={`${vehicle.make} ${vehicle.model}`} width={64} height={48} className="rounded object-cover" />
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.year} {vehicle.make}</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{vehicle.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Split */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <IoCashOutline className="w-4 h-4" />
          Commission Split
        </h2>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-3">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Platform</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">10%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Fixed</p>
            </div>
            <div className="border-l border-r border-amber-200 dark:border-amber-700">
              <p className="text-gray-600 dark:text-gray-400 text-xs">Owner</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{computed?.currentOwnerPercent}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{computed?.effectiveOwnerPercent?.toFixed(0)}% of total</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Manager</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{computed?.currentManagerPercent}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{computed?.effectiveManagerPercent?.toFixed(0)}% of total</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Example: On a $100 booking, platform takes $10, owner gets ${computed?.effectiveOwnerPercent?.toFixed(0)}, manager gets ${computed?.effectiveManagerPercent?.toFixed(0)}
        </p>
      </div>

      {/* Manager Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <IoShieldCheckmarkOutline className="w-4 h-4" />
          Manager Permissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {permissions.map(perm => {
            const enabled = invitation.permissions[perm.key as keyof typeof invitation.permissions]
            return (
              <div key={perm.key} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${enabled ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                {enabled ? <IoCheckmarkCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <IoCloseCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                <span className="text-gray-700 dark:text-gray-300">{perm.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Negotiation History */}
      {invitation.negotiationHistory.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoSwapHorizontalOutline className="w-4 h-4" />
            Negotiation History
          </h2>
          <div className="space-y-2">
            {invitation.negotiationHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{entry.round}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {entry.proposedBy === 'OWNER' ? 'Owner' : 'Manager'} proposed {entry.ownerPercent}/{entry.managerPercent}
                    </p>
                    <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                  {entry.message && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{entry.message}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            {computed?.roundsRemaining} round{computed?.roundsRemaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      {/* Expiration */}
      {(isSender || computed?.canRespond) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IoTimeOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {isSender ? 'Invitation expires' : 'Expires'} on <strong>{new Date(invitation.expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Sender Status Summary */}
      {isSender && invitation.status === 'PENDING' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <IoTimeOutline className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="font-medium text-gray-900 dark:text-white text-sm">Waiting for Response</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {invitation.recipientEmail} hasn&apos;t responded yet
          </p>
        </div>
      )}

      {isSender && invitation.status === 'COUNTER_OFFERED' && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
          <IoSwapHorizontalOutline className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="font-medium text-gray-900 dark:text-white text-sm">Counter-Offer Received</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review the updated terms above
          </p>
        </div>
      )}

      {/* Actions — only for recipient */}
      {computed?.canRespond && !isSender && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {!showCounterOffer && !showDecline ? (
            <div className="space-y-2">
              <button onClick={handleAccept} disabled={actionLoading}
                className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                <IoCheckmarkCircle className="w-4 h-4" />
                {actionLoading ? 'Processing...' : 'Accept Invitation'}
              </button>
              {computed?.canCounterOffer && (
                <button onClick={() => setShowCounterOffer(true)} disabled={actionLoading}
                  className="w-full bg-orange-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  <IoSwapHorizontalOutline className="w-4 h-4" />
                  Counter-Offer
                </button>
              )}
              <button onClick={() => setShowDecline(true)} disabled={actionLoading}
                className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                <IoCloseCircle className="w-4 h-4" />
                Decline
              </button>
            </div>
          ) : showCounterOffer ? (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Propose New Terms</h3>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Owner: {counterOwnerPercent}%</span>
                  <input type="range" min={50} max={90} value={counterOwnerPercent} onChange={e => { setCounterOwnerPercent(Number(e.target.value)); setCounterManagerPercent(100 - Number(e.target.value)) }} className="flex-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-24">Manager: {counterManagerPercent}%</span>
                </div>
              </div>
              <textarea value={counterMessage} onChange={e => setCounterMessage(e.target.value)} placeholder="Message (optional)..." rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm mb-3" />
              <div className="flex gap-2">
                <button onClick={() => setShowCounterOffer(false)} className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition">Cancel</button>
                <button onClick={handleCounterOffer} disabled={actionLoading} className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50">
                  {actionLoading ? 'Sending...' : 'Send Counter-Offer'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Decline Invitation</h3>
              <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Reason (optional)..." rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm mb-3" />
              <div className="flex gap-2">
                <button onClick={() => setShowDecline(false)} className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition">Cancel</button>
                <button onClick={handleDecline} disabled={actionLoading} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50">
                  {actionLoading ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
