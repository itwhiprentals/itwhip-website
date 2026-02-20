// app/partner/dashboard/components/InvitationsList.tsx
// Displays list of invitations with tabs (Sent | Received) — collapsible

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoMailOutline,
  IoSendOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoSwapHorizontalOutline,
  IoPersonOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoRefreshOutline,
  IoAddCircleOutline
} from 'react-icons/io5'
import { InvitationDetails } from '@/app/types/fleet-management'
import { useTranslations, useLocale } from 'next-intl'

interface InvitationsListProps {
  initialTab?: 'sent' | 'received'
  limit?: number
  showViewAll?: boolean
}

export default function InvitationsList({
  initialTab = 'sent',
  limit = 5,
  showViewAll = true
}: InvitationsListProps) {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>(initialTab)
  const [invitations, setInvitations] = useState<InvitationDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const t = useTranslations('PartnerDashboard')

  const locale = useLocale()

  const fetchInvitations = useCallback(async (type: 'sent' | 'received') => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api/fleet-manager/invitations/list?type=${type}&limit=${limit}`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch invitations')
      }

      const data = await response.json()
      if (data.success) {
        setInvitations(data.invitations)
      }
    } catch (err) {
      console.error('Error fetching invitations:', err)
      setError(t('ilFailedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [limit, t])

  useEffect(() => {
    fetchInvitations(activeTab)
  }, [activeTab, fetchInvitations])

  const handleTabChange = (tab: 'sent' | 'received') => {
    setActiveTab(tab)
    if (isCollapsed) setIsCollapsed(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'ACCEPTED':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
      case 'DECLINED':
        return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
      case 'EXPIRED':
        return 'bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
      case 'COUNTER_OFFERED':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      case 'CANCELLED':
        return 'bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
      default:
        return 'bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <IoTimeOutline className="w-3 h-3" />
      case 'ACCEPTED':
        return <IoCheckmarkCircleOutline className="w-3 h-3" />
      case 'DECLINED':
        return <IoCloseCircleOutline className="w-3 h-3" />
      case 'COUNTER_OFFERED':
        return <IoSwapHorizontalOutline className="w-3 h-3" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return t('ilToday')
    if (days === 1) return t('ilYesterday')
    if (days < 7) return t('ilDaysAgo', { days })
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const hoursRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursRemaining > 0 && hoursRemaining < 48
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <IoMailOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">Invitations</span>
          {!loading && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({invitations.length} {activeTab})
            </span>
          )}
        </div>
        {isCollapsed ? (
          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
        ) : (
          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {!isCollapsed && (
        <>
          {/* Tabs */}
          <div className="flex border-t border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('sent')}
              className={`flex-1 py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'sent'
                  ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <IoSendOutline className="w-4 h-4" />
              {t('ilSent')}
            </button>
            <button
              onClick={() => handleTabChange('received')}
              className={`flex-1 py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'received'
                  ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <IoMailOutline className="w-4 h-4" />
              {t('ilReceived')}
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-2">{error}</p>
                <button
                  onClick={() => fetchInvitations(activeTab)}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1 mx-auto"
                >
                  <IoRefreshOutline className="w-4 h-4" />
                  {t('ilRetry')}
                </button>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  {activeTab === 'sent' ? (
                    <IoSendOutline className="w-6 h-6 text-gray-400" />
                  ) : (
                    <IoMailOutline className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-1 text-sm">
                  {activeTab === 'sent' ? t('ilNoSentInvitations') : t('ilNoReceivedInvitations')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {activeTab === 'sent'
                    ? t('ilStartInviting')
                    : t('ilInvitationsFromOwners')}
                </p>
                {activeTab === 'sent' && (
                  <Link
                    href="/partner/fleet/invite-owner"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors"
                  >
                    <IoAddCircleOutline className="w-4 h-4" />
                    {t('ilInviteCarOwner')}
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {activeTab === 'sent' && (
                  <Link
                    href="/partner/fleet/invite-owner"
                    className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    <IoAddCircleOutline className="w-4 h-4" />
                    {t('ilInviteCarOwner')}
                  </Link>
                )}
                {invitations.map((invitation) => (
                  <Link
                    key={invitation.id}
                    href={`/partner/fleet/invitations/${invitation.token}`}
                    className="block p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {activeTab === 'sent' ? (
                          invitation.recipient?.name ? (
                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                {invitation.recipient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <IoPersonOutline className="w-4 h-4 text-gray-400" />
                            </div>
                          )
                        ) : (
                          invitation.sender.profilePhoto ? (
                            <Image
                              src={invitation.sender.profilePhoto}
                              alt={invitation.sender.name}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                {invitation.sender.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {activeTab === 'sent'
                              ? invitation.recipient?.name || invitation.recipientEmail
                              : invitation.sender.name}
                          </p>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(invitation.status)}`}>
                            {getStatusIcon(invitation.status)}
                            {invitation.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Type and Commission */}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {invitation.type === 'MANAGER_INVITES_OWNER' ? t('ilOwnerInvite') : t('ilManagerInvite')}
                          {' \u2022 '}
                          {invitation.proposedManagerPercent}% / {invitation.proposedOwnerPercent}%
                        </p>

                        {/* Vehicles if any */}
                        {invitation.vehicles && invitation.vehicles.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                            <IoCarOutline className="w-3 h-3" />
                            <span>
                              {invitation.vehicles.length === 1
                                ? `${invitation.vehicles[0].year} ${invitation.vehicles[0].make} ${invitation.vehicles[0].model}`
                                : t('ilVehicles', { count: invitation.vehicles.length })}
                            </span>
                          </div>
                        )}

                        {/* Date and Expiry */}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-gray-400">{formatDate(invitation.createdAt)}</span>
                          {invitation.status === 'PENDING' && isExpiringSoon(invitation.expiresAt) && (
                            <span className="text-orange-500 dark:text-orange-400 font-medium">
                              {t('ilExpiresSoon')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <IoChevronForwardOutline className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* View All Link */}
            {showViewAll && invitations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link
                  href={`/partner/fleet/invitations?tab=${activeTab}`}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center gap-1"
                >
                  {activeTab === 'sent' ? t('ilViewAllSent') : t('ilViewAllReceived')}
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
