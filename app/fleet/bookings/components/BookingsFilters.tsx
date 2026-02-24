// app/fleet/bookings/components/BookingsFilters.tsx
'use client'

import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5'
import { BookingFilters } from '../types'

interface BookingsFiltersProps {
  filters: BookingFilters
  onFilterChange: (filters: Partial<BookingFilters>) => void
}

export function BookingsFilters({ filters, onFilterChange }: BookingsFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by booking code, guest name, email, or phone..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => onFilterChange({ status: e.target.value as any })}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No-Show</option>
          <option value="DISPUTE_REVIEW">Dispute Review</option>
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          placeholder="From Date"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          placeholder="To Date"
        />
      </div>
    </div>
  )
}
