// app/(guest)/rentals/sections/CTASection.tsx
'use client'

import Link from 'next/link'
import { 
 IoCarOutline,
 IoRocketOutline,
 IoCheckmarkCircleOutline,
 IoTrendingUpOutline
} from 'react-icons/io5'

export default function CTASection() {
 return (
   <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
       <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600/20 backdrop-blur border border-amber-600/50 text-amber-400 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
         <IoTrendingUpOutline className="w-4 h-4" />
         <span>Join 10,000+ happy travelers</span>
       </div>
       
       <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
         Ready to Hit the Road?
       </h2>
       <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
         Your perfect car is waiting. Book now and save big on your Phoenix adventure.
       </p>
       
       <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
         <Link
           href="/rentals/search"
           className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl text-sm sm:text-base"
         >
           <IoCarOutline className="w-5 sm:w-6 h-5 sm:h-6" />
           Browse All Cars
         </Link>
         <button
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all transform hover:scale-105 shadow-2xl text-sm sm:text-base"
         >
           <IoRocketOutline className="w-5 sm:w-6 h-5 sm:h-6" />
           Start Your Search
         </button>
       </div>

       <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-gray-400 text-xs sm:text-sm">
         <div className="flex items-center gap-1 sm:gap-2">
           <IoCheckmarkCircleOutline className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
           <span>Free Cancellation</span>
         </div>
         <div className="flex items-center gap-1 sm:gap-2">
           <IoCheckmarkCircleOutline className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
           <span>No Hidden Fees</span>
         </div>
         <div className="flex items-center gap-1 sm:gap-2">
           <IoCheckmarkCircleOutline className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
           <span>Best Price</span>
         </div>
       </div>
     </div>
   </section>
 )
}