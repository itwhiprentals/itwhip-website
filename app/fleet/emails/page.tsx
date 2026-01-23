// app/fleet/emails/page.tsx
// Fleet dashboard email search and management

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface EmailLog {
  id: string
  referenceId: string
  recipientEmail: string
  recipientName: string | null
  subject: string
  emailType: string
  status: string
  sentAt: string | null
  createdAt: string
  openedAt: string | null
  clickedAt: string | null
  relatedType: string | null
  relatedId: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const EMAIL_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'GUEST_INVITE', label: 'Guest Invite' },
  { value: 'HOST_INVITE', label: 'Host Invite' },
  { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'EMAIL_VERIFICATION', label: 'Email Verification' },
  { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmation' },
  { value: 'BOOKING_REMINDER', label: 'Booking Reminder' },
  { value: 'PAYMENT_RECEIPT', label: 'Payment Receipt' },
  { value: 'WELCOME', label: 'Welcome' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'SENT', label: 'Sent' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'OPENED', label: 'Opened' },
  { value: 'CLICKED', label: 'Clicked' },
  { value: 'BOUNCED', label: 'Bounced' },
  { value: 'FAILED', label: 'Failed' },
]

export default function FleetEmailsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [emailType, setEmailType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('key', 'phoenix-fleet-2847')
      params.set('page', page.toString())
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (emailType) params.set('type', emailType)
      if (status) params.set('status', status)

      const res = await fetch(`/api/fleet/emails?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setEmails(data.emails || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [page, emailType, status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchEmails()
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatEmailType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return 'bg-green-100 text-green-700'
      case 'OPENED':
      case 'CLICKED':
        return 'bg-blue-100 text-blue-700'
      case 'BOUNCED':
      case 'FAILED':
        return 'bg-red-100 text-red-700'
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/fleet" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Email Logs</h1>
                <p className="text-sm text-gray-500">Search and track all sent emails</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {pagination && `${pagination.total} emails`}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email, name, or reference ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <select
              value={emailType}
              onChange={(e) => { setEmailType(e.target.value); setPage(1) }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {EMAIL_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No emails found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Reference</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Recipient</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Subject</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Sent</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {emails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a
                          href={`/verify-email?ref=${email.referenceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-orange-600 hover:text-orange-700"
                        >
                          {email.referenceId}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{email.recipientName || '-'}</div>
                          <div className="text-sm text-gray-500">{email.recipientEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{formatEmailType(email.emailType)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 truncate max-w-[200px] block">{email.subject}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(email.sentAt || email.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {email.relatedType === 'guest_prospect' && email.relatedId && (
                          <Link
                            href={`/fleet/guest-prospects`}
                            className="text-sm text-orange-600 hover:text-orange-700"
                          >
                            View Prospect
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
