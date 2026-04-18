'use client'

import { formatPhone, formatDate, statusBadge, typeBadge } from './shared'

export interface SmsLog {
  id: string
  to: string
  from: string
  body: string
  status: string
  type: string
  twilioSid: string | null
  errorCode: string | null
  errorMessage: string | null
  locale: string
  segments: number
  bookingCode: string | null
  createdAt: string
  deliveredAt: string | null
}

interface SmsTableProps {
  logs: SmsLog[]
  expandedRow: string | null
  onToggleRow: (id: string) => void
  onReply: (phone: string) => void
  onResend?: (log: SmsLog) => void
}

function dialPhone(phone: string) {
  window.dispatchEvent(new CustomEvent('phone-dial', { detail: { phone } }))
}

export function SmsTable({ logs, expandedRow, onToggleRow, onReply, onResend }: SmsTableProps) {
  if (logs.length === 0) {
    return <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No SMS logs found</div>
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">To</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Message</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Booking</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map(log => (
              <tr
                key={log.id}
                onClick={() => onToggleRow(log.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs">{formatPhone(log.type === 'INBOUND' ? log.from : log.to)}</td>
                <td className="px-4 py-3 max-w-xs">
                  <div className={expandedRow === log.id ? '' : 'truncate'}>{log.body}</div>
                  {log.errorMessage && expandedRow === log.id && (
                    <div className="text-xs text-red-500 mt-1">Error: {log.errorMessage}</div>
                  )}
                </td>
                <td className="px-4 py-3">{typeBadge(log.type)}</td>
                <td className="px-4 py-3">{statusBadge(log.status)}</td>
                <td className="px-4 py-3">
                  {log.bookingCode && (
                    <a
                      href={`/fleet/bookings?search=${log.bookingCode}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {log.bookingCode}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {/* Call button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dialPhone(log.type === 'INBOUND' ? log.from : log.to) }}
                      className="px-2 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/50"
                      title="Call this number"
                    >
                      Call
                    </button>
                    {/* Reply for inbound */}
                    {log.type === 'INBOUND' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReply(log.from) }}
                        className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      >
                        Reply
                      </button>
                    )}
                    {/* Resend for failed */}
                    {(log.status === 'failed' || log.status === 'undelivered') && onResend && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onResend(log) }}
                        className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
        {logs.map(log => (
          <div
            key={log.id}
            onClick={() => onToggleRow(log.id)}
            className="p-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-750"
          >
            {/* Top row: phone + time */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
                {formatPhone(log.type === 'INBOUND' ? log.from : log.to)}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(log.createdAt)}</span>
            </div>

            {/* Message body */}
            <p className={`text-sm text-gray-700 dark:text-gray-300 mb-2 ${expandedRow === log.id ? '' : 'line-clamp-2'}`}>
              {log.body}
            </p>
            {log.errorMessage && expandedRow === log.id && (
              <p className="text-xs text-red-500 mb-2">Error: {log.errorMessage}</p>
            )}

            {/* Bottom row: badges + actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {typeBadge(log.type)}
                {statusBadge(log.status)}
                {log.bookingCode && (
                  <a
                    href={`/fleet/bookings?search=${log.bookingCode}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {log.bookingCode}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={(e) => { e.stopPropagation(); dialPhone(log.type === 'INBOUND' ? log.from : log.to) }}
                  className="px-2 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/50"
                >
                  Call
                </button>
                {log.type === 'INBOUND' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onReply(log.from) }}
                    className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  >
                    Reply
                  </button>
                )}
                {(log.status === 'failed' || log.status === 'undelivered') && onResend && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onResend(log) }}
                    className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
