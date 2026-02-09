// app/fleet/bookings/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { FleetBooking, BookingFilters, BookingStats } from './types'
import {
  BookingsHeader,
  BookingsStats,
  BookingsTabs,
  BookingsFilters,
  BookingCard,
  BookingDetailDrawer,
  ApproveRejectModal,
  CancelBookingModal,
  ModifyBookingModal,
  ChangeCarModal,
  RequestDocumentsModal
} from './components'
import { IoAlertCircleOutline } from 'react-icons/io5'

export default function FleetBookingsPage() {
  const [bookings, setBookings] = useState<FleetBooking[]>([])
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    totalRevenue: 0,
    totalServiceFees: 0,
    pendingVerification: 0,
    activeBookings: 0,
    completedToday: 0,
    needsAttention: 0,
    todayBookings: 0,
    pendingReview: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState<BookingFilters>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  })

  // Selected booking for detail drawer
  const [selectedBooking, setSelectedBooking] = useState<FleetBooking | null>(null)
  const [showDetailDrawer, setShowDetailDrawer] = useState(false)

  // Modal states
  const [modalBooking, setModalBooking] = useState<FleetBooking | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showChangeCarModal, setShowChangeCarModal] = useState(false)
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false)
  const [approveRejectAction, setApproveRejectAction] = useState<'approve' | 'reject'>('approve')

  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBookings = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        key: 'phoenix-fleet-2847',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        tab: activeTab
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/fleet/api/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setStats({
          ...stats,
          ...data.stats,
          totalBookings: data.pagination.total
        })
        setPagination({
          ...pagination,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        })
      } else {
        setError('Failed to load bookings')
      }
    } catch (err) {
      console.error('Error loading bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeTab, filters, pagination.page, pagination.limit])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleRefresh = () => {
    setRefreshing(true)
    loadBookings()
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFilterChange = (newFilters: Partial<BookingFilters>) => {
    setFilters({ ...filters, ...newFilters })
    setPagination({ ...pagination, page: 1 })
  }

  const handleSelectBooking = (booking: FleetBooking) => {
    setSelectedBooking(booking)
    setShowDetailDrawer(true)
  }

  const handleBookingAction = (booking: FleetBooking, action: string) => {
    setModalBooking(booking)
    switch (action) {
      case 'approve':
        setApproveRejectAction('approve')
        setShowApproveModal(true)
        break
      case 'reject':
        setApproveRejectAction('reject')
        setShowRejectModal(true)
        break
      case 'cancel':
        setShowCancelModal(true)
        break
      case 'modify':
        setShowModifyModal(true)
        break
      case 'change_car':
        setShowChangeCarModal(true)
        break
      case 'request_documents':
        setShowRequestDocsModal(true)
        break
      case 'resend_email':
        handleResendEmail(booking.id)
        break
    }
  }

  const handleDrawerAction = (action: string) => {
    if (selectedBooking) {
      handleBookingAction(selectedBooking, action)
    }
  }

  // Resend email handler
  const handleResendEmail = async (bookingId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/fleet/api/bookings?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'resend_email' })
      })
      const json = await response.json()
      if (response.ok) {
        alert(json.message || 'Email resent successfully')
      } else {
        alert(json.error || 'Failed to resend email')
      }
    } catch (err) {
      console.error('Resend email error:', err)
      alert('Failed to resend email')
    } finally {
      setActionLoading(false)
    }
  }

  // Action handlers
  const handleApproveReject = async (bookingId: string, action: string, data: { notes?: string; reason?: string }) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/fleet/api/bookings?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action,
          notes: data.notes,
          reason: data.reason
        })
      })
      if (response.ok) {
        loadBookings()
        setShowApproveModal(false)
        setShowRejectModal(false)
        setShowDetailDrawer(false)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (bookingId: string, data: { reason: string; notes?: string; refundType?: string }) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/fleet/api/bookings?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action: 'cancel',
          reason: data.reason,
          notes: data.notes
        })
      })
      if (response.ok) {
        loadBookings()
        setShowCancelModal(false)
        setShowDetailDrawer(false)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleModify = async (bookingId: string, modifications: any) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/fleet/api/bookings?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action: 'modify',
          modifications
        })
      })
      if (response.ok) {
        loadBookings()
        setShowModifyModal(false)
        setShowDetailDrawer(false)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangeCar = async (bookingId: string, newCarId: string, data: any) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/fleet/api/bookings?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action: 'change_car',
          newCarId,
          ...data
        })
      })
      if (response.ok) {
        loadBookings()
        setShowChangeCarModal(false)
        setShowDetailDrawer(false)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestDocuments = async (bookingId: string, data: any) => {
    setActionLoading(true)
    try {
      // This would call a document request API
      console.log('Request documents:', bookingId, data)
      // For now, just close the modal
      setShowRequestDocsModal(false)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <BookingsHeader
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
            <IoAlertCircleOutline className="w-5 h-5" />
            {error}
          </div>
        )}

        <BookingsStats stats={stats} />

        <BookingsTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          stats={stats}
        />

        <BookingsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your filters or selecting a different tab
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onSelect={handleSelectBooking}
                onAction={handleBookingAction}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <BookingDetailDrawer
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        booking={selectedBooking}
        onAction={handleDrawerAction}
        actionLoading={actionLoading}
      />

      {/* Modals */}
      <ApproveRejectModal
        isOpen={showApproveModal || showRejectModal}
        onClose={() => {
          setShowApproveModal(false)
          setShowRejectModal(false)
        }}
        booking={modalBooking}
        action={approveRejectAction}
        onSubmit={handleApproveReject}
        loading={actionLoading}
      />

      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={modalBooking}
        onSubmit={handleCancel}
        loading={actionLoading}
      />

      <ModifyBookingModal
        isOpen={showModifyModal}
        onClose={() => setShowModifyModal(false)}
        booking={modalBooking}
        onSubmit={handleModify}
        loading={actionLoading}
      />

      <ChangeCarModal
        isOpen={showChangeCarModal}
        onClose={() => setShowChangeCarModal(false)}
        booking={modalBooking}
        onSubmit={handleChangeCar}
        loading={actionLoading}
      />

      <RequestDocumentsModal
        isOpen={showRequestDocsModal}
        onClose={() => setShowRequestDocsModal(false)}
        booking={modalBooking}
        onSubmit={handleRequestDocuments}
        loading={actionLoading}
      />
    </div>
  )
}
