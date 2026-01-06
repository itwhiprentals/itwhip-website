// app/(guest)/rentals/trip/start/[id]/components/FuelSelector.tsx

'use client'

import { useState, useEffect } from 'react'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'

interface FuelSelectorProps {
 booking: any
 data: any
 onFuelChange: (level: string) => void
}

export function FuelSelector({ booking, data, onFuelChange }: FuelSelectorProps) {
 const [selectedLevel, setSelectedLevel] = useState(data.fuelLevel || '')

 const handleSelect = (level: string) => {
   setSelectedLevel(level)
   onFuelChange(level)
 }

 const getFuelIcon = (level: string) => {
   const fillPercent = {
     'Empty': 0,
     '1/4': 25,
     '1/2': 50,
     '3/4': 75,
     'Full': 100
   }[level] || 0

   return (
     <div className="relative w-12 h-16">
       <svg className="w-12 h-16" viewBox="0 0 48 64" fill="none">
         {/* Fuel pump outline */}
         <rect x="8" y="8" width="32" height="48" rx="4" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
         <rect x="16" y="4" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
         
         {/* Fuel level fill */}
         <rect 
           x="12" 
           y={52 - (40 * fillPercent / 100)} 
           width="24" 
           height={40 * fillPercent / 100} 
           rx="2" 
           fill="currentColor"
           className={fillPercent > 25 ? 'text-green-500' : fillPercent > 0 ? 'text-amber-500' : 'text-red-500'}
         />
       </svg>
     </div>
   )
 }

 return (
   <div className="space-y-6">
     {/* Instructions */}
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
       <h3 className="text-sm font-medium text-blue-900 mb-2">Fuel Level Check</h3>
       <p className="text-sm text-blue-800">
         Select the current fuel level as shown on the dashboard. The car should be returned with the same fuel level to avoid refueling charges.
       </p>
     </div>

     {/* Fuel Level Options */}
     <div>
       <h3 className="text-lg font-medium text-gray-900 text-center mb-4">Select Current Fuel Level</h3>
       <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
         {TRIP_CONSTANTS.FUEL_LEVELS.map((level) => (
           <button
             key={level}
             onClick={() => handleSelect(level)}
             className={`relative p-4 rounded-lg border-2 transition-all ${
               selectedLevel === level
                 ? 'border-blue-500 bg-blue-50 shadow-md'
                 : 'border-gray-300 bg-white hover:border-gray-400'
             }`}
           >
             <div className="flex flex-col items-center">
               {getFuelIcon(level)}
               <span className={`mt-2 text-sm font-medium ${
                 selectedLevel === level ? 'text-blue-700' : 'text-gray-700'
               }`}>
                 {level}
               </span>
             </div>
             {selectedLevel === level && (
               <div className="absolute top-2 right-2">
                 <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
               </div>
             )}
           </button>
         ))}
       </div>
     </div>

     {/* Selected Level Display */}
     {selectedLevel && (
       <div className="bg-gray-50 rounded-lg p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Selected Fuel Level</p>
             <p className="text-lg font-semibold text-gray-900">{selectedLevel}</p>
           </div>
           <div className="text-right">
             <p className="text-sm text-gray-600">Return Requirement</p>
             <p className="text-lg font-semibold text-gray-900">Same Level</p>
           </div>
         </div>
       </div>
     )}

     {/* Refueling Policy */}
     <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
       <h4 className="text-sm font-medium text-amber-900 mb-2">Refueling Policy</h4>
       <ul className="text-sm text-amber-800 space-y-1">
         <li className="flex items-start">
           <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
           <span>Return with same fuel level or higher</span>
         </li>
         <li className="flex items-start">
           <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
           <span>Refueling service fee: $75 if returned with less fuel</span>
         </li>
         <li className="flex items-start">
           <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
           <span>Keep your fuel receipt for any disputes</span>
         </li>
       </ul>
     </div>

     {/* Visual Guide */}
     <div className="bg-gray-50 rounded-lg p-4">
       <p className="text-xs text-gray-500 text-center">
         Tip: Take a photo of the fuel gauge for your records
       </p>
     </div>
   </div>
 )
}