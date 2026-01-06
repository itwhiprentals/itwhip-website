// app/admin/disputes/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EvidencePanel } from '../components/EvidencePanel'
import { QuickActions } from '../components/QuickActions'

interface DisputeDetail {
 id: string
 bookingId: string
 type: string
 description: string
 status: string
 resolution?: string
 createdAt: string
 resolvedAt?: string
 booking: {
   id: string
   bookingCode: string
   guestName?: string
   guestEmail?: string
   guestPhone?: string
   totalAmount: number
   startDate: string
   endDate: string
   tripStartedAt?: string
   tripEndedAt?: string
   startMileage?: number
   endMileage?: number
   car: {
     make: string
     model: string
     year: number
     dailyRate: number
   }
   host: {
     id: string
     name: string
     email: string
     phone?: string
   }
   messages: Array<{
     id: string
     message: string
     senderType: string
     createdAt: string
   }>
 }
}

export default function DisputeDetailPage() {
 const params = useParams()
 const router = useRouter()
 const disputeId = params.id as string

 const [dispute, setDispute] = useState<DisputeDetail | null>(null)
 const [loading, setLoading] = useState(true)
 const [activities, setActivities] = useState<any[]>([])
 const [suggestedRefunds, setSuggestedRefunds] = useState<any[]>([])
 const [resolution, setResolution] = useState('')
 const [refundAmount, setRefundAmount] = useState(0)
 const [adminNotes, setAdminNotes] = useState('')
 const [resolving, setResolving] = useState(false)

 useEffect(() => {
   loadDispute()
 }, [disputeId])

 const loadDispute = async () => {
   try {
     const response = await fetch(`/api/admin/disputes/${disputeId}`)
     if (response.ok) {
       const data = await response.json()
       setDispute(data.dispute)
       setActivities(data.activities || [])
       setSuggestedRefunds(data.suggestedRefunds || [])
     }
   } catch (error) {
     console.error('Failed to load dispute:', error)
   } finally {
     setLoading(false)
   }
 }

 const handleStatusChange = async (newStatus: string) => {
   try {
     const response = await fetch(`/api/admin/disputes/${disputeId}/status`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: newStatus })
     })
     
     if (response.ok) {
       loadDispute()
     }
   } catch (error) {
     console.error('Failed to update status:', error)
   }
 }

 const handleResolve = async () => {
   if (!resolution.trim()) {
     alert('Please enter a resolution')
     return
   }

   setResolving(true)
   try {
     const response = await fetch(`/api/rentals/bookings/${dispute?.bookingId}/dispute/resolve`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         disputeId,
         resolution,
         refundAmount,
         adminNotes,
         actionTaken: refundAmount > 0 ? 'refund_issued' : 'no_action'
       })
     })
     
     if (response.ok) {
       router.push('/admin/disputes?resolved=true')
     }
   } catch (error) {
     console.error('Failed to resolve dispute:', error)
   } finally {
     setResolving(false)
   }
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
         <p className="mt-4 text-gray-600">Loading dispute details...</p>
       </div>
     </div>
   )
 }

 if (!dispute) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <p className="text-red-600 mb-4">Dispute not found</p>
         <button
           onClick={() => router.push('/admin/disputes')}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg"
         >
           Back to Disputes
         </button>
       </div>
     </div>
   )
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     {/* Header */}
     <div className="mb-6">
       <button
         onClick={() => router.push('/admin/disputes')}
         className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
       >
         <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
         </svg>
         Back to Disputes
       </button>
       
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold text-gray-900">
             Dispute for Booking {dispute.booking.bookingCode}
           </h1>
           <p className="text-gray-600">
             {dispute.booking.guestName || dispute.booking.guestEmail}
           </p>
         </div>
         
         <QuickActions
           dispute={dispute}
           onStatusChange={handleStatusChange}
           onRefresh={loadDispute}
         />
       </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Main Content */}
       <div className="lg:col-span-2 space-y-6">
         {/* Dispute Details */}
         <div className="bg-white rounded-lg shadow p-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">Dispute Information</h2>
           
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium text-gray-500">Type</label>
               <p className="text-gray-900">{dispute.type}</p>
             </div>
             
             <div>
               <label className="text-sm font-medium text-gray-500">Description</label>
               <p className="text-gray-900">{dispute.description}</p>
             </div>
             
             <div>
               <label className="text-sm font-medium text-gray-500">Status</label>
               <p className="text-gray-900">{dispute.status}</p>
             </div>
             
             <div>
               <label className="text-sm font-medium text-gray-500">Created</label>
               <p className="text-gray-900">
                 {new Date(dispute.createdAt).toLocaleString()}
               </p>
             </div>
           </div>
         </div>

         {/* Evidence Panel */}
         <EvidencePanel
           bookingId={dispute.bookingId}
           messages={dispute.booking.messages}
         />

         {/* Resolution Form (if not resolved) */}
         {dispute.status !== 'RESOLVED' && (
           <div className="bg-white rounded-lg shadow p-6">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Resolution
                 </label>
                 <textarea
                   value={resolution}
                   onChange={(e) => setResolution(e.target.value)}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   placeholder="Explain the resolution..."
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Refund Amount (if applicable)
                 </label>
                 <input
                   type="number"
                   value={refundAmount}
                   onChange={(e) => setRefundAmount(Number(e.target.value))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   placeholder="0.00"
                   step="0.01"
                 />
                 {suggestedRefunds.length > 0 && (
                   <div className="mt-2 space-y-1">
                     <p className="text-xs text-gray-500">Suggested refunds:</p>
                     {suggestedRefunds.map((item, index) => (
                       <button
                         key={index}
                         onClick={() => setRefundAmount(item.amount)}
                         className="text-xs text-blue-600 hover:text-blue-700 mr-3"
                       >
                         {item.label}: ${item.amount}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Internal Notes
                 </label>
                 <textarea
                   value={adminNotes}
                   onChange={(e) => setAdminNotes(e.target.value)}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   placeholder="Notes for internal use..."
                 />
               </div>
               
               <button
                 onClick={handleResolve}
                 disabled={resolving}
                 className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
               >
                 {resolving ? 'Resolving...' : 'Resolve Dispute'}
               </button>
             </div>
           </div>
         )}
       </div>

       {/* Sidebar */}
       <div className="space-y-6">
         {/* Booking Details */}
         <div className="bg-white rounded-lg shadow p-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
           
           <div className="space-y-3 text-sm">
             <div className="flex justify-between">
               <span className="text-gray-500">Vehicle</span>
               <span className="font-medium">
                 {dispute.booking.car.year} {dispute.booking.car.make} {dispute.booking.car.model}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-500">Dates</span>
               <span className="font-medium">
                 {new Date(dispute.booking.startDate).toLocaleDateString()} - 
                 {new Date(dispute.booking.endDate).toLocaleDateString()}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-500">Total Amount</span>
               <span className="font-medium">${dispute.booking.totalAmount}</span>
             </div>
             {dispute.booking.startMileage && dispute.booking.endMileage && (
               <div className="flex justify-between">
                 <span className="text-gray-500">Miles Driven</span>
                 <span className="font-medium">
                   {dispute.booking.endMileage - dispute.booking.startMileage}
                 </span>
               </div>
             )}
           </div>
         </div>

         {/* Contact Information */}
         <div className="bg-white rounded-lg shadow p-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
           
           <div className="space-y-3">
             <div>
               <p className="text-sm text-gray-500">Guest</p>
               <p className="font-medium">{dispute.booking.guestName}</p>
               <p className="text-sm text-gray-600">{dispute.booking.guestEmail}</p>
               {dispute.booking.guestPhone && (
                 <p className="text-sm text-gray-600">{dispute.booking.guestPhone}</p>
               )}
             </div>
             
             <div>
               <p className="text-sm text-gray-500">Host</p>
               <p className="font-medium">{dispute.booking.host.name}</p>
               <p className="text-sm text-gray-600">{dispute.booking.host.email}</p>
               {dispute.booking.host.phone && (
                 <p className="text-sm text-gray-600">{dispute.booking.host.phone}</p>
               )}
             </div>
           </div>
         </div>

         {/* Activity Log */}
         <div className="bg-white rounded-lg shadow p-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
           
           <div className="space-y-2">
             {activities.map((activity, index) => (
               <div key={index} className="text-sm">
                 <p className="font-medium">{activity.action}</p>
                 <p className="text-gray-500">
                   {new Date(activity.createdAt).toLocaleString()}
                 </p>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}