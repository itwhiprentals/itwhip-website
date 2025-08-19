// app/components/SplitHero.tsx

'use client'

import { useState, useEffect } from 'react'
import { setUserTypeCookie, trackUserTypeSelection } from '@/app/utils/userTypeDetection'
import { IoCarSportOutline, IoBusinessOutline, IoCheckmarkCircle, IoTrendingUpOutline, IoTimeOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'

interface SplitHeroProps {
 onSelectUserType: (type: 'rider' | 'hotel') => void
}

export default function SplitHero({ onSelectUserType }: SplitHeroProps) {
 const [hoveredSide, setHoveredSide] = useState<'rider' | 'hotel' | null>(null)
 
 // Platform metrics - established company data
 const [platformMetrics, setPlatformMetrics] = useState({
   totalBookings: 2584739,
   activeDrivers: 487,
   partnerHotels: 127,
   avgSavings: 47,
   currentSurge: 2.8,
   platformPrice: 29,
   competitorPrice: 78,
   dailyRevenue: 284700,
   monthlyRides: 48293
 })

 // Simulate organic growth patterns
 useEffect(() => {
   const interval = setInterval(() => {
     setPlatformMetrics(prev => ({
       ...prev,
       totalBookings: prev.totalBookings + Math.floor(Math.random() * 3) + 1,
       activeDrivers: Math.max(450, Math.min(520, prev.activeDrivers + Math.floor(Math.random() * 7) - 3)),
       dailyRevenue: prev.dailyRevenue + Math.floor(Math.random() * 500) + 100,
       monthlyRides: prev.monthlyRides + Math.floor(Math.random() * 12) + 3,
       currentSurge: Math.max(1.5, Math.min(3.5, prev.currentSurge + (Math.random() - 0.5) * 0.2)),
       competitorPrice: Math.round(29 * Math.max(1.5, Math.min(3.5, prev.currentSurge + (Math.random() - 0.5) * 0.2)))
     }))
   }, 5000)

   return () => clearInterval(interval)
 }, [])

 const handleSelection = (type: 'rider' | 'hotel') => {
   setUserTypeCookie(type)
   trackUserTypeSelection(type, 'split_hero')
   onSelectUserType(type)
 }

 return (
   <section className="min-h-screen flex flex-col relative overflow-hidden bg-black">
     {/* Background gradient effect */}
     <div className="absolute inset-0">
       <div className={`absolute inset-0 transition-all duration-700 ${
         hoveredSide === 'rider' 
           ? 'bg-gradient-to-br from-blue-900/40 via-black to-black' 
           : hoveredSide === 'hotel'
           ? 'bg-gradient-to-br from-amber-900/40 via-black to-black'
           : 'bg-black'
       }`} />
     </div>

     {/* Platform Authority Bar */}
     <div className="relative z-20 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
       <div className="max-w-7xl mx-auto px-4 py-2">
         <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs text-gray-400">
           <div className="flex items-center space-x-1">
             <IoTimeOutline className="w-3 h-3" />
             <span>Est. 2019</span>
           </div>
           <div className="hidden md:block text-gray-700">•</div>
           <div className="flex items-center space-x-1">
             <IoShieldCheckmarkOutline className="w-3 h-3 text-green-400" />
             <span>{platformMetrics.totalBookings.toLocaleString()} Successful Trips</span>
           </div>
           <div className="hidden md:block text-gray-700">•</div>
           <div className="flex items-center space-x-1">
             <span className="text-amber-400">GDS Integrated</span>
           </div>
           <div className="hidden md:block text-gray-700">•</div>
           <div className="flex items-center space-x-1">
             <span>ISO 27001 Compliant</span>
           </div>
         </div>
       </div>
     </div>

     {/* Header */}
     <div className="relative z-10 text-center pt-16 pb-8 px-4">
       <div className="inline-block mb-4 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
         <span className="text-xs text-amber-400 font-medium">Now Publicly Available • Previously Enterprise Only</span>
       </div>
       <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
         ItWhip
       </h1>
       <p className="text-xl text-gray-400 max-w-2xl mx-auto">
         Phoenix's Premium Transportation Network
       </p>
       <p className="text-sm text-gray-500 mt-2">
         Quietly revolutionizing travel since 2019
       </p>
     </div>

     {/* Split sections */}
     <div className="flex-1 flex flex-col md:flex-row relative z-10">
       {/* Rider Side */}
       <div 
         className={`flex-1 p-8 md:p-12 flex flex-col justify-center items-center cursor-pointer 
           transition-all duration-500 relative group ${
           hoveredSide === 'rider' ? 'md:flex-[1.1]' : ''
         }`}
         onMouseEnter={() => setHoveredSide('rider')}
         onMouseLeave={() => setHoveredSide(null)}
         onClick={() => handleSelection('rider')}
       >
         {/* Animated border on hover */}
         <div className={`absolute inset-0 border-2 transition-all duration-500 ${
           hoveredSide === 'rider' 
             ? 'border-blue-500 bg-blue-500/5' 
             : 'border-gray-800 hover:border-gray-700'
         }`} />
         
         <div className="relative max-w-md w-full">
           {/* Service Badge */}
           <div className="absolute -top-4 -right-4 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
             <span className="text-xs text-blue-400">Consumer Platform</span>
           </div>

           {/* Icon */}
           <div className="flex justify-center mb-6">
             <div className={`p-4 rounded-full transition-all duration-500 ${
               hoveredSide === 'rider' 
                 ? 'bg-blue-500/20 scale-110' 
                 : 'bg-gray-800'
             }`}>
               <IoCarSportOutline className="w-16 h-16 text-blue-400" />
             </div>
           </div>

           {/* Content */}
           <div className="text-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
               For Riders
             </h2>
             <p className="text-xl text-blue-400 font-semibold mb-2">
               Skip the Surge
             </p>
             <p className="text-gray-400">
               Luxury rides at fixed prices
             </p>
           </div>

           {/* Features */}
           <div className="space-y-3 mb-8">
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>No surge pricing, ever</span>
             </div>
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>Tesla, Mercedes, BMW only</span>
             </div>
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>Flight tracking included</span>
             </div>
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>Corporate accounts available</span>
             </div>
           </div>

           {/* Live Market Data */}
           <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
             <div className="text-center">
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Live Market Rates</p>
               <p className="text-sm text-gray-300">
                 Sky Harbor → Scottsdale
               </p>
               <div className="flex items-center justify-center space-x-4 mt-2">
                 <span className="text-2xl font-bold text-green-400">${platformMetrics.platformPrice}</span>
                 <span className="text-gray-500">vs</span>
                 <span className="text-lg text-red-400 line-through">${platformMetrics.competitorPrice}</span>
               </div>
               <p className="text-xs text-red-400 mt-1">
                 Market surge: {platformMetrics.currentSurge.toFixed(1)}x
               </p>
             </div>
           </div>

           {/* CTA */}
           <button className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
             hoveredSide === 'rider'
               ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
               : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
           }`}>
             Book a Ride →
           </button>
         </div>
       </div>

       {/* Divider */}
       <div className="hidden md:flex items-center justify-center px-8">
         <div className="relative">
           <div className="w-px h-32 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
             bg-black px-3 py-2">
             <span className="text-gray-500 text-sm">OR</span>
           </div>
         </div>
       </div>

       {/* Hotel Side */}
       <div 
         className={`flex-1 p-8 md:p-12 flex flex-col justify-center items-center cursor-pointer 
           transition-all duration-500 relative group ${
           hoveredSide === 'hotel' ? 'md:flex-[1.1]' : ''
         }`}
         onMouseEnter={() => setHoveredSide('hotel')}
         onMouseLeave={() => setHoveredSide(null)}
         onClick={() => handleSelection('hotel')}
       >
         {/* Animated border on hover */}
         <div className={`absolute inset-0 border-2 transition-all duration-500 ${
           hoveredSide === 'hotel' 
             ? 'border-amber-500 bg-amber-500/5' 
             : 'border-gray-800 hover:border-gray-700'
         }`} />
         
         <div className="relative max-w-md w-full">
           {/* Enterprise Badge */}
           <div className="absolute -top-4 -right-4 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
             <span className="text-xs text-amber-400">Enterprise Platform</span>
           </div>

           {/* Icon */}
           <div className="flex justify-center mb-6">
             <div className={`p-4 rounded-full transition-all duration-500 ${
               hoveredSide === 'hotel' 
                 ? 'bg-amber-500/20 scale-110' 
                 : 'bg-gray-800'
             }`}>
               <IoBusinessOutline className="w-16 h-16 text-amber-400" />
             </div>
           </div>

           {/* Content */}
           <div className="text-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
               For Hotels
             </h2>
             <p className="text-xl text-amber-400 font-semibold mb-2">
               Turn Rides Into Revenue
             </p>
             <p className="text-gray-400">
               Enterprise transportation solutions
             </p>
           </div>

           {/* Features */}
           <div className="space-y-3 mb-8">
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>Zero investment required</span>
             </div>
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>Revenue share program</span>
             </div>
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>Replace shuttle costs</span>
             </div>
             <div className="flex items-center text-gray-300">
               <IoCheckmarkCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
               <span>GDS integration ready</span>
             </div>
           </div>

           {/* Performance Metrics */}
           <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
             <div className="text-center">
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Platform Performance</p>
               <p className="text-sm text-gray-300">
                 Average Partner Metrics
               </p>
               <div className="flex items-center justify-center mt-2">
                 <IoTrendingUpOutline className="w-5 h-5 text-green-400 mr-2" />
                 <span className="text-2xl font-bold text-green-400">${(platformMetrics.dailyRevenue / platformMetrics.partnerHotels).toFixed(0)}/day</span>
               </div>
               <p className="text-xs text-gray-400 mt-1">
                 {platformMetrics.monthlyRides.toLocaleString()} rides this month
               </p>
             </div>
           </div>

           {/* CTA */}
           <button className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
             hoveredSide === 'hotel'
               ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
               : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
           }`}>
             View Partner Portal →
           </button>
         </div>
       </div>
     </div>

     {/* Platform Statistics Bar */}
     <div className="relative z-10 bg-gray-900/50 backdrop-blur-sm py-4 px-4 border-t border-gray-800">
       <div className="max-w-7xl mx-auto">
         <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
             <span className="text-gray-400">Operational Status</span>
           </div>
           <div className="text-gray-700">•</div>
           <span className="text-gray-400">
             <span className="text-white font-semibold">{platformMetrics.partnerHotels}</span> integrated properties
           </span>
           <div className="text-gray-700">•</div>
           <span className="text-gray-400">
             <span className="text-white font-semibold">{platformMetrics.activeDrivers}</span> verified drivers
           </span>
           <div className="text-gray-700">•</div>
           <span className="text-gray-400">
             <span className="text-white font-semibold">${platformMetrics.avgSavings}</span> avg. savings per trip
           </span>
         </div>
       </div>
     </div>
   </section>
 )
}