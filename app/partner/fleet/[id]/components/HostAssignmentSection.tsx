// app/partner/fleet/[id]/components/HostAssignmentSection.tsx
// Displays current host/manager assignment for a vehicle

'use client'

import { useLocale } from 'next-intl'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  IoPersonOutline,
  IoBusinessOutline,
  IoStarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoMailOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoAddCircleOutline,
  IoCarOutline
} from 'react-icons/io5'

interface Manager {
  id: string
  name: string
  email: string
  profilePhoto: string | null
  businessName: string | null
  city: string | null
  rating: number | null
  totalTrips: number | null
}

interface Management {
  id: string
  status: string
  ownerPercent: number
  managerPercent: number
  startDate: string
  manager: Manager
  permissions: {
    canEditListing: boolean
    canAdjustPricing: boolean
    canCommunicate: boolean
    canApproveBookings: boolean
    canHandleIssues: boolean
  }
}

interface PendingInvitation {
  id: string
  recipientEmail: string
  recipient: {
    id: string
    name: string
    email: string
    profilePhoto: string | null
  } | null
  proposedOwnerPercent: number
  proposedManagerPercent: number
  status: string
  createdAt: string
  expiresAt: string
}

interface HostAssignmentSectionProps {
  vehicleId: string
  onInviteHost: () => void
}

export default function HostAssignmentSection({
  vehicleId,
  onInviteHost
}: HostAssignmentSectionProps) {
  const locale = useLocale()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSelfManaged, setIsSelfManaged] = useState(true)
  const [management, setManagement] = useState<Management | null>(null)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [removing, setRemoving] = useState(false)

  const fetchManagement = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/partner/fleet/${vehicleId}/management`, {
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Management API error:', response.status, data)
        throw new Error(data.error || `API error: ${response.status}`)
      }

      if (data.success) {
        setIsSelfManaged(data.isSelfManaged)
        setManagement(data.management)
        setPendingInvitations(data.pendingInvitations || [])
      }
    } catch (err: any) {
      console.error('Error fetching management:', err)
      setError(err.message || 'Failed to load management status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManagement()
  }, [vehicleId])

  const handleRemoveManager = async () => {
    if (!confirm('Are you sure you want to end this management agreement? The host will no longer have access to manage this vehicle.')) {
      return
    }

    try {
      setRemoving(true)
      const response = await fetch(`/api/partner/fleet/${vehicleId}/management`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to remove manager')
      }

      // Refresh data
      await fetchManagement()
    } catch (err) {
      console.error('Error removing manager:', err)
      alert('Failed to remove manager. Please try again.')
    } finally {
      setRemoving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const hoursRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursRemaining > 0 && hoursRemaining < 48
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="h-16 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
        <div className="text-center py-3">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">{error}</p>
          <button
            onClick={fetchManagement}
            className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm flex items-center gap-1 mx-auto"
          >
            <IoRefreshOutline className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoBusinessOutline className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          Host Assignment
        </h2>
        <button
          onClick={fetchManagement}
          className="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh"
        >
          <IoRefreshOutline className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Self-Managed State */}
      {isSelfManaged && !management && (
        <div className="text-center py-3 sm:py-6">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
            <IoPersonOutline className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-xs sm:text-base text-gray-900 dark:text-white font-medium mb-0.5 sm:mb-1">Self-Managed</h3>
          <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-4">
            You are currently managing this vehicle yourself
          </p>
          <button
            onClick={onInviteHost}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition-colors"
          >
            <IoAddCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Invite Host
          </button>
        </div>
      )}

      {/* Has Assigned Manager */}
      {management && (
        <div className="space-y-3 sm:space-y-4">
          {/* Manager Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Manager Avatar */}
              <div className="flex-shrink-0">
                {management.manager.profilePhoto ? (
                  <Image
                    src={management.manager.profilePhoto}
                    alt={management.manager.name}
                    width={48}
                    height={48}
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                      {management.manager.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Manager Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                      {management.manager.name}
                    </h3>
                    {management.manager.businessName && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {management.manager.businessName}
                      </p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] sm:text-xs font-medium rounded-full flex-shrink-0">
                    <IoCheckmarkCircleOutline className="w-3 h-3" />
                    Active
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {management.manager.rating && (
                    <span className="flex items-center gap-1">
                      <IoStarOutline className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      {Number(management.manager.rating).toFixed(1)}
                      {management.manager.totalTrips && (
                        <span className="hidden sm:inline">({management.manager.totalTrips} trips)</span>
                      )}
                    </span>
                  )}
                  {management.manager.city && (
                    <span className="flex items-center gap-1">
                      <IoLocationOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                      {management.manager.city}
                    </span>
                  )}
                </div>

                {/* Email - separate row on mobile */}
                <div className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 truncate">
                    <IoMailOutline className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{management.manager.email}</span>
                  </span>
                </div>

                {/* Commission Split */}
                <div className="mt-2 sm:mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-purple-100 dark:border-purple-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                    <span className="text-gray-600 dark:text-gray-400">Commission Split</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      You: {management.ownerPercent}% • Host: {management.managerPercent}%
                    </span>
                  </div>
                </div>

                {/* Since Date */}
                <p className="mt-2 text-[10px] sm:text-xs text-gray-400">
                  Managing since {formatDate(management.startDate)}
                </p>
              </div>
            </div>

            {/* Remove Button */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200 dark:border-purple-700">
              <button
                onClick={handleRemoveManager}
                disabled={removing}
                className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-center gap-1"
              >
                <IoTrashOutline className="w-4 h-4" />
                {removing ? 'Removing...' : 'End Management Agreement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
            <IoTimeOutline className="w-4 h-4 text-yellow-500" />
            Pending Invitations ({pendingInvitations.length})
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-2.5 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {invitation.recipient?.profilePhoto ? (
                      <Image
                        src={invitation.recipient.profilePhoto}
                        alt={invitation.recipient.name}
                        width={36}
                        height={36}
                        className="rounded-full w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <IoPersonOutline className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {invitation.recipient?.name || invitation.recipientEmail}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {invitation.proposedOwnerPercent}% owner / {invitation.proposedManagerPercent}% host
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-[10px] sm:text-xs font-medium rounded">
                      <IoTimeOutline className="w-3 h-3" />
                      Pending
                    </span>
                    {isExpiringSoon(invitation.expiresAt) && (
                      <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Expires soon
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Button (when has manager or pending invitations) */}
      {(management || pendingInvitations.length > 0) && isSelfManaged && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onInviteHost}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-xs sm:text-sm flex items-center gap-1"
          >
            <IoAddCircleOutline className="w-4 h-4" />
            Invite Another Host
          </button>
        </div>
      )}
    </div>
  )
}
