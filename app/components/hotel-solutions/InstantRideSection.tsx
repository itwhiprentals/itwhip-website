// app/components/hotel-solutions/InstantRideSection.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoFlashOutline,
  IoCarSportOutline,
  IoCashOutline,
  IoInfiniteOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoAirplaneOutline,
  IoArrowForwardOutline,
  IoBulbOutline,
  IoCarOutline,
  IoHeartOutline,
  IoShieldCheckmarkOutline,
  IoLeafOutline,
  IoTimeOutline,
  IoBedOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoGlobeOutline,
  IoHappyOutline,
  IoStarOutline,
  IoPhonePortraitOutline,
  IoDocumentTextOutline,
  IoRocketOutline
} from 'react-icons/io5'

export default function InstantRideSection() {
  const [guestCount, setGuestCount] = useState(12847)
  const [stressLevel, setStressLevel] = useState(0)
  const [activeJourneyStep, setActiveJourneyStep] = useState(0)

  // Animate guest counter
  useEffect(() => {
    const interval = setInterval(() => {
      setGuestCount(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Animate journey steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveJourneyStep(prev => (prev + 1) % 6)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const journeySteps = [
    { icon: <IoBedOutline />, title: 'Booking', description: 'Instant Ride included' },
    { icon: <IoAirplaneOutline />, title: 'Landing', description: 'Driver notified' },
    { icon: <IoCarOutline />, title: 'Pickup', description: 'Zero wait time' },
    { icon: <IoBusinessOutline />, title: 'Hotel Stay', description: 'Rides on demand' },
    { icon: <IoRocketOutline />, title: 'Checkout', description: 'Car ready' },
    { icon: <IoHeartOutline />, title: 'Happy Guest', description: '5-star review' }
  ]

  return (
    <section id="instant-ride" className="py-16 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-800 dark:text-blue-400 px-6 py-3 rounded-full mb-6 border border-blue-300 dark:border-blue-800">
            <IoFlashOutline className="w-6 h-6 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">The Guest Experience Revolution</span>
            <IoFlashOutline className="w-6 h-6 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
            Your Guests <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Never Think About</span> Transportation
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            From booking to checkout, every ride is instant, seamless, and invisible. 
            Just like great hospitality should be.
          </p>
          
          {/* Live Counter */}
          <div className="mt-6">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {guestCount.toLocaleString()} 
              <span className="text-lg text-slate-600 dark:text-slate-400 ml-2">happy guests transported today</span>
            </p>
          </div>
        </div>

        {/* The Perfect Journey Timeline */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
            The Stress-Free Journey Your Guests Deserve
          </h3>
          <div className="relative">
            {/* Journey Path */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 to-green-200 dark:from-blue-800 dark:to-green-800 transform -translate-y-1/2 hidden md:block"></div>
            
            {/* Journey Steps */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
              {journeySteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`text-center transform transition-all duration-500 ${
                    idx === activeJourneyStep ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-500 ${
                    idx <= activeJourneyStep 
                      ? 'bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg' 
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                  }`}>
                    {React.cloneElement(step.icon, { className: 'w-8 h-8' })}
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{step.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Three Guest Experiences */}
        <div className="grid lg:grid-cols-4 gap-6 mb-16">
          {/* Business Traveler */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <IoBusinessOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business Traveler</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Automatic Expense Reports</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">No receipts to save or submit</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">ESG Compliance Built-In</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Scope 3 emissions tracked automatically</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Book Your Own Ride</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Self-service or concierge assist</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-purple-800 dark:text-purple-300 italic">
                "My company loves the automatic carbon reporting. I love never waiting for rides."
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">- Fortune 500 Executive</p>
            </div>
          </div>

          {/* Family Vacation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <IoPeopleOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Family Vacation</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Car Seats Provided</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">No need to travel with them</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Multiple Vehicles</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Large families, no problem</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Hotel-Dedicated Drivers</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Same friendly faces daily</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <p className="text-xs text-pink-800 dark:text-pink-300 italic">
                "The kids loved having 'our own driver' and we saved $300 on rental cars!"
              </p>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">- Family of 5 from Ohio</p>
            </div>
          </div>

          {/* Group Events */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border-2 border-amber-400 dark:border-amber-600">
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <IoPeopleOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Group Events</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Conference Coordination</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">200 guests? 50 cars ready</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Van or Sedan Options</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Groups stay together or split</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Pre-Scheduled Waves</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Staggered arrivals managed</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                "300 conference attendees, zero transportation issues. Incredible!"
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">- Event Planner, Tech Summit</p>
            </div>
          </div>

          {/* International Guest */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <IoGlobeOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">International Guest</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">No Language Barriers</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Multilingual driver support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Airport Specialists</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Drivers know every terminal</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Hotel-Only Routes</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Not random Uber trips</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 italic">
                "Finally, American hotels that understand hospitality like we do in Japan."
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">- Tokyo Business Owner</p>
            </div>
          </div>
        </div>

        {/* The Magic They Never See */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
            The Invisible Excellence Your Guests Feel But Never See
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">$100M Coverage</h4>
              <p className="text-xs text-gray-300">Every ride fully insured</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoLeafOutline className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">ESG Tracked</h4>
              <p className="text-xs text-gray-300">Automatic carbon reporting</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoTimeOutline className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">47min Prediction</h4>
              <p className="text-xs text-gray-300">AI knows before they do</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoDocumentTextOutline className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">Auto Compliance</h4>
              <p className="text-xs text-gray-300">All regulations met</p>
            </div>
          </div>
        </div>

        {/* Problems They Never Face vs Always Experience */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Never Experience */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-8 border-2 border-red-200 dark:border-red-800">
            <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-6 flex items-center">
              <IoCloseCircleOutline className="w-8 h-8 mr-3" />
              Problems Your Guests Never Face
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">45-minute airport wait in the heat</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">$127 surge price at 11pm</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">"No drivers available" message</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Downloading another app</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Credit card declined abroad</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Lost in translation with driver</p>
              </div>
            </div>
          </div>

          {/* Always Experience */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-8 border-2 border-green-500">
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-6 flex items-center">
              <IoCheckmarkCircle className="w-8 h-8 mr-3" />
              What They Always Experience
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Driver waiting with name sign</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Fixed, transparent pricing always</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Instant pickup, every time</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Seamless room charging</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Professional, trained drivers</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Feels like hotel's own service</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Bottom Line */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">
            Transportation So Perfect, Guests Think It's Magic
          </h3>
          <p className="text-xl text-gray-100 mb-6 max-w-3xl mx-auto">
            They book. They arrive. They ride. They leave happy. 
            They never once worry about how to get anywhere.
          </p>
          
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-6">
            <div>
              <IoStarOutline className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">4.9★</p>
              <p className="text-sm text-gray-200">Guest Rating</p>
            </div>
            <div>
              <IoHappyOutline className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-gray-200">Transport Complaints</p>
            </div>
            <div>
              <IoHeartOutline className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">87%</p>
              <p className="text-sm text-gray-200">Repeat Bookings</p>
            </div>
          </div>
          
          <p className="text-2xl font-bold text-white">
            This isn't just transportation. It's hospitality perfected.
          </p>
        </div>

        {/* Important Features Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            Your Dedicated Fleet, Not Random Rideshare
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <IoCarOutline className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Hotel-Dedicated Drivers</h4>
              <p className="text-xs text-gray-300">Exclusively serving your hotel and airport routes</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <IoPhonePortraitOutline className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Guest or Hotel Books</h4>
              <p className="text-xs text-gray-300">Self-service app or concierge can arrange</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <IoPeopleOutline className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Group Coordination</h4>
              <p className="text-xs text-gray-300">Conferences, weddings, events - all managed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}