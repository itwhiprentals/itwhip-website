// app/partner/fleet/[id]/components/InviteHostModal.tsx
// Modal for partners to search and invite hosts to manage their vehicles

'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import {
  IoCloseOutline,
  IoSearchOutline,
  IoPersonOutline,
  IoStarOutline,
  IoLocationOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoMailOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import {
  DEFAULT_OWNER_PERCENT,
  DEFAULT_MANAGER_PERCENT,
  MIN_OWNER_PERCENT,
  MAX_OWNER_PERCENT,
  DEFAULT_PERMISSIONS,
  ManagementPermissions
} from '@/app/types/fleet-management'

interface Host {
  id: string
  name: string
  email: string
  profilePhoto: string | null
  businessName: string | null
  city: string | null
  state: string | null
  rating: number | null
  totalTrips: number | null
  fleetSize: number
  managedVehicles: number
}

interface InviteHostModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
  vehicleName: string
  onInviteSent?: () => void
}

export default function InviteHostModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  onInviteSent
}: InviteHostModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Host[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchAvailable, setSearchAvailable] = useState(true) // Only ItWhip can search

  // Selection state
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)
  const [manualEmail, setManualEmail] = useState('')
  const [useManualEmail, setUseManualEmail] = useState(false)

  // Commission state
  const [ownerPercent, setOwnerPercent] = useState(DEFAULT_OWNER_PERCENT)
  const [managerPercent, setManagerPercent] = useState(DEFAULT_MANAGER_PERCENT)

  // Permissions state
  const [permissions, setPermissions] = useState<ManagementPermissions>(DEFAULT_PERMISSIONS)

  // Optional message
  const [message, setMessage] = useState('')

  // Submission state
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Search for hosts (only available for ItWhip platform)
  const searchHosts = useCallback(async (query: string) => {
    if (query.length < 2 || !searchAvailable) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      setSearchError(null)

      const response = await fetch(`/api/partner/hosts/search?q=${encodeURIComponent(query)}&limit=10`, {
        credentials: 'include'
      })

      // 403 means search is not available for this partner (non-ItWhip)
      if (response.status === 403) {
        setSearchAvailable(false)
        setUseManualEmail(true)
        setSearchResults([])
        return
      }

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      if (data.success) {
        setSearchResults(data.hosts)
      }
    } catch (err) {
      console.error('Host search error:', err)
      setSearchError('Failed to search hosts')
    } finally {
      setSearching(false)
    }
  }, [searchAvailable])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchHosts(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchHosts])

  // Update manager percent when owner percent changes
  const handleOwnerPercentChange = (value: number) => {
    const clampedValue = Math.min(Math.max(value, MIN_OWNER_PERCENT), MAX_OWNER_PERCENT)
    setOwnerPercent(clampedValue)
    setManagerPercent(100 - clampedValue)
  }

  // Toggle permission
  const togglePermission = (key: keyof ManagementPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Send invitation
  const handleSendInvitation = async () => {
    const recipientEmail = useManualEmail ? manualEmail : selectedHost?.email

    if (!recipientEmail) {
      setSendError('Please select a host or enter an email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      setSendError('Please enter a valid email address')
      return
    }

    try {
      setSending(true)
      setSendError(null)

      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'OWNER_INVITES_MANAGER',
          recipientEmail,
          vehicleIds: [vehicleId],
          proposedOwnerPercent: ownerPercent,
          proposedManagerPercent: managerPercent,
          permissions
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      // Success
      onInviteSent?.()
      onClose()

      // Reset form
      setSearchQuery('')
      setSearchResults([])
      setSelectedHost(null)
      setManualEmail('')
      setUseManualEmail(false)
      setOwnerPercent(DEFAULT_OWNER_PERCENT)
      setManagerPercent(DEFAULT_MANAGER_PERCENT)
      setPermissions(DEFAULT_PERMISSIONS)
      setMessage('')
    } catch (err: any) {
      console.error('Send invitation error:', err)
      setSendError(err.message || 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  // Reset form on close
  const handleClose = () => {
    onClose()
    // Delay reset to allow animation
    setTimeout(() => {
      setSearchQuery('')
      setSearchResults([])
      setSelectedHost(null)
      setManualEmail('')
      setUseManualEmail(false)
      setSendError(null)
    }, 300)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Mobile: bottom sheet, Desktop: centered modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl overflow-hidden max-h-[90vh] sm:max-h-none flex flex-col">
                {/* Drag handle (mobile only) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                    Invite Host to Manage Vehicle
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <IoCloseOutline className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                  {/* Vehicle Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <IoCarOutline className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Inviting host to manage: <strong>{vehicleName}</strong>
                    </span>
                  </div>

                  {/* Host Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {searchAvailable ? 'Select a Host' : 'Enter Host Email'}
                    </label>

                    {/* Toggle between search and manual email (only for ItWhip) */}
                    {searchAvailable && (
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setUseManualEmail(false)}
                          className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                            !useManualEmail
                              ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <IoSearchOutline className="w-4 h-4 inline mr-1" />
                          Search Hosts
                        </button>
                        <button
                          onClick={() => setUseManualEmail(true)}
                          className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                            useManualEmail
                              ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <IoMailOutline className="w-4 h-4 inline mr-1" />
                          Enter Email
                        </button>
                      </div>
                    )}

                    {/* Search Input (only for ItWhip) */}
                    {searchAvailable && !useManualEmail && (
                      <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {searching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Email Input (for all partners, or when search not available) */}
                    {(useManualEmail || !searchAvailable) && (
                      <>
                        <input
                          type="email"
                          placeholder="Enter host's email address..."
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {!searchAvailable && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Enter the email address of an approved host to send them an invitation.
                          </p>
                        )}
                      </>
                    )}

                    {/* Search Results (only for ItWhip) */}
                    {searchAvailable && !useManualEmail && searchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.map((host) => (
                          <button
                            key={host.id}
                            onClick={() => {
                              setSelectedHost(host)
                              setSearchQuery('')
                              setSearchResults([])
                            }}
                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {host.profilePhoto ? (
                                <Image
                                  src={host.profilePhoto}
                                  alt={host.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                                    {host.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {host.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{host.email}</span>
                                  {host.rating && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <IoStarOutline className="w-3 h-3 text-yellow-500" />
                                        {host.rating.toFixed(1)}
                                      </span>
                                    </>
                                  )}
                                  {host.city && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <IoLocationOutline className="w-3 h-3" />
                                        {host.city}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results (only for ItWhip) */}
                    {searchAvailable && !useManualEmail && searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No hosts found. Try entering their email directly.
                      </p>
                    )}

                    {/* Selected Host (only for ItWhip) */}
                    {searchAvailable && selectedHost && !useManualEmail && (
                      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selectedHost.profilePhoto ? (
                              <Image
                                src={selectedHost.profilePhoto}
                                alt={selectedHost.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                  {selectedHost.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {selectedHost.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedHost.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedHost(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <IoCloseOutline className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commission Split */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Commission Split
                    </label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Your share (Owner)
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {ownerPercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={MIN_OWNER_PERCENT}
                        max={MAX_OWNER_PERCENT}
                        value={ownerPercent}
                        onChange={(e) => handleOwnerPercentChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Host share (Manager)
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {managerPercent}%
                        </span>
                      </div>

                      {/* Info note */}
                      <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                          <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            After 10% platform fee, you keep {(ownerPercent * 0.9).toFixed(0)}% of bookings and the host earns {(managerPercent * 0.9).toFixed(0)}%.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Host Permissions
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'canEditListing', label: 'Edit listing details' },
                        { key: 'canAdjustPricing', label: 'Adjust pricing' },
                        { key: 'canCommunicateGuests', label: 'Communicate with guests' },
                        { key: 'canApproveBookings', label: 'Approve bookings' },
                        { key: 'canHandleIssues', label: 'Handle issues & support' }
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissions[key as keyof ManagementPermissions]}
                            onChange={() => togglePermission(key as keyof ManagementPermissions)}
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {sendError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300">{sendError}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 sm:pb-4 pb-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvitation}
                    disabled={sending || (searchAvailable ? (!selectedHost && !manualEmail) : !manualEmail)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <IoMailOutline className="w-4 h-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
