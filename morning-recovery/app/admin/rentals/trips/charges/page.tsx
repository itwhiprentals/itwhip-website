// app/admin/rentals/trips/charges/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ChargeDetail {
 id: string
 bookingId: string
 bookingCode: string
 guestName: string
 guestEmail: string
 tripEndedAt: string
 
 // Original booking amounts
 subtotal: number
 totalAmount: number
 depositAmount: number
 
 // Trip data
 startMileage: number
 endMileage: number
 actualMiles: number
 includedMiles: number
 overageMiles: number
 
 fuelLevelStart: string
 fuelLevelEnd: string
 
 // Charges
 mileageCharge: number
 fuelCharge: number
 lateReturnCharge: number
 damageCharge: number
 cleaningCharge: number
 totalCharges: number
 
 // Payment status
 chargeStatus: 'pending' | 'processing' | 'charged' | 'failed' | 'refunded' | 'waived'
 chargeProcessedAt?: string
 stripeChargeId?: string
 refundAmount?: number
 refundReason?: string
 
 // Dispute
 hasDispute: boolean
 disputeStatus?: string
}

interface ChargeStats {
 totalPendingCharges: number
 totalProcessedToday: number
 totalRefundedThisWeek: number
 averageChargeAmount: number
 successRate: number
}

export default function TripChargesPage() {
 const router = useRouter()
 const [charges, setCharges] = useState<ChargeDetail[]>([])
 const [stats, setStats] = useState<ChargeStats>({
   totalPendingCharges: 0,
   totalProcessedToday: 0,
   totalRefundedThisWeek: 0,
   averageChargeAmount: 0,
   successRate: 0
 })
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState<'all' | 'pending' | 'charged' | 'failed' | 'refunded'>('pending')
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedCharges, setSelectedCharges] = useState<string[]>([])
 const [processingCharge, setProcessingCharge] = useState<string | null>(null)

 useEffect(() => {
   loadCharges()
 }, [filter])

 const loadCharges = async () => {
   try {
     const response = await fetch(`/api/admin/trips/charges?filter=${filter}`)
     if (response.ok) {
       const data = await response.json()
       setCharges(data.charges || [])
       setStats(data.stats || {})
     }
   } catch (error) {
     console.error('Failed to load charges:', error)
   } finally {
     setLoading(false)
   }
 }

 const processCharge = async (chargeId: string) => {
   setProcessingCharge(chargeId)
   try {
     const response = await fetch(`/api/admin/trips/charges/${chargeId}/process`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' }
     })
     
     if (response.ok) {
       await loadCharges()
     } else {
       const error = await response.json()
       alert(`Failed to process charge: ${error.message}`)
     }
   } catch (error) {
     console.error('Failed to process charge:', error)
   } finally {
     setProcessingCharge(null)
   }
 }

 const issueRefund = async (chargeId: string, amount: number, reason: string) => {
   const refundAmount = prompt(`Enter refund amount (max: $${amount.toFixed(2)}):`, amount.toString())
   if (!refundAmount) return
   
   const refundReason = prompt('Enter refund reason:', reason)
   if (!refundReason) return

   try {
     const response = await fetch(`/api/admin/trips/charges/${chargeId}/refund`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         amount: parseFloat(refundAmount),
         reason: refundReason
       })
     })
     
     if (response.ok) {
       await loadCharges()
     } else {
       const error = await response.json()
       alert(`Failed to issue refund: ${error.message}`)
     }
   } catch (error) {
     console.error('Failed to issue refund:', error)
   }
 }

 const waiveCharges = async (chargeId: string) => {
   const reason = prompt('Enter reason for waiving charges:')
   if (!reason) return

   try {
     const response = await fetch(`/api/admin/trips/charges/${chargeId}/waive`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ reason })
     })
     
     if (response.ok) {
       await loadCharges()
     }
   } catch (error) {
     console.error('Failed to waive charges:', error)
   }
 }

 const bulkProcessCharges = async () => {
   if (selectedCharges.length === 0) {
     alert('Please select charges to process')
     return
   }

   if (!confirm(`Process ${selectedCharges.length} charges?`)) return

   try {
     const response = await fetch('/api/admin/trips/charges/bulk-process', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ chargeIds: selectedCharges })
     })
     
     if (response.ok) {
       setSelectedCharges([])
       await loadCharges()
     }
   } catch (error) {
     console.error('Failed to bulk process charges:', error)
   }
 }

 const exportCharges = () => {
   const csv = [
     ['Booking Code', 'Guest', 'Mileage Charge', 'Fuel Charge', 'Late Charge', 'Total', 'Status'].join(','),
     ...charges.map(c => [
       c.bookingCode,
       c.guestName,
       c.mileageCharge.toFixed(2),
       c.fuelCharge.toFixed(2),
       c.lateReturnCharge.toFixed(2),
       c.totalCharges.toFixed(2),
       c.chargeStatus
     ].join(','))
   ].join('\n')

   const blob = new Blob([csv], { type: 'text/csv' })
   const url = window.URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `charges-${new Date().toISOString().split('T')[0]}.csv`
   a.click()
 }

 const filteredCharges = charges.filter(charge => {
   const matchesSearch = searchTerm === '' || 
     charge.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
     charge.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     charge.guestEmail.toLowerCase().includes(searchTerm.toLowerCase())
   
   return matchesSearch
 })

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Trip Charges Management</h1>
         <p className="text-gray-600">Process additional charges and refunds</p>
       </div>
       
       <button
         onClick={exportCharges}
         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
       >
         Export CSV
       </button>
     </div>

     {/* Stats Cards */}
     <div className="grid grid-cols-5 gap-4 mb-6">
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-amber-600">
           ${stats.totalPendingCharges.toFixed(2)}
         </div>
         <div className="text-sm text-gray-600">Pending Charges</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-green-600">
           ${stats.totalProcessedToday.toFixed(2)}
         </div>
         <div className="text-sm text-gray-600">Processed Today</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-red-600">
           ${stats.totalRefundedThisWeek.toFixed(2)}
         </div>
         <div className="text-sm text-gray-600">Refunded This Week</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-gray-600">
           ${stats.averageChargeAmount.toFixed(2)}
         </div>
         <div className="text-sm text-gray-600">Avg Charge</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-blue-600">
           {stats.successRate.toFixed(1)}%
         </div>
         <div className="text-sm text-gray-600">Success Rate</div>
       </div>
     </div>

     {/* Filters and Actions */}
     <div className="mb-6 flex gap-4">
       <input
         type="text"
         placeholder="Search by booking code or guest..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
       />
       
       <select
         value={filter}
         onChange={(e) => setFilter(e.target.value as any)}
         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
       >
         <option value="all">All Charges</option>
         <option value="pending">Pending</option>
         <option value="charged">Charged</option>
         <option value="failed">Failed</option>
         <option value="refunded">Refunded</option>
       </select>
       
       {selectedCharges.length > 0 && (
         <button
           onClick={bulkProcessCharges}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
         >
           Process Selected ({selectedCharges.length})
         </button>
       )}
     </div>

     {/* Charges Table */}
     <div className="bg-white rounded-lg shadow overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-50">
           <tr>
             {filter === 'pending' && (
               <th className="px-6 py-3 text-left">
                 <input
                   type="checkbox"
                   onChange={(e) => {
                     if (e.target.checked) {
                       setSelectedCharges(filteredCharges.map(c => c.id))
                     } else {
                       setSelectedCharges([])
                     }
                   }}
                 />
               </th>
             )}
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
               Booking
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
               Guest
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
               Charges Breakdown
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
               Total
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
               Status
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
               Actions
             </th>
           </tr>
         </thead>
         <tbody className="bg-white divide-y divide-gray-200">
           {filteredCharges.map((charge) => (
             <tr key={charge.id}>
               {filter === 'pending' && (
                 <td className="px-6 py-4">
                   <input
                     type="checkbox"
                     checked={selectedCharges.includes(charge.id)}
                     onChange={(e) => {
                       if (e.target.checked) {
                         setSelectedCharges([...selectedCharges, charge.id])
                       } else {
                         setSelectedCharges(selectedCharges.filter(id => id !== charge.id))
                       }
                     }}
                   />
                 </td>
               )}
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm font-medium text-gray-900">{charge.bookingCode}</div>
                 <div className="text-xs text-gray-500">
                   Ended: {new Date(charge.tripEndedAt).toLocaleDateString()}
                 </div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm text-gray-900">{charge.guestName}</div>
                 <div className="text-xs text-gray-500">{charge.guestEmail}</div>
               </td>
               <td className="px-6 py-4">
                 <div className="text-sm space-y-1">
                   {charge.mileageCharge > 0 && (
                     <div>Mileage: ${charge.mileageCharge.toFixed(2)} ({charge.overageMiles} mi)</div>
                   )}
                   {charge.fuelCharge > 0 && (
                     <div>Fuel: ${charge.fuelCharge.toFixed(2)}</div>
                   )}
                   {charge.lateReturnCharge > 0 && (
                     <div>Late Return: ${charge.lateReturnCharge.toFixed(2)}</div>
                   )}
                   {charge.damageCharge > 0 && (
                     <div>Damage: ${charge.damageCharge.toFixed(2)}</div>
                   )}
                 </div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm font-bold text-gray-900">
                   ${charge.totalCharges.toFixed(2)}
                 </div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                   charge.chargeStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                   charge.chargeStatus === 'charged' ? 'bg-green-100 text-green-800' :
                   charge.chargeStatus === 'failed' ? 'bg-red-100 text-red-800' :
                   charge.chargeStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                   'bg-gray-100 text-gray-800'
                 }`}>
                   {charge.chargeStatus}
                 </span>
                 {charge.hasDispute && (
                   <span className="ml-2 text-xs text-red-600">Disputed</span>
                 )}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm">
                 {charge.chargeStatus === 'pending' && (
                   <>
                     <button
                       onClick={() => processCharge(charge.id)}
                       disabled={processingCharge === charge.id}
                       className="text-blue-600 hover:text-blue-900 mr-3"
                     >
                       {processingCharge === charge.id ? 'Processing...' : 'Charge'}
                     </button>
                     <button
                       onClick={() => waiveCharges(charge.id)}
                       className="text-gray-600 hover:text-gray-900"
                     >
                       Waive
                     </button>
                   </>
                 )}
                 {charge.chargeStatus === 'charged' && (
                   <button
                     onClick={() => issueRefund(charge.id, charge.totalCharges, '')}
                     className="text-blue-600 hover:text-blue-900"
                   >
                     Refund
                   </button>
                 )}
                 {charge.hasDispute && (
                   <button
                     onClick={() => router.push(`/admin/disputes?bookingId=${charge.bookingId}`)}
                     className="text-red-600 hover:text-red-900 ml-3"
                   >
                     View Dispute
                   </button>
                 )}
               </td>
             </tr>
           ))}
         </tbody>
       </table>
       
       {filteredCharges.length === 0 && (
         <div className="text-center py-8 text-gray-500">
           No charges found
         </div>
       )}
     </div>
   </div>
 )
}