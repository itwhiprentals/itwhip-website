// app/(guest)/rentals/sections/HowItWorksSection.tsx
'use client'

const steps = [
 {
   number: '1',
   title: 'Search',
   description: 'Find your perfect car',
   time: '2 min'
 },
 {
   number: '2',
   title: 'Book',
   description: 'Instant confirmation',
   time: '30 sec'
 },
 {
   number: '3',
   title: 'Pick Up',
   description: 'Airport or hotel',
   time: 'Flexible'
 },
 {
   number: '4',
   title: 'Drive',
   description: 'Enjoy your trip',
   time: 'Freedom'
 }
]

export default function HowItWorksSection() {
 return (
   <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-800">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="text-center mb-8 sm:mb-12">
         <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
           Simple Process
         </span>
         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-2 sm:mb-4">
           How It Works
         </h2>
         <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
           Book in minutes, not hours
         </p>
       </div>

       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
         {steps.map((step, index) => (
           <div key={step.number} className="relative text-center group">
             {/* Desktop connector line */}
             {index < steps.length - 1 && (
               <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600" />
             )}
             
             <div className="relative inline-flex items-center justify-center w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow-xl group-hover:scale-110 transition-transform">
               {step.number}
             </div>
             
             <span className="inline-block px-2 sm:px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full mb-2 sm:mb-3">
               {step.time}
             </span>
             
             <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
               {step.title}
             </h3>
             <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
               {step.description}
             </p>
           </div>
         ))}
       </div>
     </div>
   </section>
 )
}