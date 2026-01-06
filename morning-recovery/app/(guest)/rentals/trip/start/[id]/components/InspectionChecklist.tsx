// app/(guest)/rentals/trip/start/[id]/components/InspectionChecklist.tsx

'use client'

import { useState } from 'react'

interface InspectionChecklistProps {
 booking: any
 data: any
 onChecklistChange: (item: string, checked: boolean) => void
 onNotesChange: (notes: string) => void
}

export function InspectionChecklist({ booking, data, onChecklistChange, onNotesChange }: InspectionChecklistProps) {
 const [notes, setNotes] = useState(data.notes || '')

 const checklistItems = [
   { 
     id: 'keysReceived', 
     label: 'Keys and key fob received',
     description: 'Confirm you have all keys and they work'
   },
   { 
     id: 'exteriorChecked', 
     label: 'Exterior inspected for damage',
     description: 'Check for dents, scratches, or other damage'
   },
   { 
     id: 'interiorChecked', 
     label: 'Interior inspected and clean',
     description: 'Check seats, dashboard, and cleanliness'
   },
   { 
     id: 'lightsWork', 
     label: 'All lights functioning',
     description: 'Headlights, brake lights, turn signals'
   },
   { 
     id: 'tiresGood', 
     label: 'Tires in good condition',
     description: 'No visible damage, adequate tread'
   },
   { 
     id: 'noWarningLights', 
     label: 'No dashboard warning lights',
     description: 'Check engine, oil, battery indicators'
   }
 ]

 const handleCheckChange = (itemId: string, checked: boolean) => {
   onChecklistChange(itemId, checked)
 }

 const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   const value = e.target.value
   setNotes(value)
   onNotesChange(value)
 }

 const completedCount = Object.values(data.checklist).filter(Boolean).length
 const totalCount = checklistItems.length
 const allChecked = completedCount === totalCount

 return (
   <div className="space-y-6">
     {/* Instructions */}
     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
       <h3 className="text-sm font-medium text-green-900 mb-2">Pre-Trip Safety Check</h3>
       <p className="text-sm text-green-800">
         Please complete this safety checklist before starting your trip. This protects both you and the vehicle owner.
       </p>
     </div>

     {/* Progress Bar */}
     <div className="bg-gray-50 rounded-lg p-3">
       <div className="flex items-center justify-between mb-2">
         <span className="text-sm font-medium text-gray-700">
           Checklist Progress
         </span>
         <span className="text-sm font-medium text-gray-900">
           {completedCount} of {totalCount}
         </span>
       </div>
       <div className="w-full bg-gray-200 rounded-full h-2">
         <div
           className="bg-green-600 h-2 rounded-full transition-all duration-300"
           style={{ width: `${(completedCount / totalCount) * 100}%` }}
         />
       </div>
     </div>

     {/* Checklist Items */}
     <div className="space-y-3">
       {checklistItems.map((item) => {
         const isChecked = data.checklist[item.id] || false
         
         return (
           <div
             key={item.id}
             className={`border rounded-lg p-4 transition-all ${
               isChecked 
                 ? 'border-green-500 bg-green-50' 
                 : 'border-gray-300 bg-white'
             }`}
           >
             <label className="flex items-start cursor-pointer">
               <div className="flex items-center h-5">
                 <input
                   type="checkbox"
                   checked={isChecked}
                   onChange={(e) => handleCheckChange(item.id, e.target.checked)}
                   className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                 />
               </div>
               <div className="ml-3 flex-1">
                 <span className={`text-sm font-medium ${
                   isChecked ? 'text-green-900' : 'text-gray-900'
                 }`}>
                   {item.label}
                 </span>
                 <p className={`text-xs mt-1 ${
                   isChecked ? 'text-green-700' : 'text-gray-500'
                 }`}>
                   {item.description}
                 </p>
               </div>
               {isChecked && (
                 <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               )}
             </label>
           </div>
         )
       })}
     </div>

     {/* Additional Notes */}
     <div>
       <label className="block text-sm font-medium text-gray-900 mb-2">
         Additional Notes (Optional)
       </label>
       <textarea
         value={notes}
         onChange={handleNotesChange}
         placeholder="Note any existing damage, concerns, or special conditions..."
         rows={4}
         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
       />
       <p className="text-xs text-gray-500 mt-1">
         Document any pre-existing damage or concerns for your protection
       </p>
     </div>

     {/* Completion Status */}
     {allChecked && (
       <div className="bg-green-100 border border-green-300 rounded-lg p-4">
         <div className="flex items-center">
           <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <div>
             <p className="text-sm font-medium text-green-900">Checklist Complete</p>
             <p className="text-sm text-green-700">You're ready to start your trip!</p>
           </div>
         </div>
       </div>
     )}

     {/* Warning if not complete */}
     {!allChecked && (
       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
         <p className="text-sm text-amber-800">
           Please complete all checklist items before starting your trip. This ensures the vehicle is safe to drive.
         </p>
       </div>
     )}
   </div>
 )
}