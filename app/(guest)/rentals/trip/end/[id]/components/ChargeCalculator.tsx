// app/(guest)/rentals/trip/end/[id]/components/ChargeCalculator.tsx

'use client'

import { useState, useEffect } from 'react'
import { formatCharge } from '@/app/lib/trip/calculations'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'

interface ChargeCalculatorProps {
 booking: any
 data: any
 charges: any
 onDamageReport?: (damage: { reported: boolean; description: string; photos: string[] }) => void
}

export function ChargeCalculator({ booking, data, charges, onDamageReport }: ChargeCalculatorProps) {
 const [showDamageForm, setShowDamageForm] = useState(false)
 const [damageDescription, setDamageDescription] = useState('')
 const [selectedDamages, setSelectedDamages] = useState<string[]>([])
 const [customDamageAmount, setCustomDamageAmount] = useState(0)

 useEffect(() => {
   if (onDamageReport && (damageDescription || selectedDamages.length > 0)) {
     onDamageReport({
       reported: true,
       description: damageDescription,
       photos: [] // Would be handled by photo capture in real implementation
     })
   }
 }, [damageDescription, selectedDamages])

 const toggleDamage = (damageId: string) => {
   setSelectedDamages(prev => 
     prev.includes(damageId) 
       ? prev.filter(id => id !== damageId)
       : [...prev, damageId]
   )
 }

 const calculateDamageCost = () => {
   let total = 0
   selectedDamages.forEach(damageId => {
     const damage = TRIP_CONSTANTS.DAMAGE_PRESETS[damageId as keyof typeof TRIP_CONSTANTS.DAMAGE_PRESETS]
     if (damage) {
       total += damage.cost
     }
   })
   return total + customDamageAmount
 }

 const totalDamageCost = calculateDamageCost()
 const grandTotal = (charges?.total || 0) + totalDamageCost

 if (!charges) {
   return (
     <div className="text-center py-8">
       <p className="text-gray-600">Please complete odometer and fuel readings first</p>
     </div>
   )
 }

 return (
   <div className="space-y-6">
     {/* Trip Summary */}
     <div className="bg-gray-50 rounded-lg p-4">
       <h3 className="text-sm font-medium text-gray-900 mb-3">Trip Summary</h3>
       <div className="space-y-2 text-sm">
         <div className="flex justify-between">
           <span className="text-gray-600">Miles Driven</span>
           <span className="font-medium">{charges.mileage.used} miles</span>
         </div>
         <div className="flex justify-between">
           <span className="text-gray-600">Miles Included</span>
           <span className="font-medium">{charges.mileage.included} miles</span>
         </div>
         {charges.mileage.overage > 0 && (
           <div className="flex justify-between text-amber-600">
             <span>Overage Miles</span>
             <span className="font-medium">{charges.mileage.overage} miles</span>
           </div>
         )}
       </div>
     </div>

     {/* Charges Breakdown */}
     <div className="border border-gray-200 rounded-lg p-4">
       <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Charges</h3>
       
       {charges.breakdown.length > 0 ? (
         <div className="space-y-2">
           {charges.breakdown.map((item: any, index: number) => (
             <div key={index} className="flex justify-between text-sm">
               <span className="text-gray-600">{item.label}</span>
               <span className="font-medium text-gray-900">{formatCharge(item.amount)}</span>
             </div>
           ))}
         </div>
       ) : (
         <p className="text-sm text-green-600">No additional charges</p>
       )}

       {/* Subtotal */}
       {charges.total > 0 && (
         <div className="mt-3 pt-3 border-t border-gray-200">
           <div className="flex justify-between">
             <span className="font-medium">Subtotal</span>
             <span className="font-semibold">{formatCharge(charges.total)}</span>
           </div>
         </div>
       )}
     </div>

     {/* Damage Report Section */}
     <div className="border border-gray-200 rounded-lg p-4">
       <div className="flex items-center justify-between mb-3">
         <h3 className="text-sm font-medium text-gray-900">Damage Report</h3>
         <button
           onClick={() => setShowDamageForm(!showDamageForm)}
           className="text-sm text-blue-600 hover:text-blue-700"
         >
           {showDamageForm ? 'Cancel' : 'Report Damage'}
         </button>
       </div>

       {showDamageForm ? (
         <div className="space-y-4">
           {/* Preset Damage Options */}
           <div>
             <p className="text-sm text-gray-600 mb-2">Select any damage types:</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
               {Object.entries(TRIP_CONSTANTS.DAMAGE_PRESETS).map(([id, damage]) => (
                 <label
                   key={id}
                   className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                     selectedDamages.includes(id)
                       ? 'border-red-500 bg-red-50'
                       : 'border-gray-300 hover:border-gray-400'
                   }`}
                 >
                   <input
                     type="checkbox"
                     checked={selectedDamages.includes(id)}
                     onChange={() => toggleDamage(id)}
                     className="mr-2"
                   />
                   <div className="flex-1">
                     <span className="text-sm">{damage.name}</span>
                     {damage.cost > 0 && (
                       <span className="ml-2 text-xs text-gray-500">
                         ({formatCharge(damage.cost)})
                       </span>
                     )}
                   </div>
                 </label>
               ))}
             </div>
           </div>

           {/* Description */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Damage Description
             </label>
             <textarea
               value={damageDescription}
               onChange={(e) => setDamageDescription(e.target.value)}
               placeholder="Describe the damage in detail..."
               rows={3}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
             />
           </div>

           {/* Custom Amount (if "other" is selected) */}
           {selectedDamages.includes('other') && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Estimated Cost
               </label>
               <input
                 type="number"
                 value={customDamageAmount}
                 onChange={(e) => setCustomDamageAmount(Number(e.target.value))}
                 placeholder="0.00"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
               />
             </div>
           )}

           {/* Damage Total */}
           {totalDamageCost > 0 && (
             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
               <div className="flex justify-between">
                 <span className="text-sm font-medium text-red-900">Damage Charges</span>
                 <span className="font-semibold text-red-900">{formatCharge(totalDamageCost)}</span>
               </div>
             </div>
           )}
         </div>
       ) : (
         <p className="text-sm text-gray-600">No damage reported</p>
       )}
     </div>

     {/* Grand Total */}
     <div className="bg-gray-900 text-white rounded-lg p-4">
       <div className="flex justify-between items-center">
         <div>
           <p className="text-sm text-gray-300">Total Additional Charges</p>
           <p className="text-xs text-gray-400 mt-1">Will be charged to your payment method</p>
         </div>
         <div className="text-right">
           <p className="text-2xl font-bold">{formatCharge(grandTotal)}</p>
           {grandTotal === 0 && (
             <p className="text-xs text-green-400 mt-1">No charges</p>
           )}
         </div>
       </div>
     </div>

     {/* Info Box */}
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
       <h4 className="text-sm font-medium text-blue-900 mb-2">Important Information</h4>
       <ul className="text-sm text-blue-800 space-y-1">
         <li>• Additional charges will be processed within 24-48 hours</li>
         <li>• You'll receive an email receipt once processed</li>
         <li>• You can dispute charges within 48 hours of trip completion</li>
       </ul>
     </div>
   </div>
 )
}