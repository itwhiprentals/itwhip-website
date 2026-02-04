// app/fleet/bookings/components/modals/ChangeCarModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { IoCloseOutline, IoCarOutline, IoSearchOutline } from 'react-icons/io5'
import { FleetBooking, formatCurrency } from '../../types'

interface AvailableCar {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  photoUrl?: string
  host: {
    id: string
    name: string
  }
}

interface ChangeCarModalProps {
  isOpen: boolean
  onClose: () => void
  booking: FleetBooking | null
  onSubmit: (bookingId: string, newCarId: string, data: { reason: string; adjustPrice: boolean; notes?: string }) => Promise<void>
  loading: boolean
}

export function ChangeCarModal({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading
}: ChangeCarModalProps) {
  const [cars, setCars] = useState<AvailableCar[]>([])
  const [loadingCars, setLoadingCars] = useState(false)
  const [selectedCar, setSelectedCar] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('')
  const [adjustPrice, setAdjustPrice] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && booking) {
      fetchAvailableCars()
    }
  }, [isOpen, booking])

  const fetchAvailableCars = async () => {
    if (!booking) return
    setLoadingCars(true)
    try {
      const response = await fetch(
        `/fleet/api/cars/available?key=phoenix-fleet-2847&startDate=${booking.startDate}&endDate=${booking.endDate}&excludeCarId=${booking.car.id}`
      )
      if (response.ok) {
        const data = await response.json()
        setCars(data.cars || [])
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoadingCars(false)
    }
  }

  if (!isOpen || !booking) return null

  const filteredCars = cars.filter(car =>
    `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(search.toLowerCase()) ||
    car.host.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedCar || !reason) return
    await onSubmit(booking.id, selectedCar, { reason, adjustPrice, notes })
    setSelectedCar(null)
    setReason('')
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoCarOutline className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Change Vehicle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Car */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Vehicle</p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center gap-3">
              {booking.car.photoUrl && (
                <img
                  src={booking.car.photoUrl}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  className="w-16 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.car.year} {booking.car.make} {booking.car.model}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(booking.dailyRate)}/day • Host: {booking.host.name}
                </p>
              </div>
            </div>
          </div>

          {/* Search Available Cars */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select New Vehicle</p>
            <div className="relative mb-3">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {loadingCars ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading available vehicles...</p>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No vehicles available for these dates
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCars.map((car) => (
                  <label
                    key={car.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedCar === car.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="car"
                      value={car.id}
                      checked={selectedCar === car.id}
                      onChange={() => setSelectedCar(car.id)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    {car.photoUrl && (
                      <img
                        src={car.photoUrl}
                        alt={`${car.make} ${car.model}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {car.year} {car.make} {car.model}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {formatCurrency(car.dailyRate)}/day • Host: {car.host.name}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a reason...</option>
              <option value="vehicle_unavailable">Original Vehicle Unavailable</option>
              <option value="maintenance_required">Vehicle Needs Maintenance</option>
              <option value="guest_upgrade">Guest Upgrade Request</option>
              <option value="guest_downgrade">Guest Downgrade Request</option>
              <option value="host_request">Host Requested Change</option>
              <option value="better_match">Better Vehicle Match Available</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Price Adjustment */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="adjustPrice"
              checked={adjustPrice}
              onChange={(e) => setAdjustPrice(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="adjustPrice" className="text-sm text-gray-700 dark:text-gray-300">
              Adjust booking price to match new vehicle rate
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedCar || !reason}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? 'Changing...' : 'Change Vehicle'}
          </button>
        </div>
      </div>
    </div>
  )
}
