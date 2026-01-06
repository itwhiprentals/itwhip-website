// app/fleet/appeals/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IoCheckmarkCircle, IoCloseCircle, IoSearch, IoArrowBack } from 'react-icons/io5'

const FLEET_KEY = 'phoenix-fleet-2847'

interface Appeal {
  id: string
  guestId: string
  guest: {
    id: string
    name: string | null
    email: string | null
    profilePhotoUrl: string | null
    suspensionLevel: string | null
    warningCount: number
  }
  moderation: {
    id: string
    actionType: string
    suspensionLevel: string | null
    publicReason: string
    takenBy: string
    takenAt: string
  }
  reason: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED'
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
}

export default function FleetAppealsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const key = searchParams.get('key')

  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppeals, setSelectedAppeals] = useState<string[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    denied: 0
  })

  useEffect(() => {
    if (key === FLEET_KEY) {
      fetchAppeals()
    }
  }, [key, filter])

  const fetchAppeals = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' 
        ? `/fleet/api/appeals?key=${FLEET_KEY}`
        : `/fleet/api/appeals?key=${FLEET_KEY}&status=${filter.toUpperCase()}`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setAppeals(data.appeals || [])
        setStats(data.stats || {
          total: 0,
          pending: 0,
          underReview: 0,
          approved: 0,
          denied: 0
        })
      }
    } catch (error) {
      console.error('Error fetching appeals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReview = async (appealId: string, decision: 'APPROVED' | 'DENIED') => {
    try {
      const res = await fetch(`/fleet/api/appeals/${appealId}/review?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewedBy: 'admin@itwhip.com',
          reviewNotes: `Quick ${decision.toLowerCase()} from appeals hub`
        })
      })

      if (res.ok) {
        fetchAppeals()
        alert(`Appeal ${decision.toLowerCase()} successfully!`)
      }
    } catch (error) {
      console.error('Error reviewing appeal:', error)
      alert('Failed to review appeal')
    }
  }

  const handleBulkApprove = async () => {
    if (selectedAppeals.length === 0) return
    
    for (const appealId of selectedAppeals) {
      await handleQuickReview(appealId, 'APPROVED')
    }
    
    setSelectedAppeals([])
  }

  const filteredAppeals = appeals.filter(appeal => {
    const matchesSearch = 
      (appeal.guest?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appeal.guest?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const canBeReviewed = (appeal: Appeal) => {
    return appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW'
  }

  if (key !== FLEET_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
          <p className="text-gray-600">Invalid fleet key</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/fleet?key=${FLEET_KEY}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoArrowBack className="text-2xl text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Appeals Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Review and manage guest moderation appeals
                </p>
              </div>
            </div>
            
            <button
              onClick={fetchAppeals}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === 'all'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">All Appeals</div>
            </button>

            <button
              onClick={() => setFilter('pending')}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === 'pending'
                  ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
              }`}
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </button>

            <button
              onClick={() => setFilter('under_review')}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === 'under_review'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Under Review</div>
            </button>

            <button
              onClick={() => setFilter('approved')}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === 'approved'
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </button>

            <button
              onClick={() => setFilter('denied')}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === 'denied'
                  ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
              }`}
            >
              <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Denied</div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Bulk Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-800"
            />
          </div>

          {selectedAppeals.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve Selected ({selectedAppeals.length})
            </button>
          )}
        </div>

        {/* Appeals Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading appeals...</div>
          ) : filteredAppeals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No appeals found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAppeals(filteredAppeals.filter(a => canBeReviewed(a)).map(a => a.id))
                        } else {
                          setSelectedAppeals([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moderation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredAppeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4">
                      {canBeReviewed(appeal) && (
                        <input
                          type="checkbox"
                          checked={selectedAppeals.includes(appeal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAppeals([...selectedAppeals, appeal.id])
                            } else {
                              setSelectedAppeals(selectedAppeals.filter(id => id !== appeal.id))
                            }
                          }}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {appeal.guest.profilePhotoUrl && (
                          <img 
                            src={appeal.guest.profilePhotoUrl} 
                            alt={appeal.guest.name || 'Guest'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {appeal.guest.name || 'Unknown Guest'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appeal.guest.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <span className="font-medium">{appeal.moderation.actionType}</span>
                        {appeal.moderation.suspensionLevel && (
                          <span className="ml-2 text-red-600">({appeal.moderation.suspensionLevel})</span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {appeal.moderation.publicReason}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appeal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        appeal.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                        appeal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appeal.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(appeal.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {canBeReviewed(appeal) ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickReview(appeal.id, 'APPROVED')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                            title="Approve"
                          >
                            <IoCheckmarkCircle size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleQuickReview(appeal.id, 'DENIED')}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                            title="Deny"
                          >
                            <IoCloseCircle size={16} />
                            Deny
                          </button>
                          <a
                            href={`/fleet/guests/${appeal.guestId}?key=${FLEET_KEY}`}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            View Guest
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            appeal.status === 'APPROVED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {appeal.status}
                          </span>
                          <a
                            href={`/fleet/guests/${appeal.guestId}?key=${FLEET_KEY}`}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                          >
                            View Guest
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}