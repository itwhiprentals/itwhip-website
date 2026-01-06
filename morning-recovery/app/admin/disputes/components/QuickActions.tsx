// app/admin/disputes/components/QuickActions.tsx

'use client'

import { useState } from 'react'

interface QuickActionsProps {
 dispute: any
 onStatusChange: (status: string) => void
 onRefresh: () => void
}

export function QuickActions({ dispute, onStatusChange, onRefresh }: QuickActionsProps) {
 const [showActions, setShowActions] = useState(false)
 const [sendingEmail, setSendingEmail] = useState(false)
 const [callHost, setCallHost] = useState(false)

 const handleSendEmail = async (recipient: 'guest' | 'host') => {
   setSendingEmail(true)
   try {
     const email = recipient === 'guest' 
       ? dispute.booking.guestEmail 
       : dispute.booking.host.email
     
     const subject = `Re: Dispute for Booking ${dispute.booking.bookingCode}`
     
     // In production, this would trigger an email API
     window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`
     
   } catch (error) {
     console.error('Failed to send email:', error)
   } finally {
     setSendingEmail(false)
     setShowActions(false)
   }
 }

 const handleCallHost = () => {
   if (dispute.booking.host.phone) {
     setCallHost(true)
     window.location.href = `tel:${dispute.booking.host.phone}`
     setTimeout(() => {
       setCallHost(false)
       setShowActions(false)
     }, 2000)
   }
 }

 const getAvailableActions = () => {
   const actions = []
   
   if (dispute.status === 'OPEN') {
     actions.push({
       label: 'Start Investigation',
       icon: 'search',
       action: () => {
         onStatusChange('INVESTIGATING')
         setShowActions(false)
       },
       color: 'amber'
     })
   }
   
   if (dispute.status === 'INVESTIGATING') {
     actions.push({
       label: 'Mark as Resolved',
       icon: 'check',
       action: () => {
         onStatusChange('RESOLVED')
         setShowActions(false)
       },
       color: 'green'
     })
   }
   
   if (dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED') {
     actions.push({
       label: 'Email Guest',
       icon: 'mail',
       action: () => handleSendEmail('guest'),
       color: 'blue'
     })
     
     actions.push({
       label: 'Email Host',
       icon: 'mail',
       action: () => handleSendEmail('host'),
       color: 'blue'
     })
     
     if (dispute.booking.host.phone) {
       actions.push({
         label: 'Call Host',
         icon: 'phone',
         action: handleCallHost,
         color: 'green'
       })
     }
   }
   
   actions.push({
     label: 'Refresh',
     icon: 'refresh',
     action: () => {
       onRefresh()
       setShowActions(false)
     },
     color: 'gray'
   })
   
   return actions
 }

 const getIcon = (type: string) => {
   switch (type) {
     case 'search':
       return (
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
         </svg>
       )
     case 'check':
       return (
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
         </svg>
       )
     case 'mail':
       return (
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
         </svg>
       )
     case 'phone':
       return (
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
         </svg>
       )
     case 'refresh':
       return (
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
         </svg>
       )
     default:
       return null
   }
 }

 const getColorClasses = (color: string) => {
   switch (color) {
     case 'amber':
       return 'text-amber-700 bg-amber-50 hover:bg-amber-100'
     case 'green':
       return 'text-green-700 bg-green-50 hover:bg-green-100'
     case 'blue':
       return 'text-blue-700 bg-blue-50 hover:bg-blue-100'
     case 'gray':
       return 'text-gray-700 bg-gray-50 hover:bg-gray-100'
     default:
       return 'text-gray-700 bg-gray-50 hover:bg-gray-100'
   }
 }

 const availableActions = getAvailableActions()

 return (
   <div className="relative">
     <button
       onClick={() => setShowActions(!showActions)}
       className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
     >
       <span>Quick Actions</span>
       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
       </svg>
     </button>

     {showActions && (
       <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
         <div className="py-1">
           {availableActions.map((action, index) => (
             <button
               key={index}
               onClick={action.action}
               disabled={sendingEmail || callHost}
               className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${getColorClasses(action.color)}`}
             >
               {getIcon(action.icon)}
               <span>{action.label}</span>
             </button>
           ))}
         </div>
       </div>
     )}

     {/* Status Pills */}
     <div className="flex gap-2 mt-3">
       <span className={`px-3 py-1 text-xs font-medium rounded-full ${
         dispute.status === 'OPEN' 
           ? 'bg-red-100 text-red-800'
           : dispute.status === 'INVESTIGATING'
           ? 'bg-amber-100 text-amber-800'
           : dispute.status === 'RESOLVED'
           ? 'bg-green-100 text-green-800'
           : 'bg-gray-100 text-gray-800'
       }`}>
         {dispute.status}
       </span>
       
       {dispute.booking.tripEndedAt && (
         <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
           Trip Completed
         </span>
       )}
       
       {dispute.refundAmount && dispute.refundAmount > 0 && (
         <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
           Refund: ${dispute.refundAmount}
         </span>
       )}
     </div>
   </div>
 )
}