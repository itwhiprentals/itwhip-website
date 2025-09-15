// app/admin/analytics/revenue/page.tsx

'use client'

import { useState, useEffect } from 'react'

interface RevenueAnalytics {
 summary: {
   totalRevenue: number
   thisMonth: number
   lastMonth: number
   growthRate: number
   averageBookingValue: number
   additionalChargesRevenue: number
   refundedAmount: number
   netRevenue: number
 }
 breakdown: {
   bySource: Array<{ source: string; amount: number; percentage: number }>
   byHost: Array<{ host: string; revenue: number; trips: number }>
   byVehicleType: Array<{ type: string; revenue: number; trips: number }>
   byMonth: Array<{ month: string; revenue: number; bookings: number }>
 }
 charges: {
   mileageCharges: number
   fuelCharges: number
   lateCharges: number
   damageCharges: number
   cleaningCharges: number
   totalAdditionalCharges: number
   chargeSuccessRate: number
 }
 payouts: {
   pendingPayouts: number
   processedThisWeek: number
   averagePayoutTime: number
   totalHostEarnings: number
   platformCommission: number
 }
}

export default function RevenueAnalyticsPage() {
 const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
 const [loading, setLoading] = useState(true)
 const [dateRange, setDateRange] = useState<'30d' | '90d' | '1y'>('30d')
 const [selectedView, setSelectedView] = useState<'overview' | 'breakdown' | 'charges' | 'payouts'>('overview')

 useEffect(() => {
   loadRevenueAnalytics()
 }, [dateRange])

 const loadRevenueAnalytics = async () => {
   try {
     const response = await fetch(`/api/admin/analytics/revenue?range=${dateRange}`)
     if (response.ok) {
       const data = await response.json()
       setAnalytics(data)
     }
   } catch (error) {
     console.error('Failed to load revenue analytics:', error)
   } finally {
     setLoading(false)
   }
 }

 const exportFinancialReport = () => {
   if (!analytics) return
   
   const report = {
     generatedAt: new Date().toISOString(),
     dateRange,
     summary: analytics.summary,
     breakdown: analytics.breakdown,
     charges: analytics.charges,
     payouts: analytics.payouts
   }
   
   const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
   const url = window.URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `financial_report_${dateRange}_${new Date().toISOString().split('T')[0]}.json`
   a.click()
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 if (!analytics) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <p className="text-gray-600">Failed to load revenue analytics</p>
     </div>
   )
 }

 const formatCurrency = (amount: number) => {
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
     minimumFractionDigits: 0,
     maximumFractionDigits: 0
   }).format(amount)
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
         <p className="text-gray-600">Financial performance and revenue breakdown</p>
       </div>
       
       <div className="flex gap-3">
         <select
           value={dateRange}
           onChange={(e) => setDateRange(e.target.value as any)}
           className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         >
           <option value="30d">Last 30 Days</option>
           <option value="90d">Last 90 Days</option>
           <option value="1y">Last Year</option>
         </select>
         
         <button
           onClick={exportFinancialReport}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
         >
           Export Report
         </button>
       </div>
     </div>

     {/* Summary Cards */}
     <div className="grid grid-cols-4 gap-4 mb-6">
       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
         <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.totalRevenue)}</p>
         <p className={`text-sm mt-1 ${analytics.summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
           {analytics.summary.growthRate >= 0 ? '+' : ''}{analytics.summary.growthRate.toFixed(1)}% vs last period
         </p>
       </div>
       
       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Additional Charges</p>
         <p className="text-2xl font-bold text-amber-600">
           {formatCurrency(analytics.summary.additionalChargesRevenue)}
         </p>
         <p className="text-sm text-gray-500 mt-1">
           {((analytics.summary.additionalChargesRevenue / analytics.summary.totalRevenue) * 100).toFixed(1)}% of total
         </p>
       </div>
       
       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Refunded</p>
         <p className="text-2xl font-bold text-red-600">
           {formatCurrency(analytics.summary.refundedAmount)}
         </p>
         <p className="text-sm text-gray-500 mt-1">
           {((analytics.summary.refundedAmount / analytics.summary.totalRevenue) * 100).toFixed(1)}% refund rate
         </p>
       </div>
       
       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Net Revenue</p>
         <p className="text-2xl font-bold text-green-600">
           {formatCurrency(analytics.summary.netRevenue)}
         </p>
         <p className="text-sm text-gray-500 mt-1">
           After refunds & fees
         </p>
       </div>
     </div>

     {/* View Tabs */}
     <div className="border-b border-gray-200 mb-6">
       <nav className="-mb-px flex space-x-8">
         <button
           onClick={() => setSelectedView('overview')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'overview'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Overview
         </button>
         <button
           onClick={() => setSelectedView('breakdown')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'breakdown'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Breakdown
         </button>
         <button
           onClick={() => setSelectedView('charges')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'charges'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Additional Charges
         </button>
         <button
           onClick={() => setSelectedView('payouts')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'payouts'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Payouts
         </button>
       </nav>
     </div>

     {/* Content */}
     {selectedView === 'overview' && (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Revenue by Source</h3>
           <div className="space-y-3">
             {analytics.breakdown.bySource.map((source, index) => (
               <div key={index}>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">{source.source}</span>
                   <span className="font-medium">{formatCurrency(source.amount)}</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2">
                   <div
                     className="bg-blue-600 h-2 rounded-full"
                     style={{ width: `${source.percentage}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Monthly Trend</h3>
           <div className="h-48 flex items-end space-x-2">
             {analytics.breakdown.byMonth.slice(-6).map((month, index) => (
               <div key={index} className="flex-1">
                 <div 
                   className="bg-green-500 hover:bg-green-600 transition-colors"
                   style={{ 
                     height: `${(month.revenue / Math.max(...analytics.breakdown.byMonth.map(m => m.revenue))) * 100}%` 
                   }}
                 />
                 <p className="text-xs text-gray-500 text-center mt-1">{month.month}</p>
               </div>
             ))}
           </div>
         </div>
       </div>
     )}

     {selectedView === 'breakdown' && (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Top Revenue Hosts</h3>
           <div className="space-y-3">
             {analytics.breakdown.byHost.slice(0, 10).map((host, index) => (
               <div key={index} className="flex justify-between items-center">
                 <div>
                   <p className="text-sm font-medium text-gray-900">{host.host}</p>
                   <p className="text-xs text-gray-500">{host.trips} trips</p>
                 </div>
                 <p className="text-sm font-bold text-gray-900">{formatCurrency(host.revenue)}</p>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Revenue by Vehicle Type</h3>
           <div className="space-y-3">
             {analytics.breakdown.byVehicleType.map((vehicle, index) => (
               <div key={index} className="flex justify-between items-center">
                 <div>
                   <p className="text-sm font-medium text-gray-900 capitalize">{vehicle.type}</p>
                   <p className="text-xs text-gray-500">{vehicle.trips} trips</p>
                 </div>
                 <p className="text-sm font-bold text-gray-900">{formatCurrency(vehicle.revenue)}</p>
               </div>
             ))}
           </div>
         </div>
       </div>
     )}

     {selectedView === 'charges' && (
       <div className="bg-white rounded-lg shadow p-6">
         <h3 className="font-semibold text-gray-900 mb-4">Additional Charges Analysis</h3>
         
         <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
           <div>
             <p className="text-sm text-gray-600">Mileage Charges</p>
             <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.charges.mileageCharges)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Fuel Charges</p>
             <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.charges.fuelCharges)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Late Return Charges</p>
             <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.charges.lateCharges)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Damage Charges</p>
             <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.charges.damageCharges)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Cleaning Charges</p>
             <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.charges.cleaningCharges)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Success Rate</p>
             <p className="text-xl font-bold text-green-600">{analytics.charges.chargeSuccessRate.toFixed(1)}%</p>
           </div>
         </div>

         <div className="border-t pt-4">
           <div className="flex justify-between items-center">
             <p className="font-semibold text-gray-900">Total Additional Charges</p>
             <p className="text-2xl font-bold text-gray-900">
               {formatCurrency(analytics.charges.totalAdditionalCharges)}
             </p>
           </div>
         </div>
       </div>
     )}

     {selectedView === 'payouts' && (
       <div className="bg-white rounded-lg shadow p-6">
         <h3 className="font-semibold text-gray-900 mb-4">Payout Management</h3>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
           <div>
             <p className="text-sm text-gray-600">Pending Payouts</p>
             <p className="text-xl font-bold text-amber-600">{formatCurrency(analytics.payouts.pendingPayouts)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Processed This Week</p>
             <p className="text-xl font-bold text-green-600">{formatCurrency(analytics.payouts.processedThisWeek)}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Avg Processing Time</p>
             <p className="text-xl font-bold text-gray-900">{analytics.payouts.averagePayoutTime.toFixed(1)} days</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Platform Commission</p>
             <p className="text-xl font-bold text-purple-600">{formatCurrency(analytics.payouts.platformCommission)}</p>
           </div>
         </div>

         <div className="border-t pt-4">
           <div className="flex justify-between items-center">
             <p className="font-semibold text-gray-900">Total Host Earnings</p>
             <p className="text-2xl font-bold text-gray-900">
               {formatCurrency(analytics.payouts.totalHostEarnings)}
             </p>
           </div>
           <p className="text-sm text-gray-500 mt-1">
             After platform commission of 15-20%
           </p>
         </div>
       </div>
     )}
   </div>
 )
}