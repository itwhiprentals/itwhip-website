// app/admin/disputes/components/DisputeCard.tsx

'use client'

import { useState } from 'react'

interface DisputeCardProps {
 dispute: {
   id: string
   bookingId: string
   type: string
   description: string
   status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
   resolution?: string
   createdAt: string
   resolvedAt?: string
   booking: {
     bookingCode: string
     guestName?: string
     guestEmail?: string
     totalAmount: number
     car: {
       make: string
       model: string
       year: number
     }
     host: {
       name: string
       email: string
     }
   }
 }
 onClick: () => void
 onStatusChange: (newStatus: string) => void
}

export function DisputeCard({ dispute, onClick, onStatusChange }: DisputeCardProps) {
 const [showQuickActions, setShowQuickActions] = useState(false)

 const getStatusColor = (status: string) => {
   switch (status) {
     case 'OPEN':
       return 'bg-red-100 text-red-800 border-red-200'
     case 'INVESTIGATING':
       return 'bg-amber-100 text-amber-800 border-amber-200'
     case 'RESOLVED':
       return 'bg-green-100 text-green-800 border-green-200'
     case 'CLOSED':
       return 'bg-gray-100 text-gray-800 border-gray-200'
     default:
       return 'bg-gray-100 text-gray-800 border-gray-200'
   }
 }

 const getTimeSinceCreated = () => {
   const created = new Date(dispute.createdAt)
   const now = new Date()
   const diffMs = now.getTime() - created.getTime()
   const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
   
   if (diffHours < 1) {
     const diffMins = Math.floor(diffMs / (1000 * 60))
     return `${diffMins} minutes ago`
   } else if (diffHours < 24) {
     return `${diffHours} hours ago`
   } else {
     const diffDays = Math.floor(diffHours / 24)
     return `${diffDays} days ago`
   }
 }

 const getResolutionTime = () => {
   if (!dispute.resolvedAt) return null
   
   const created = new Date(dispute.createdAt)
   const resolved = new Date(dispute.resolvedAt)
   const diffMs = resolved.getTime() - created.getTime()
   const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
   
   if (diffHours < 24) {
     return `Resolved in ${diffHours} hours`
   } else {
     const diffDays = Math.floor(diffHours / 24)
     return `Resolved in ${diffDays} days`
   }
 }

 const getPriorityIndicator = () => {
   const created = new Date(dispute.createdAt)
   const now = new Date()
   const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
   
   if (dispute.status === 'OPEN' && hoursSinceCreated > 1) {
     return 'high'
   } else if (dispute.status === 'INVESTIGATING' && hoursSinceCreated > 24) {
     return 'medium'
   }
   return 'normal'
 }

 const priority = getPriorityIndicator()

 return (
   <div 
     className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
       priority === 'high' ? 'ring-2 ring-red-500' : ''
     }`}
     onClick={onClick}
   >
     <div className="p-6">
       {/* Header */}
       <div className="flex items-start justify-between mb-4">
         <div className="flex items-start space-x-3">
           {/* Priority Indicator */}
           {priority === 'high' && (
             <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
           )}
           
           <div>
             <div className="flex items-center space-x-2">
               <h3 className="text-lg font-semibold text-gray-900">
                 Booking {dispute.booking.bookingCode}
               </h3>
               <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(dispute.status)}`}>
                 {dispute.status}
               </span>
             </div>
             <p className="text-sm text-gray-600 mt-1">
               {dispute.booking.guestName || dispute.booking.guestEmail || 'Guest'}
             </p>
           </div>
         </div>

         {/* Quick Actions */}
         <div className="relative">
           <button
             onClick={(e) => {
               e.stopPropagation()
               setShowQuickActions(!showQuickActions)
             }}
             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
           >
             <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
             </svg>
           </button>
           
           {showQuickActions && (
             <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
               {dispute.status === 'OPEN' && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation()
                     onStatusChange('INVESTIGATING')
                     setShowQuickActions(false)
                   }}
                   className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                 >
                   Mark as Investigating
                 </button>
               )}
               {dispute.status === 'INVESTIGATING' && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation()
                     onClick() // Go to resolution page
                     setShowQuickActions(false)
                   }}
                   className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                 >
                   Resolve Dispute
                 </button>
               )}
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   // Open email client
                   window.location.href = `mailto:${dispute.booking.guestEmail}?subject=Re: Dispute for Booking ${dispute.booking.bookingCode}`
                   setShowQuickActions(false)
                 }}
                 className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
               >
                 Email Guest
               </button>
             </div>
           )}
         </div>
       </div>

       {/* Details Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         <div>
           <p className="text-sm text-gray-500">Vehicle</p>
           <p className="text-sm font-medium text-gray-900">
             {dispute.booking.car.year} {dispute.booking.car.make} {dispute.booking.car.model}
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-500">Host</p>
           <p className="text-sm font-medium text-gray-900">{dispute.booking.host.name}</p>
         </div>
         <div>
           <p className="text-sm text-gray-500">Dispute Type</p>
           <p className="text-sm font-medium text-gray-900">{dispute.type}</p>
         </div>
         <div>
           <p className="text-sm text-gray-500">Amount</p>
           <p className="text-sm font-medium text-gray-900">
             ${dispute.booking.totalAmount.toFixed(2)}
           </p>
         </div>
       </div>

       {/* Description */}
       <div className="mb-4">
         <p className="text-sm text-gray-500 mb-1">Description</p>
         <p className="text-sm text-gray-900 line-clamp-2">{dispute.description}</p>
       </div>

       {/* Resolution (if resolved) */}
       {dispute.resolution && (
         <div className="mb-4 p-3 bg-green-50 rounded-lg">
           <p className="text-sm text-gray-500 mb-1">Resolution</p>
           <p className="text-sm text-gray-900">{dispute.resolution}</p>
           {dispute.resolvedAt && (
             <p className="text-xs text-gray-500 mt-1">{getResolutionTime()}</p>
           )}
         </div>
       )}

       {/* Footer */}
       <div className="flex items-center justify-between text-xs text-gray-500">
         <span>{getTimeSinceCreated()}</span>
         
         {priority === 'high' && dispute.status === 'OPEN' && (
           <span className="text-red-600 font-medium">Requires immediate attention</span>
         )}
         
         {dispute.status === 'INVESTIGATING' && (
           <span className="text-amber-600">Under review</span>
         )}
       </div>
     </div>
   </div>
 )
}