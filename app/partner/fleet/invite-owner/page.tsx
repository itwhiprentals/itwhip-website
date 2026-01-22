// app/partner/fleet/invite-owner/page.tsx
// Form for fleet managers to invite vehicle owners
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IoPersonAddOutline,
  IoMailOutline,
  IoCashOutline,
  IoShieldCheckmarkOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoSendOutline
} from 'react-icons/io5'

export default function InviteOwnerPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [ownerPercent, setOwnerPercent] = useState(70)
  const [managerPercent, setManagerPercent] = useState(30)
  const [message, setMessage] = useState('')
  const [permissions, setPermissions] = useState({
    canEditListing: true,
    canAdjustPricing: true,
    canCommunicateGuests: true,
    canApproveBookings: true,
    canHandleIssues: true
  })

  function handleSliderChange(value: number) {
    setOwnerPercent(value)
    setManagerPercent(100 - value)
  }

  function togglePermission(key: keyof typeof permissions) {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MANAGER_INVITES_OWNER',
          recipientEmail: email,
          proposedOwnerPercent: ownerPercent,
          proposedManagerPercent: managerPercent,
          permissions,
          message: message || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send invitation')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCheckmarkCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invitation Sent!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent an invitation to <strong>{email}</strong>. They'll receive an email with instructions to join your fleet.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false)
                setEmail('')
                setMessage('')
              }}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Invite Another Owner
            </button>
            <Link
              href="/partner/dashboard"
              className="block w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Back Link */}
      <Link
        href="/partner/fleet"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <IoArrowBackOutline className="w-5 h-5" />
        Back to Fleet
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <IoPersonAddOutline className="w-7 h-7 text-orange-600" />
          Invite Vehicle Owner
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Invite a vehicle owner to add their car to your managed fleet. They'll earn passive income while you handle the day-to-day.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoMailOutline className="w-5 h-5" />
            Owner's Email
          </h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            We'll send them an invitation email with your proposed terms.
          </p>
        </div>

        {/* Commission Split */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoCashOutline className="w-5 h-5" />
            Proposed Commission Split
          </h2>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2 mb-3">
              <IoInformationCircleOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Platform always takes 10% first. The remaining 90% is split between you and the owner.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner: {ownerPercent}%</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manager (You): {managerPercent}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              value={ownerPercent}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Owner min: 50%</span>
              <span>Owner max: 90%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Owner gets</p>
              <p className="text-xl font-bold text-orange-600">{(ownerPercent * 0.9).toFixed(0)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">of total revenue</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">You get</p>
              <p className="text-xl font-bold text-purple-600">{(managerPercent * 0.9).toFixed(0)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">of total revenue</p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-5 h-5" />
            Manager Permissions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select what you'll be able to do with the owner's vehicle:
          </p>
          <div className="space-y-3">
            {[
              { key: 'canEditListing', label: 'Edit vehicle listings', desc: 'Update photos, description, features' },
              { key: 'canAdjustPricing', label: 'Adjust pricing', desc: 'Change daily, weekly, monthly rates' },
              { key: 'canCommunicateGuests', label: 'Communicate with guests', desc: 'Handle messages and inquiries' },
              { key: 'canApproveBookings', label: 'Approve/decline bookings', desc: 'Manage booking requests' },
              { key: 'canHandleIssues', label: 'Handle issues and claims', desc: 'Manage problems and damage claims' }
            ].map(perm => (
              <label
                key={perm.key}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                  permissions[perm.key as keyof typeof permissions]
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={permissions[perm.key as keyof typeof permissions]}
                  onChange={() => togglePermission(perm.key as keyof typeof permissions)}
                  className="mt-1 rounded text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{perm.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{perm.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personal Message (Optional)
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to include in the invitation..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-orange-600 text-white py-4 px-4 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <IoSendOutline className="w-5 h-5" />
          {loading ? 'Sending Invitation...' : 'Send Invitation'}
        </button>
      </form>
    </div>
  )
}
