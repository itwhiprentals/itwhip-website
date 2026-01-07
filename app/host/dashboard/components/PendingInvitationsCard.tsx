// app/host/dashboard/components/PendingInvitationsCard.tsx
// Shows pending management invitations for hosts to accept/decline

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoMailOutline,
  IoCarOutline,
  IoTimeOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface Invitation {
  id: string
  token: string
  type: string
  status: string
  sender: {
    id: string
    name: string
    email: string
    profilePhoto?: string
  }
  vehicles?: Array<{
    id: string
    year: number
    make: string
    model: string
    photos?: string[]
  }>
  proposedOwnerPercent: number
  proposedManagerPercent: number
  createdAt: string
  expiresAt: string
}

interface PendingInvitationsCardProps {
  hostId: string
}

export default function PendingInvitationsCard({ hostId }: PendingInvitationsCardProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/fleet-manager/invitations/list?type=received&status=pending', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Not authorized to view invitations, just show nothing
          setInvitations([])
          return
        }
        throw new Error('Failed to fetch invitations')
      }

      const data = await response.json()
      if (data.success && data.invitations) {
        setInvitations(data.invitations)
      }
    } catch (err) {
      console.error('Error fetching invitations:', err)
      setError('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [hostId])

  // Don't render anything if there are no invitations
  if (loading) {
    return null // Don't show loading state, just hide the card
  }

  if (error || invitations.length === 0) {
    return null // Hide if error or no invitations
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-700 p-4 sm:p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
            <IoMailOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Pending Invitation{invitations.length > 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invitations.length} vehicle owner{invitations.length > 1 ? 's want' : ' wants'} you to manage their vehicle{invitations.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={fetchInvitations}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Refresh"
        >
          <IoRefreshOutline className="w-5 h-5" />
        </button>
      </div>

      {/* Invitations List */}
      <div className="space-y-3">
        {invitations.map((invitation) => {
          const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt)
          const isExpiringSoon = daysUntilExpiry <= 3

          return (
            <Link
              key={invitation.id}
              href={`/invite/view/${invitation.token}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Sender Photo */}
                <div className="flex-shrink-0">
                  {invitation.sender.profilePhoto ? (
                    <Image
                      src={invitation.sender.profilePhoto}
                      alt={invitation.sender.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <IoPersonOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Invitation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {invitation.sender.name}
                    </span>
                  </div>

                  {/* Vehicles */}
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <IoCarOutline className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {invitation.vehicles && invitation.vehicles.length === 1 ? (
                        `${invitation.vehicles[0].year} ${invitation.vehicles[0].make} ${invitation.vehicles[0].model}`
                      ) : invitation.vehicles && invitation.vehicles.length > 1 ? (
                        `${invitation.vehicles.length} vehicles`
                      ) : (
                        'Vehicle management'
                      )}
                    </span>
                  </div>

                  {/* Commission Split & Expiry */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      {invitation.proposedManagerPercent}% commission
                    </span>
                    <span className={`flex items-center gap-1 ${
                      isExpiringSoon ? 'text-orange-600 dark:text-orange-400 font-medium' : ''
                    }`}>
                      <IoTimeOutline className="w-3 h-3" />
                      {isExpiringSoon ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}` : `Sent ${formatDate(invitation.createdAt)}`}
                    </span>
                  </div>
                </div>

                {/* Action Arrow */}
                <div className="flex-shrink-0">
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* View All Link */}
      {invitations.length > 3 && (
        <div className="mt-4 text-center">
          <Link
            href="/host/invitations"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all invitations →
          </Link>
        </div>
      )}
    </div>
  )
}
