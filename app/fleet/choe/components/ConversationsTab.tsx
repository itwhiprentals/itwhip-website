// app/fleet/choe/components/ConversationsTab.tsx

'use client'

import { useState, useEffect } from 'react'
import type { ConversationSummary, ConversationDetail } from '../types'
import OutcomeBadge from './OutcomeBadge'

interface ConversationsTabProps {
  conversations: ConversationSummary[]
  pagination: { page: number; total: number; totalPages: number }
  onPageChange: (page: number) => void
  apiKey: string
  pendingConversationId?: string | null
  onPendingHandled?: () => void
}

export default function ConversationsTab({ conversations, pagination, onPageChange, apiKey, pendingConversationId, onPendingHandled }: ConversationsTabProps) {
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [convDetail, setConvDetail] = useState<ConversationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [terminating, setTerminating] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [bulkTerminating, setBulkTerminating] = useState(false)

  // Auto-open conversation detail when navigated from Overview tab
  useEffect(() => {
    if (pendingConversationId) {
      loadConvDetail(pendingConversationId)
      onPendingHandled?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingConversationId])

  const terminateConversation = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this conversation? The user will be blocked from continuing.')) return
    setTerminating(true)
    try {
      const res = await fetch(`/fleet/api/choe/conversations/${id}/terminate?key=${apiKey}`, { method: 'POST' })
      if (res.ok) {
        // Refresh the detail and the table
        await loadConvDetail(id)
        onPageChange(pagination.page)
      }
    } catch {
      // Ignore
    } finally {
      setTerminating(false)
    }
  }

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (checkedIds.size === conversations.length) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(conversations.map(c => c.id)))
    }
  }

  const bulkTerminate = async () => {
    if (checkedIds.size === 0) return
    if (!confirm(`Terminate ${checkedIds.size} selected sessions?`)) return
    setBulkTerminating(true)
    try {
      const res = await fetch(`/fleet/api/choe/conversations/terminate-all?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(checkedIds), reason: 'Bulk termination from conversations tab' }),
      })
      if (res.ok) {
        setCheckedIds(new Set())
        onPageChange(pagination.page) // Refresh
      }
    } catch {
      // Ignore
    } finally {
      setBulkTerminating(false)
    }
  }

  const loadConvDetail = async (id: string) => {
    setSelectedConv(id)
    setConvDetail(null)
    setLoadingDetail(true)
    setDetailError(null)
    try {
      const res = await fetch(`/fleet/api/choe/conversations/${id}?key=${apiKey}`)
      if (!res.ok) {
        setDetailError(res.status === 404 ? 'Conversation not found' : 'Failed to load conversation')
        return
      }
      const data = await res.json()
      setConvDetail(data.data)
    } catch {
      setDetailError('Network error loading conversation')
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {checkedIds.size > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400 font-medium">
            {checkedIds.size} session{checkedIds.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={bulkTerminate}
            disabled={bulkTerminating}
            className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {bulkTerminating ? 'Terminating...' : `Terminate ${checkedIds.size} Selected`}
          </button>
        </div>
      )}

      {/* Conversations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-2 py-3 w-8">
                <input
                  type="checkbox"
                  checked={checkedIds.size === conversations.length && conversations.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
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
              >
                <td className="px-2 py-3 w-8" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checkedIds.has(conv.id)}
                    onChange={() => toggleCheck(conv.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 text-sm" onClick={() => loadConvDetail(conv.id)}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${conv.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {conv.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" onClick={() => loadConvDetail(conv.id)}>
                  {conv.location || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" onClick={() => loadConvDetail(conv.id)}>
                  {conv.messageCount}
                </td>
                <td className="px-4 py-3" onClick={() => loadConvDetail(conv.id)}>
                  <OutcomeBadge outcome={conv.outcome} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500" onClick={() => loadConvDetail(conv.id)}>
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
      {selectedConv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedConv(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {loadingDetail ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detailError ? (
              <div className="p-6 text-center">
                <p className="text-red-500 mb-4">{detailError}</p>
                <button
                  onClick={() => setSelectedConv(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            ) : convDetail ? (
              <>
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
                      <dd className="font-medium text-gray-900 dark:text-white">{(convDetail.totalTokens ?? 0).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Cost</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">${(convDetail.estimatedCost ?? 0).toFixed(6)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Duration</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{Math.round((convDetail.duration ?? 0) / 60)} min</dd>
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
                                    {msg.vehiclesReturned} cars
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
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <div>
                    {convDetail.outcome !== 'BLOCKED' && convDetail.outcome !== 'COMPLETED' && (
                      <button
                        onClick={() => terminateConversation(convDetail.id)}
                        disabled={terminating}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        {terminating ? 'Terminating...' : 'Terminate Session'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
