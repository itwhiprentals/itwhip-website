// app/admin/disputes/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DisputeCard } from './components/DisputeCard'

interface Dispute {
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

export default function AdminDisputesPage() {
 const router = useRouter()
 const [disputes, setDisputes] = useState<Dispute[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('open')
 const [searchTerm, setSearchTerm] = useState('')
 const [stats, setStats] = useState({
   total: 0,
   open: 0,
   investigating: 0,
   resolved: 0,
   avgResolutionTime: 0
 })

 useEffect(() => {
   loadDisputes()
   loadStats()
 }, [])

 const loadDisputes = async () => {
   try {
     const response = await fetch('/api/admin/disputes')
     if (response.ok) {
       const data = await response.json()
       setDisputes(data.disputes || [])
     }
   } catch (error) {
     console.error('Failed to load disputes:', error)
   } finally {
     setLoading(false)
   }
 }

 const loadStats = async () => {
   try {
     const response = await fetch('/api/admin/disputes/stats')
     if (response.ok) {
       const data = await response.json()
       setStats(data.stats)
     }
   } catch (error) {
     console.error('Failed to load stats:', error)
   }
 }

 const handleDisputeClick = (disputeId: string) => {
   router.push(`/admin/disputes/${disputeId}`)
 }

 const handleStatusChange = async (disputeId: string, newStatus: string) => {
   try {
     const response = await fetch(`/api/admin/disputes/${disputeId}/status`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: newStatus })
     })
     
     if (response.ok) {
       loadDisputes()
       loadStats()
     }
   } catch (error) {
     console.error('Failed to update status:', error)
   }
 }

 // Filter disputes
 const filteredDisputes = disputes.filter(dispute => {
   const matchesFilter = filter === 'all' || dispute.status.toLowerCase() === filter
   const matchesSearch = searchTerm === '' || 
     dispute.booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
     dispute.booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     dispute.description.toLowerCase().includes(searchTerm.toLowerCase())
   
   return matchesFilter && matchesSearch
 })

 // Priority sorting (open disputes first, then by date)
 const sortedDisputes = [...filteredDisputes].sort((a, b) => {
   if (a.status === 'OPEN' && b.status !== 'OPEN') return -1
   if (b.status === 'OPEN' && a.status !== 'OPEN') return 1
   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
 })

 return (
   <div className="p-6 max-w-7xl mx-auto">
     {/* Header */}
     <div className="mb-6">
       <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
       <p className="text-gray-600">Review and resolve customer disputes</p>
     </div>

     {/* Stats Cards */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
       <div className="bg-white rounded-lg shadow p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Total Disputes</p>
             <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
           </div>
           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
             <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
           </div>
         </div>
       </div>

       <div className="bg-white rounded-lg shadow p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Open</p>
             <p className="text-2xl font-bold text-red-600">{stats.open}</p>
           </div>
           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
             <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
         </div>
       </div>

       <div className="bg-white rounded-lg shadow p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Investigating</p>
             <p className="text-2xl font-bold text-amber-600">{stats.investigating}</p>
           </div>
           <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
             <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
         </div>
       </div>

       <div className="bg-white rounded-lg shadow p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Avg Resolution</p>
             <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}h</p>
           </div>
           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
             <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
         </div>
       </div>
     </div>

     {/* Filters */}
     <div className="bg-white rounded-lg shadow p-4 mb-6">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <div className="flex gap-2">
           <button
             onClick={() => setFilter('all')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               filter === 'all' 
                 ? 'bg-gray-900 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             All
           </button>
           <button
             onClick={() => setFilter('open')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               filter === 'open' 
                 ? 'bg-red-600 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             Open
           </button>
           <button
             onClick={() => setFilter('investigating')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               filter === 'investigating' 
                 ? 'bg-amber-600 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             Investigating
           </button>
           <button
             onClick={() => setFilter('resolved')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               filter === 'resolved' 
                 ? 'bg-green-600 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             Resolved
           </button>
         </div>

         <div className="relative">
           <input
             type="text"
             placeholder="Search disputes..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
           />
           <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
         </div>
       </div>
     </div>

     {/* Disputes List */}
     {loading ? (
       <div className="text-center py-12">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
         <p className="mt-4 text-gray-600">Loading disputes...</p>
       </div>
     ) : sortedDisputes.length === 0 ? (
       <div className="bg-white rounded-lg shadow p-12 text-center">
         <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <p className="text-gray-600">No disputes found</p>
       </div>
     ) : (
       <div className="space-y-4">
         {sortedDisputes.map(dispute => (
           <DisputeCard
             key={dispute.id}
             dispute={dispute}
             onClick={() => handleDisputeClick(dispute.id)}
             onStatusChange={(newStatus) => handleStatusChange(dispute.id, newStatus)}
           />
         ))}
       </div>
     )}
   </div>
 )
}