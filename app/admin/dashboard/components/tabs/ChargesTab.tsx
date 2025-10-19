// app/admin/dashboard/components/tabs/ChargesTab.tsx
'use client'

import { IoCashOutline } from 'react-icons/io5'

interface ChargeData {
  id: string
  bookingCode: string
  guestName: string
  totalCharges: number
  mileageCharge: number
  fuelCharge: number
  lateReturnCharge: number
  chargeStatus: string
}

interface RentalStats {
  pendingCharges?: number
  averageChargeAmount?: number
  failedCharges?: number
}

interface ChargesTabProps {
  pendingCharges: ChargeData[]
  stats: RentalStats
}

export default function ChargesTab({ pendingCharges, stats }: ChargesTabProps) {
  return (
    <div className="space-y-6">
      {/* Charges Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Charges</p>
          <p className="text-2xl font-bold text-orange-600">
            ${pendingCharges.reduce((sum, c) => sum + c.totalCharges, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">To Process</p>
          <p className="text-2xl font-bold">{pendingCharges.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Charge</p>
          <p className="text-2xl font-bold">${stats.averageChargeAmount?.toFixed(0) || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failedCharges || 0}</p>
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Additional Charges</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fuel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingCharges.map(charge => (
                <tr key={charge.id}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{charge.bookingCode}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{charge.guestName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">${charge.mileageCharge.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">${charge.fuelCharge.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">${charge.lateReturnCharge.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">${charge.totalCharges.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Charge
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                        Waive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingCharges.length === 0 && (
            <div className="p-12 text-center">
              <IoCashOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No pending charges</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}