'use client'

import { useState, useRef, useEffect } from 'react'
import { formatPhone, formatDate, statusBadge } from './shared'

export interface CallLog {
  id: string
  direction: string
  from: string
  to: string
  callSid: string
  status: string
  duration: number | null
  recordingUrl: string | null
  transcription: string | null
  callerType: string | null
  callerId: string | null
  callerName: string | null
  menuPath: string | null
  language: string
  bookingCode: string | null
  createdAt: string
}

interface CallTableProps {
  logs: CallLog[]
  expandedRow: string | null
  onToggleRow: (id: string) => void
  onText: (phone: string) => void
  onQuickSend?: (phone: string, message: string) => Promise<boolean>
}

// ─── Quick reply messages ─────────────────────────────────────────

interface QuickReply {
  label: string
  message: string
}

function getQuickReplies(log: CallLog): QuickReply[] {
  const name = log.callerName ? log.callerName.split(' ')[0] : null
  const hi = name ? `Hi ${name}` : 'Hi'

  const replies: QuickReply[] = []

  if (log.status === 'no-answer' || log.status === 'ringing') {
    replies.push({
      label: 'Missed call',
      message: `${hi}, we saw your missed call. How can we help? - ItWhip`,
    })
  }

  if (log.recordingUrl) {
    replies.push({
      label: 'Got voicemail',
      message: `${hi}, we received your voicemail and will get back to you shortly. - ItWhip`,
    })
  }

  if (log.bookingCode) {
    replies.push({
      label: 'Booking help',
      message: `${hi}, regarding your booking ${log.bookingCode} — how can we help? - ItWhip`,
    })
  }

  replies.push(
    {
      label: 'Following up',
      message: `${hi}, this is ItWhip following up on your recent call. How can we assist you?`,
    },
    {
      label: 'Call us back',
      message: `${hi}, we tried reaching you. Please call us back at (602) 609-2577 when you get a chance. - ItWhip`,
    },
    {
      label: 'Hours/availability',
      message: `${hi}, thanks for reaching out! Our team is available Mon-Sun 8AM-8PM MST. We'll get back to you as soon as possible. - ItWhip`,
    },
  )

  return replies
}

// ─── Helpers ─────────────────────────────────────────────────────

function proxyRecordingUrl(callId: string) {
  return `/fleet/api/communications/recording?key=phoenix-fleet-2847&id=${callId}`
}

function CallerBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      type === 'guest' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
      type === 'host' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }`}>
      {type}
    </span>
  )
}

// ─── Quick Send Dropdown ─────────────────────────────────────────

function QuickSendMenu({ log, onText, onQuickSend }: {
  log: CallLog
  onText: (phone: string) => void
  onQuickSend?: (phone: string, message: string) => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const replies = getQuickReplies(log)

  const handleQuickSend = async (reply: QuickReply) => {
    if (!onQuickSend) return
    setSending(reply.label)
    const ok = await onQuickSend(log.from, reply.message)
    setSending(null)
    if (ok) {
      setSent(reply.label)
      setTimeout(() => { setSent(null); setOpen(false) }, 1200)
    }
  }

  return (
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center">
        <button
          onClick={() => onText(log.from)}
          className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-l hover:bg-blue-100 dark:hover:bg-blue-900/50"
          title="Custom SMS"
        >
          Text
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="px-1 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-r border-l border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          title="Quick replies"
        >
          <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Quick Reply</p>
          {replies.map(reply => (
            <button
              key={reply.label}
              onClick={() => handleQuickSend(reply)}
              disabled={sending !== null}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 transition-colors"
            >
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {sent === reply.label ? 'Sent!' : sending === reply.label ? 'Sending...' : reply.label}
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{reply.message}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────

export function CallTable({ logs, expandedRow, onToggleRow, onText, onQuickSend }: CallTableProps) {
  if (logs.length === 0) {
    return <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No call logs found</div>
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">From</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Duration</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Caller</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Voicemail</th>
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
                <td className="px-4 py-3">
                  <div className="font-mono text-xs">{formatPhone(log.from)}</div>
                  {log.callerName && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.callerName}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{log.duration ? `${log.duration}s` : '-'}</td>
                <td className="px-4 py-3">{statusBadge(log.status)}</td>
                <td className="px-4 py-3 text-xs">
                  {log.callerType && <CallerBadge type={log.callerType} />}
                </td>
                <td className="px-4 py-3">
                  {log.recordingUrl ? (
                    <div>
                      <audio
                        controls
                        preload="none"
                        src={proxyRecordingUrl(log.id)}
                        className="h-8 w-40"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {expandedRow === log.id && log.transcription && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">&quot;{log.transcription}&quot;</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
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
                  <QuickSendMenu log={log} onText={onText} onQuickSend={onQuickSend} />
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
            {/* Top row: phone/name + time */}
            <div className="flex items-start justify-between mb-1.5">
              <div className="min-w-0">
                <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
                  {formatPhone(log.from)}
                </span>
                {log.callerName && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">{log.callerName}</span>
                )}
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 ml-2">{formatDate(log.createdAt)}</span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {statusBadge(log.status)}
              {log.callerType && <CallerBadge type={log.callerType} />}
              {log.duration != null && log.duration > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {log.duration}s
                </span>
              )}
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

            {/* Voicemail player */}
            {log.recordingUrl && (
              <div className="mb-2">
                <audio
                  controls
                  preload="none"
                  src={proxyRecordingUrl(log.id)}
                  className="h-8 w-full max-w-[280px]"
                  onClick={(e) => e.stopPropagation()}
                />
                {expandedRow === log.id && log.transcription && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">&quot;{log.transcription}&quot;</p>
                )}
              </div>
            )}

            {/* Action */}
            <div className="flex justify-end">
              <QuickSendMenu log={log} onText={onText} onQuickSend={onQuickSend} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
