// app/admin/rentals/trips/components/ChargesSummary.tsx

'use client'

interface ChargesSummaryProps {
 charges: {
   mileageCharge: number
   fuelCharge: number
   lateReturnCharge: number
   damageCharge: number
   cleaningCharge: number
   totalCharges: number
   overageMiles?: number
   lateHours?: number
 }
 booking: {
   bookingCode: string
   totalAmount: number
   depositAmount: number
 }
 onProcessCharge?: () => void
 onIssueRefund?: () => void
 onWaiveCharges?: () => void
 chargeStatus?: string
}

export function ChargesSummary({ 
 charges, 
 booking, 
 onProcessCharge, 
 onIssueRefund, 
 onWaiveCharges,
 chargeStatus = 'pending'
}: ChargesSummaryProps) {
 const hasCharges = charges.totalCharges > 0

 const getChargeBreakdown = () => {
   const items = []
   
   if (charges.mileageCharge > 0) {
     items.push({
       label: 'Mileage Overage',
       detail: `${charges.overageMiles || 0} miles`,
       amount: charges.mileageCharge
     })
   }
   
   if (charges.fuelCharge > 0) {
     items.push({
       label: 'Fuel Refill',
       detail: 'Not returned full',
       amount: charges.fuelCharge
     })
   }
   
   if (charges.lateReturnCharge > 0) {
     items.push({
       label: 'Late Return',
       detail: `${charges.lateHours || 0} hours late`,
       amount: charges.lateReturnCharge
     })
   }
   
   if (charges.damageCharge > 0) {
     items.push({
       label: 'Damage',
       detail: 'See inspection report',
       amount: charges.damageCharge
     })
   }
   
   if (charges.cleaningCharge > 0) {
     items.push({
       label: 'Excessive Cleaning',
       detail: 'Additional cleaning required',
       amount: charges.cleaningCharge
     })
   }
   
   return items
 }

 const getStatusBadge = () => {
   switch (chargeStatus) {
     case 'pending':
       return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Pending</span>
     case 'processing':
       return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Processing</span>
     case 'charged':
       return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Charged</span>
     case 'failed':
       return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Failed</span>
     case 'refunded':
       return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Refunded</span>
     case 'waived':
       return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Waived</span>
     default:
       return null
   }
 }

 return (
   <div className="bg-white rounded-lg shadow">
     <div className="p-4 border-b">
       <div className="flex justify-between items-center">
         <h3 className="font-semibold text-gray-900">Additional Charges</h3>
         {getStatusBadge()}
       </div>
       <p className="text-sm text-gray-600 mt-1">Booking {booking.bookingCode}</p>
     </div>

     <div className="p-4">
       {hasCharges ? (
         <>
           <div className="space-y-3">
             {getChargeBreakdown().map((item, index) => (
               <div key={index} className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-medium text-gray-900">{item.label}</p>
                   <p className="text-xs text-gray-500">{item.detail}</p>
                 </div>
                 <span className="text-sm font-medium text-gray-900">
                   ${item.amount.toFixed(2)}
                 </span>
               </div>
             ))}
           </div>

           <div className="mt-4 pt-3 border-t">
             <div className="flex justify-between items-center">
               <span className="font-semibold text-gray-900">Total Charges</span>
               <span className="text-lg font-bold text-gray-900">
                 ${charges.totalCharges.toFixed(2)}
               </span>
             </div>
             
             <div className="mt-2 text-xs text-gray-500">
               <div className="flex justify-between">
                 <span>Original Booking</span>
                 <span>${booking.totalAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Deposit Held</span>
                 <span>${booking.depositAmount.toFixed(2)}</span>
               </div>
             </div>
           </div>

           {chargeStatus === 'pending' && (
             <div className="mt-4 flex gap-2">
               {onProcessCharge && (
                 <button
                   onClick={onProcessCharge}
                   className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                 >
                   Process Charge
                 </button>
               )}
               {onWaiveCharges && (
                 <button
                   onClick={onWaiveCharges}
                   className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                 >
                   Waive
                 </button>
               )}
             </div>
           )}

           {chargeStatus === 'charged' && onIssueRefund && (
             <button
               onClick={onIssueRefund}
               className="w-full mt-4 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
             >
               Issue Refund
             </button>
           )}
         </>
       ) : (
         <div className="text-center py-6">
           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
             <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           <p className="text-sm text-gray-600">No additional charges</p>
           <p className="text-xs text-gray-500 mt-1">
             Trip completed without any extra fees
           </p>
         </div>
       )}
     </div>
   </div>
 )
}