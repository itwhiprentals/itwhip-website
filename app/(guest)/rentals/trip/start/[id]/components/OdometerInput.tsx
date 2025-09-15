// app/(guest)/rentals/trip/start/[id]/components/OdometerInput.tsx

'use client'

import { useState, useEffect } from 'react'
import { validateOdometer } from '@/app/lib/trip/validation'

interface OdometerInputProps {
 booking: any
 data: any
 onOdometerChange: (value: number) => void
}

export function OdometerInput({ booking, data, onOdometerChange }: OdometerInputProps) {
 const [odometerValue, setOdometerValue] = useState(data.odometer?.toString() || '')
 const [error, setError] = useState<string | null>(null)
 const [isValid, setIsValid] = useState(false)

 useEffect(() => {
   // Validate whenever value changes
   if (odometerValue) {
     const validation = validateOdometer(odometerValue)
     setIsValid(validation.valid)
     setError(validation.valid ? null : validation.error || null)
   } else {
     setIsValid(false)
     setError(null)
   }
 }, [odometerValue])

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const value = e.target.value.replace(/\D/g, '') // Only allow digits
   setOdometerValue(value)
   
   if (value) {
     const numValue = parseInt(value, 10)
     onOdometerChange(numValue)
   }
 }

 const formatOdometer = (value: string) => {
   // Add commas for thousands
   return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
 }

 return (
   <div className="space-y-6">
     {/* Instructions */}
     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
       <h3 className="text-sm font-medium text-amber-900 mb-2">Important</h3>
       <p className="text-sm text-amber-800">
         Record the exact odometer reading shown on the dashboard. This will be used to calculate your mileage.
       </p>
     </div>

     {/* Odometer Display */}
     <div className="text-center">
       <div className="mb-6">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
           <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
         </div>
         <h3 className="text-lg font-medium text-gray-900">Current Odometer Reading</h3>
         <p className="text-sm text-gray-600 mt-1">Enter the mileage shown on the dashboard</p>
       </div>

       {/* Input Field */}
       <div className="max-w-xs mx-auto">
         <div className="relative">
           <input
             type="text"
             value={odometerValue}
             onChange={handleChange}
             placeholder="Enter mileage"
             className={`w-full text-3xl font-bold text-center py-4 px-6 border-2 rounded-lg focus:outline-none transition-colors ${
               error 
                 ? 'border-red-500 bg-red-50' 
                 : isValid
                 ? 'border-green-500 bg-green-50'
                 : 'border-gray-300 focus:border-blue-500'
             }`}
             maxLength={6}
           />
           <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
             miles
           </span>
         </div>

         {/* Formatted Display */}
         {odometerValue && (
           <p className="mt-2 text-2xl font-medium text-gray-700">
             {formatOdometer(odometerValue)} miles
           </p>
         )}

         {/* Error Message */}
         {error && (
           <p className="mt-2 text-sm text-red-600">{error}</p>
         )}

         {/* Success Message */}
         {isValid && !error && (
           <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
             Valid reading
           </p>
         )}
       </div>
     </div>

     {/* Tips */}
     <div className="bg-gray-50 rounded-lg p-4">
       <h4 className="text-sm font-medium text-gray-900 mb-2">Tips</h4>
       <ul className="text-sm text-gray-600 space-y-1">
         <li className="flex items-start">
           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
           <span>Take a photo of the odometer for your records</span>
         </li>
         <li className="flex items-start">
           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
           <span>Make sure all digits are clearly visible</span>
         </li>
         <li className="flex items-start">
           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
           <span>Round to the nearest whole number if necessary</span>
         </li>
       </ul>
     </div>

     {/* Mileage Allowance Info */}
     <div className="border border-gray-200 rounded-lg p-4">
       <div className="flex items-center justify-between mb-2">
         <span className="text-sm font-medium text-gray-900">Daily Mileage Included</span>
         <span className="text-sm font-bold text-gray-900">200 miles/day</span>
       </div>
       <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Total Included for {booking.numberOfDays} days</span>
         <span className="text-sm font-bold text-green-600">{booking.numberOfDays * 200} miles</span>
       </div>
       <p className="text-xs text-gray-500 mt-2">
         Additional miles charged at $0.45/mile
       </p>
     </div>
   </div>
 )
}