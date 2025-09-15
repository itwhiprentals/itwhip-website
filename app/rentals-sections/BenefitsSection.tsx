// app/(guest)/rentals/sections/BenefitsSection.tsx
'use client'

import {
 IoWalletOutline,
 IoShieldCheckmarkOutline,
 IoFlashOutline,
 IoLocationOutline,
 IoPeopleOutline,
 IoThumbsUpOutline
} from 'react-icons/io5'

const benefits = [
 {
   icon: IoWalletOutline,
   title: 'Best Prices',
   description: 'Save up to 35% compared to traditional rentals',
   stat: '35% savings'
 },
 {
   icon: IoShieldCheckmarkOutline,
   title: 'Fully Insured',
   description: 'Comprehensive coverage included',
   stat: '$1M coverage'
 },
 {
   icon: IoFlashOutline,
   title: 'Instant Booking',
   description: 'Skip the counter, book online',
   stat: '2 min booking'
 },
 {
   icon: IoLocationOutline,
   title: 'Hotel Delivery',
   description: 'Free delivery to your hotel',
   stat: '200+ hotels'
 },
 {
   icon: IoPeopleOutline,
   title: 'Local Hosts',
   description: 'Real people, real service',
   stat: '500+ hosts'
 },
 {
   icon: IoThumbsUpOutline,
   title: '24/7 Support',
   description: 'Always here to help',
   stat: '24/7 available'
 }
]

export default function BenefitsSection() {
 return (
   <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="text-center mb-8 sm:mb-12">
         <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
           Why Choose Us
         </span>
         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-2 sm:mb-4">
           The ItWhip Advantage
         </h2>
         <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
           More than just car rental
         </p>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
         {benefits.map((benefit) => {
           const Icon = benefit.icon
           return (
             <div 
               key={benefit.title} 
               className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
             >
               <div className="flex items-start gap-3 sm:gap-4">
                 <div className="flex-shrink-0 w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                   <Icon className="w-6 sm:w-7 h-6 sm:h-7" />
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                     <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                       {benefit.title}
                     </h3>
                     <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                       {benefit.stat}
                     </span>
                   </div>
                   <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                     {benefit.description}
                   </p>
                 </div>
               </div>
             </div>
           )
         })}
       </div>
     </div>
   </section>
 )
}