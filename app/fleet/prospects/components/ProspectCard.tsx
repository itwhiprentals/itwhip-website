'use client'

import Link from 'next/link'
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoSendOutline,
  IoLinkOutline,
  IoEyeOutline,
  IoRefreshOutline,
  IoLogoFacebook,
  IoGlobeOutline,
  IoDocumentTextOutline,
  IoPencilOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5'

export interface HostProspect {
  id: string
  name: string
  email: string
  phone?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  source: string
  sourceUrl?: string
  conversationNotes?: string
  inviteToken?: string
  inviteTokenExp?: string
  inviteSentAt?: string
  status: string
  emailOpenedAt?: string
  linkClickedAt?: string
  convertedAt?: string
  inviteResendCount: number
  lastResendAt?: string
  // Expired link access tracking
  expiredAccessCount?: number
  lastExpiredAccessAt?: string
  // Email verification - is this email linked to a verified account?
  isProspectEmailKnown?: boolean
  prospectLinkedTo?: string | null  // "John (Host - APPROVED)" or null if NEW
  request?: {
    id: string
    requestCode: string
    vehicleMake?: string
    vehicleType?: string
    guestName: string
    guestEmail?: string
    isGuestEmailKnown?: boolean
    guestLinkedTo?: string | null  // "Jane (Guest since Jan 2024)" or null if NEW
  }
  convertedHost?: {
    id: string
    name: string
    hasCar?: boolean
    carCount?: number
  }
  createdAt: string
}

interface ProspectCardProps {
  prospect: HostProspect
  apiKey: string
  sendingInvite: string | null
  copiedLink: string | null
  onSendInvite: (id: string) => void
  onEdit: (prospect: HostProspect) => void
  onNewRequest: (prospectId: string) => void
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    case 'EMAIL_SENT':
      return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
    case 'EMAIL_OPENED':
      return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
    case 'LINK_CLICKED':
      return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
    case 'CONVERTED':
      return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    case 'EXPIRED':
      return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}

export function getSourceIcon(source: string) {
  switch (source) {
    case 'FACEBOOK_MARKETPLACE':
      return <IoLogoFacebook className="w-4 h-4 text-blue-600" />
    case 'CRAIGSLIST':
      return <IoGlobeOutline className="w-4 h-4 text-purple-600" />
    case 'REFERRAL':
      return <IoPersonOutline className="w-4 h-4 text-green-600" />
    default:
      return <IoGlobeOutline className="w-4 h-4 text-gray-500" />
  }
}

export function formatDate(dateStr?: string) {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function isTokenExpired(expDate?: string) {
  if (!expDate) return true
  return new Date() > new Date(expDate)
}

export default function ProspectCard({
  prospect,
  apiKey,
  sendingInvite,
  copiedLink,
  onSendInvite,
  onEdit,
  onNewRequest
}: ProspectCardProps) {
  const tokenExpired = isTokenExpired(prospect.inviteTokenExp)
  const canSendInvite = prospect.status !== 'CONVERTED' && (
    prospect.status === 'DRAFT' ||
    prospect.status === 'EXPIRED' ||
    tokenExpired
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
      {/* Top Row: Avatar + Name + Status - Always visible */}
      <div className="flex items-center gap-3 mb-2">
        {/* Avatar - Smaller on mobile */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
            {prospect.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {prospect.name}
            </h3>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getStatusBadge(prospect.status)}`}>
              {prospect.status.replace('_', ' ')}
            </span>
            {/* Contact History Badge - shows how many times we've contacted this prospect */}
            {prospect.inviteSentAt ? (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                <IoSendOutline className="w-2.5 h-2.5 inline mr-0.5" />
                {1 + prospect.inviteResendCount}x contacted
              </span>
            ) : (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                Not contacted
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            {getSourceIcon(prospect.source)}
            {prospect.source.replace('_', ' ')}
          </span>
        </div>

        {/* Desktop Actions Preview */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {prospect.status === 'CONVERTED' ? (
            <>
              <Link
                href={`/fleet/hosts/${prospect.convertedHost?.id}?key=${apiKey}`}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                  prospect.convertedHost?.hasCar
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50'
                }`}
              >
                {prospect.convertedHost?.hasCar ? (
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                ) : (
                  <IoTimeOutline className="w-4 h-4" />
                )}
                {prospect.convertedHost?.hasCar ? 'View Host' : 'Pending Setup'}
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); onNewRequest(prospect.id); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                <IoSwapHorizontalOutline className="w-4 h-4" />
                <span className="hidden lg:inline">New Request</span>
              </button>
            </>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onSendInvite(prospect.id); }}
              disabled={sendingInvite === prospect.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                tokenExpired && prospect.inviteSentAt
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800/50'
                  : canSendInvite
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {sendingInvite === prospect.id ? (
                <IoRefreshOutline className="w-4 h-4 animate-spin" />
              ) : copiedLink === prospect.id ? (
                <IoCheckmarkCircleOutline className="w-4 h-4" />
              ) : (
                <IoSendOutline className="w-4 h-4" />
              )}
              <span className="hidden lg:inline">
                {sendingInvite === prospect.id
                  ? 'Sending...'
                  : copiedLink === prospect.id
                    ? 'Copied!'
                    : tokenExpired && prospect.inviteSentAt
                      ? `Send New Link${prospect.inviteResendCount > 0 ? ` (${prospect.inviteResendCount + 1}x)` : ''}`
                      : prospect.inviteSentAt
                        ? `Resend (${prospect.inviteResendCount + 1}x)`
                        : 'Send Invite'
                }
              </span>
              {/* Alert badge when prospect tried with expired link */}
              {(prospect.expiredAccessCount ?? 0) > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-200 text-orange-800 text-xs rounded font-bold dark:bg-orange-700 dark:text-orange-100">
                  !
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Contact & Vehicle Info - Grid on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 pl-0 sm:pl-14">
        <span className="flex items-center gap-1 truncate">
          <IoMailOutline className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{prospect.email}</span>
          {/* Prospect Email Status - Linked to account or NEW */}
          {prospect.prospectLinkedTo ? (
            <span className="ml-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-[9px] text-green-700 dark:text-green-300 font-medium flex items-center gap-0.5">
              <IoShieldCheckmarkOutline className="w-2.5 h-2.5" />
              Linked
            </span>
          ) : prospect.isProspectEmailKnown === false ? (
            <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-[9px] text-yellow-700 dark:text-yellow-300 font-medium">
              NEW
            </span>
          ) : null}
        </span>
        {prospect.phone && (
          <span className="flex items-center gap-1">
            <IoCallOutline className="w-3.5 h-3.5 flex-shrink-0" />
            {prospect.phone}
          </span>
        )}
        {prospect.vehicleMake && (
          <span className="flex items-center gap-1 sm:col-span-2">
            <IoCarOutline className="w-3.5 h-3.5 flex-shrink-0" />
            {prospect.vehicleYear} {prospect.vehicleMake} {prospect.vehicleModel}
          </span>
        )}
      </div>

      {/* Prospect Email Linked To (only show if linked to verified account) */}
      {prospect.prospectLinkedTo && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2 ml-0 sm:ml-14">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-[10px] sm:text-xs text-green-700 dark:text-green-300">
            <IoShieldCheckmarkOutline className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Linked to: {prospect.prospectLinkedTo}</span>
          </span>
        </div>
      )}

      {/* Request Guest Email Status (only if request exists) */}
      {prospect.request && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2 ml-0 sm:ml-14">
          {/* Request reference */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            <IoDocumentTextOutline className="w-3 h-3 flex-shrink-0" />
            Request: {prospect.request.requestCode}
          </span>
          {/* Guest Email Status - Linked or NEW */}
          {prospect.request.guestLinkedTo ? (
            // Guest is linked to verified account
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-[10px] sm:text-xs text-green-700 dark:text-green-300">
              <IoShieldCheckmarkOutline className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Guest: {prospect.request.guestLinkedTo}</span>
            </span>
          ) : (
            // Guest email is NEW - not in our system
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-300 font-medium">
              <IoAlertCircleOutline className="w-3 h-3 flex-shrink-0" />
              NEW GUEST: {prospect.request.guestEmail || prospect.request.guestName}
            </span>
          )}
        </div>
      )}

      {/* Notes Preview */}
      {prospect.conversationNotes && (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 ml-0 sm:ml-14 mb-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <span className="font-medium">Notes:</span> {prospect.conversationNotes}
        </p>
      )}

      {/* Invite Status Timeline */}
      {prospect.inviteSentAt && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 ml-0 sm:ml-14 mb-2">
          <span className="flex items-center gap-1">
            <IoSendOutline className="w-3 h-3" />
            Sent: {formatDate(prospect.inviteSentAt)}
            {prospect.inviteResendCount > 1 && ` (${prospect.inviteResendCount}x)`}
          </span>
          {prospect.emailOpenedAt && (
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <IoEyeOutline className="w-3 h-3" />
              Opened
            </span>
          )}
          {prospect.linkClickedAt && (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <IoLinkOutline className="w-3 h-3" />
              Clicked
            </span>
          )}
          {prospect.convertedAt && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              Converted
            </span>
          )}
          {prospect.inviteTokenExp && !prospect.convertedAt && (
            <span className={`flex items-center gap-1 ${tokenExpired ? 'text-red-600 dark:text-red-400' : ''}`}>
              <IoTimeOutline className="w-3 h-3" />
              {tokenExpired ? 'Expired' : `Exp: ${formatDate(prospect.inviteTokenExp)}`}
            </span>
          )}
        </div>
      )}

      {/* Expired Access Warning - Shows when prospect tried with expired link */}
      {(prospect.expiredAccessCount ?? 0) > 0 && (
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs ml-0 sm:ml-14 mb-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
          <IoWarningOutline className="w-4 h-4 flex-shrink-0" />
          <span>
            Tried {prospect.expiredAccessCount}x with expired link
            {prospect.lastExpiredAccessAt && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                (last: {formatDate(prospect.lastExpiredAccessAt)})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Mobile Actions Row */}
      <div className="sm:hidden flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {prospect.status === 'CONVERTED' ? (
          <>
            <Link
              href={`/fleet/hosts/${prospect.convertedHost?.id}?key=${apiKey}`}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm ${
                prospect.convertedHost?.hasCar
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              }`}
            >
              {prospect.convertedHost?.hasCar ? (
                <IoCheckmarkCircleOutline className="w-4 h-4" />
              ) : (
                <IoTimeOutline className="w-4 h-4" />
              )}
              {prospect.convertedHost?.hasCar ? 'View Host' : 'Pending'}
            </Link>
            <button
              onClick={() => onNewRequest(prospect.id)}
              className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
            >
              <IoSwapHorizontalOutline className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSendInvite(prospect.id)}
              disabled={sendingInvite === prospect.id}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
                tokenExpired && prospect.inviteSentAt
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : canSendInvite
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {sendingInvite === prospect.id ? (
                <IoRefreshOutline className="w-4 h-4 animate-spin" />
              ) : copiedLink === prospect.id ? (
                <IoCheckmarkCircleOutline className="w-4 h-4" />
              ) : (
                <IoSendOutline className="w-4 h-4" />
              )}
              {sendingInvite === prospect.id
                ? 'Sending...'
                : copiedLink === prospect.id
                  ? 'Copied!'
                  : tokenExpired && prospect.inviteSentAt
                    ? 'New Link'
                    : prospect.inviteSentAt
                      ? 'Resend'
                      : 'Invite'
              }
              {/* Alert badge when prospect tried with expired link */}
              {(prospect.expiredAccessCount ?? 0) > 0 && (
                <span className="ml-1 px-1 py-0.5 bg-orange-200 text-orange-800 text-[10px] rounded font-bold">!</span>
              )}
            </button>
            <button
              onClick={() => onEdit(prospect)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
            >
              <IoPencilOutline className="w-4 h-4" />
            </button>
            {prospect.request && (
              <button
                onClick={() => onNewRequest(prospect.id)}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
              >
                <IoSwapHorizontalOutline className="w-4 h-4" />
              </button>
            )}
            {prospect.sourceUrl && (
              <a
                href={prospect.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
              >
                <IoLogoFacebook className="w-4 h-4" />
              </a>
            )}
          </>
        )}
        <span className="text-[10px] text-gray-400 ml-auto">
          {formatDate(prospect.createdAt)}
        </span>
      </div>

      {/* Desktop Extra Actions */}
      <div className="hidden sm:flex items-center gap-2 mt-2 pl-14">
        {prospect.status !== 'CONVERTED' ? (
          <>
            <button
              onClick={() => onEdit(prospect)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <IoPencilOutline className="w-4 h-4" />
              Edit
            </button>
            {prospect.request && (
              <button
                onClick={() => onNewRequest(prospect.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                <IoSwapHorizontalOutline className="w-4 h-4" />
                New Request
              </button>
            )}
            {prospect.sourceUrl && (
              <a
                href={prospect.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                <IoLogoFacebook className="w-4 h-4" />
                View Post
              </a>
            )}
          </>
        ) : (
          <button
            onClick={() => onEdit(prospect)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <IoPencilOutline className="w-4 h-4" />
            Edit
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          Added {formatDate(prospect.createdAt)}
        </span>
      </div>
    </div>
  )
}
