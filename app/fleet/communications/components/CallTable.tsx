'use client'

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
}

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

export function CallTable({ logs, expandedRow, onToggleRow, onText }: CallTableProps) {
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onText(log.from)
                    }}
                    className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    title="Send SMS to this caller"
                  >
                    Text
                  </button>
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
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onText(log.from)
                }}
                className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                Text
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
