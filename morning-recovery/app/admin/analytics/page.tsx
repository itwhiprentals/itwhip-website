// app/admin/analytics/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AnalyticsOverview {
 revenue: {
   total: number
   thisMonth: number
   lastMonth: number
   growth: number
 }
 bookings: {
   total: number
   active: number
   completed: number
   cancelled: number
 }
 trips: {
   total: number
   averageDuration: number
   averageMileage: number
   overdueRate: number
 }
 hosts: {
   total: number
   active: number
   newThisMonth: number
   topPerformer: string
 }
 vehicles: {
   total: number
   active: number
   utilizationRate: number
   mostPopular: string
 }
}

export default function AnalyticsOverviewPage() {
 const router = useRouter()
 const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
 const [loading, setLoading] = useState(true)
 const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
 const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'bookings' | 'trips'>('revenue')

 useEffect(() => {
   loadAnalytics()
 }, [dateRange])

 const loadAnalytics = async () => {
   try {
     const response = await fetch(`/api/admin/analytics/overview?range=${dateRange}`)
     if (response.ok) {
       const data = await response.json()
       setOverview(data)
     }
   } catch (error) {
     console.error('Failed to load analytics:', error)
   } finally {
     setLoading(false)
   }
 }

 const exportData = () => {
   const data = {
     dateRange,
     exportedAt: new Date().toISOString(),
     overview
   }
   
   const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
   const url = window.URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.json`
   a.click()
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 if (!overview) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <p className="text-gray-600">Failed to load analytics data</p>
     </div>
   )
 }

 const getGrowthIndicator = (growth: number) => {
   if (growth > 0) {
     return (
       <span className="text-green-600 text-sm font-medium flex items-center">
         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
         </svg>
         +{growth.toFixed(1)}%
       </span>
     )
   } else if (growth < 0) {
     return (
       <span className="text-red-600 text-sm font-medium flex items-center">
         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
         </svg>
         {growth.toFixed(1)}%
       </span>
     )
   }
   return <span className="text-gray-500 text-sm">0%</span>
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
         <p className="text-gray-600">Platform performance metrics and insights</p>
       </div>
       
       <div className="flex gap-3">
         <select
           value={dateRange}
           onChange={(e) => setDateRange(e.target.value as any)}
           className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         >
           <option value="7d">Last 7 Days</option>
           <option value="30d">Last 30 Days</option>
           <option value="90d">Last 90 Days</option>
           <option value="1y">Last Year</option>
         </select>
         
         <button
           onClick={exportData}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
         >
           Export Data
         </button>
       </div>
     </div>

     {/* Key Metrics */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
       <div className="bg-white rounded-lg shadow p-6">
         <div className="flex items-center justify-between mb-2">
           <p className="text-sm text-gray-600">Total Revenue</p>
           {getGrowthIndicator(overview.revenue.growth)}
         </div>
         <p className="text-2xl font-bold text-gray-900">
           ${overview.revenue.total.toLocaleString()}
         </p>
         <p className="text-xs text-gray-500 mt-1">
           This month: ${overview.revenue.thisMonth.toLocaleString()}
         </p>
       </div>

       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Active Bookings</p>
         <p className="text-2xl font-bold text-blue-600">
           {overview.bookings.active}
         </p>
         <p className="text-xs text-gray-500 mt-1">
           Total: {overview.bookings.total}
         </p>
       </div>

       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Vehicle Utilization</p>
         <p className="text-2xl font-bold text-green-600">
           {overview.vehicles.utilizationRate.toFixed(1)}%
         </p>
         <p className="text-xs text-gray-500 mt-1">
           {overview.vehicles.active} of {overview.vehicles.total} active
         </p>
       </div>

       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Active Hosts</p>
         <p className="text-2xl font-bold text-purple-600">
           {overview.hosts.active}
         </p>
         <p className="text-xs text-gray-500 mt-1">
           New: +{overview.hosts.newThisMonth}
         </p>
       </div>

       <div className="bg-white rounded-lg shadow p-6">
         <p className="text-sm text-gray-600 mb-2">Overdue Rate</p>
         <p className={`text-2xl font-bold ${
           overview.trips.overdueRate > 10 ? 'text-red-600' : 'text-gray-900'
         }`}>
           {overview.trips.overdueRate.toFixed(1)}%
         </p>
         <p className="text-xs text-gray-500 mt-1">
           Avg duration: {overview.trips.averageDuration.toFixed(1)}h
         </p>
       </div>
     </div>

     {/* Navigation Cards */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <button
         onClick={() => router.push('/admin/analytics/trips')}
         className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
       >
         <div className="flex items-center justify-between mb-4">
           <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
             </svg>
           </div>
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
           </svg>
         </div>
         <h3 className="font-semibold text-gray-900 mb-1">Trip Analytics</h3>
         <p className="text-sm text-gray-600">
           Detailed trip metrics, patterns, and performance analysis
         </p>
       </button>

       <button
         onClick={() => router.push('/admin/analytics/revenue')}
         className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
       >
         <div className="flex items-center justify-between mb-4">
           <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
             <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
           </svg>
         </div>
         <h3 className="font-semibold text-gray-900 mb-1">Revenue Analytics</h3>
         <p className="text-sm text-gray-600">
           Financial performance, charges, and payout analysis
         </p>
       </button>

       <button
         onClick={() => router.push('/admin/rentals/reports')}
         className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
       >
         <div className="flex items-center justify-between mb-4">
           <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
             <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6" />
             </svg>
           </div>
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
           </svg>
         </div>
         <h3 className="font-semibold text-gray-900 mb-1">Custom Reports</h3>
         <p className="text-sm text-gray-600">
           Generate detailed reports and export data
         </p>
       </button>
     </div>

     {/* Quick Stats */}
     <div className="bg-white rounded-lg shadow p-6">
       <h3 className="font-semibold text-gray-900 mb-4">Platform Highlights</h3>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <div>
           <p className="text-sm text-gray-600">Most Popular Vehicle</p>
           <p className="font-medium text-gray-900">{overview.vehicles.mostPopular}</p>
         </div>
         <div>
           <p className="text-sm text-gray-600">Top Host</p>
           <p className="font-medium text-gray-900">{overview.hosts.topPerformer}</p>
         </div>
         <div>
           <p className="text-sm text-gray-600">Avg Trip Mileage</p>
           <p className="font-medium text-gray-900">{overview.trips.averageMileage.toFixed(0)} miles</p>
         </div>
         <div>
           <p className="text-sm text-gray-600">Completion Rate</p>
           <p className="font-medium text-gray-900">
             {((overview.bookings.completed / overview.bookings.total) * 100).toFixed(1)}%
           </p>
         </div>
       </div>
     </div>
   </div>
 )
}