// app/(guest)/rentals/trip/end/[id]/components/DisputeSelector.tsx

'use client'

import { useState } from 'react'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'

interface DisputeSelectorProps {
 booking: any
 data: any
 charges: any
 onDisputeSelect: (disputes: string[]) => void
}

export function DisputeSelector({ booking, data, charges, onDisputeSelect }: DisputeSelectorProps) {
 const [selectedDisputes, setSelectedDisputes] = useState<string[]>(data.disputes || [])
 const [customDispute, setCustomDispute] = useState('')
 const [showCustomInput, setShowCustomInput] = useState(false)

 const handleDisputeToggle = (reason: string) => {
   const updated = selectedDisputes.includes(reason)
     ? selectedDisputes.filter(d => d !== reason)
     : [...selectedDisputes, reason]
   
   setSelectedDisputes(updated)
   onDisputeSelect(updated)
 }

 const handleCustomDispute = () => {
   if (customDispute.trim()) {
     const updated = [...selectedDisputes, customDispute.trim()]
     setSelectedDisputes(updated)
     onDisputeSelect(updated)
     setCustomDispute('')
     setShowCustomInput(false)
   }
 }

 const hasCharges = charges && charges.total > 0

 return (
   <div className="space-y-6">
     {/* Header */}
     <div className="text-center">
       <h3 className="text-lg font-medium text-gray-900">Review Charges</h3>
       <p className="text-sm text-gray-600 mt-1">
         Do you have any concerns about the charges?
       </p>
     </div>

     {hasCharges ? (
       <>
         {/* Dispute Options */}
         <div className="space-y-3">
           <p className="text-sm font-medium text-gray-700">
             Select any items you'd like to dispute:
           </p>
           
           {TRIP_CONSTANTS.DISPUTE_REASONS.map((reason) => (
             <label
               key={reason}
               className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                 selectedDisputes.includes(reason)
                   ? 'border-amber-500 bg-amber-50'
                   : 'border-gray-300 hover:border-gray-400'
               }`}
             >
               <input
                 type="checkbox"
                 checked={selectedDisputes.includes(reason)}
                 onChange={() => handleDisputeToggle(reason)}
                 className="mr-3"
               />
               <span className="text-sm">{reason}</span>
             </label>
           ))}

           {/* Custom Dispute Option */}
           {!showCustomInput ? (
             <button
               onClick={() => setShowCustomInput(true)}
               className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
             >
               + Add custom dispute reason
             </button>
           ) : (
             <div className="p-3 border border-gray-300 rounded-lg">
               <input
                 type="text"
                 value={customDispute}
                 onChange={(e) => setCustomDispute(e.target.value)}
                 placeholder="Enter your dispute reason..."
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                 autoFocus
               />
               <div className="flex gap-2 mt-2">
                 <button
                   onClick={handleCustomDispute}
                   className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
                 >
                   Add
                 </button>
                 <button
                   onClick={() => {
                     setShowCustomInput(false)
                     setCustomDispute('')
                   }}
                   className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                 >
                   Cancel
                 </button>
               </div>
             </div>
           )}
         </div>

         {/* Selected Disputes Summary */}
         {selectedDisputes.length > 0 && (
           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
             <h4 className="text-sm font-medium text-amber-900 mb-2">
               Disputes to be Submitted ({selectedDisputes.length})
             </h4>
             <ul className="space-y-1">
               {selectedDisputes.map((dispute, index) => (
                 <li key={index} className="flex items-center text-sm text-amber-800">
                   <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></span>
                   {dispute}
                 </li>
               ))}
             </ul>
             <p className="text-xs text-amber-700 mt-3">
               These will be reviewed within {TRIP_CONSTANTS.DISPUTE_RESOLUTION_HOURS} hours
             </p>
           </div>
         )}
       </>
     ) : (
       <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
         <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <h4 className="text-base font-medium text-green-900 mb-1">No Additional Charges</h4>
         <p className="text-sm text-green-700">
           Your trip was completed without any extra fees!
         </p>
       </div>
     )}

     {/* Dispute Process Info */}
     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
       <h4 className="text-sm font-medium text-gray-900 mb-2">Dispute Process</h4>
       <ol className="text-sm text-gray-600 space-y-1">
         <li>1. Submit your dispute with this form</li>
         <li>2. We'll review within {TRIP_CONSTANTS.DISPUTE_RESOLUTION_HOURS} hours</li>
         <li>3. Charges are held until disputes are resolved</li>
         <li>4. You'll receive email updates on the resolution</li>
       </ol>
     </div>

     {/* Continue Without Dispute */}
     {hasCharges && selectedDisputes.length === 0 && (
       <div className="text-center">
         <p className="text-sm text-gray-600">
           No disputes? Your charges will be processed as shown.
         </p>
       </div>
     )}
   </div>
 )
}