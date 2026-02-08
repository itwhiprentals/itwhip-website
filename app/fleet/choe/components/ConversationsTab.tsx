// app/fleet/choe/components/ConversationsTab.tsx

'use client'

import { useState } from 'react'
import type { ConversationSummary } from '../types'
import OutcomeBadge from './OutcomeBadge'

interface ConversationsTabProps {
  conversations: ConversationSummary[]
  pagination: { page: number; total: number; totalPages: number }
  onPageChange: (page: number) => void
  apiKey: string
}

export default function ConversationsTab({ conversations, pagination, onPageChange, apiKey }: ConversationsTabProps) {
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [convDetail, setConvDetail] = useState<ConversationSummary & {
    messages?: {
      id: string
      role: string
      content: string
      tokensUsed: number
      responseTimeMs: number | null
      searchPerformed: boolean
      vehiclesReturned: number
      createdAt: string
    }[]
    timeline?: { timestamp: string; event: string; details?: string }[]
  } | null>(null)

  const loadConvDetail = async (id: string) => {
    setSelectedConv(id)
    const res = await fetch(`/fleet/api/choe/conversations/${id}?key=${apiKey}`)
    if (res.ok) {
      const data = await res.json()
      setConvDetail(data.data)
    }
  }

  return (
    <div className="space-y-4">
      {/* Conversations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map(conv => (
              <tr
                key={conv.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => loadConvDetail(conv.id)}
              >
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${conv.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {conv.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {conv.location || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {conv.messageCount}
                </td>
                <td className="px-4 py-3">
                  <OutcomeBadge outcome={conv.outcome} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(conv.startedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {conversations.length} of {pagination.total} conversations
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConv && convDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedConv(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation Details</h3>
              <p className="text-sm text-gray-500">Session: {convDetail.sessionId}</p>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{convDetail.location || '-'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Outcome</dt>
                  <dd><OutcomeBadge outcome={convDetail.outcome} /></dd>
                </div>
                <div>
                  <dt className="text-gray-500">Messages</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{convDetail.messageCount}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tokens</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{convDetail.totalTokens.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Cost</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">${convDetail.estimatedCost.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Duration</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{Math.round(convDetail.duration / 60)} min</dd>
                </div>
              </dl>

              {/* Messages Section */}
              {convDetail.messages && convDetail.messages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Conversation ({convDetail.messages.length} messages)
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {convDetail.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                            : 'bg-gray-50 dark:bg-gray-700/50 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${
                            msg.role === 'user'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }`}>
                            {msg.role === 'user' ? 'User' : 'Choé'}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {msg.searchPerformed && (
                              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                                🔍 {msg.vehiclesReturned} cars
                              </span>
                            )}
                            {msg.tokensUsed > 0 && (
                              <span>{msg.tokensUsed} tokens</span>
                            )}
                            {msg.responseTimeMs && (
                              <span>{msg.responseTimeMs}ms</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              {convDetail.timeline && convDetail.timeline.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    {convDetail.timeline.map((event, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{event.event}</span>
                          {event.details && (
                            <span className="text-gray-500 ml-2">{event.details}</span>
                          )}
                          <span className="text-gray-400 text-xs ml-2">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedConv(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
