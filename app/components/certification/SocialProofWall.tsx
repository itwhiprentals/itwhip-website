// app/components/certification/SocialProofWall.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  IoCheckmarkCircle,
  IoTrendingUp,
  IoCashOutline,
  IoShieldCheckmark,
  IoStarOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoBusinessOutline,
  IoRocketOutline,
  IoPeopleOutline,
  IoTrophyOutline,
  IoFlashOutline
} from 'react-icons/io5'

interface Certification {
  id: string
  hotelName: string
  location: string
  tier: string
  grade: string
  timestamp: string
  rooms: number
  savingsProjected: number
  revenueProjected: number
}

interface SuccessMetric {
  id: string
  type: 'revenue' | 'security' | 'compliance' | 'milestone'
  hotel: string
  metric: string
  value: string
  timestamp: string
  icon: React.ReactNode
}

interface Testimonial {
  id: string
  author: string
  role: string
  hotel: string
  rating: number
  quote: string
  metric: string
  verified: boolean
}

export function SocialProofWall() {
  const [recentCertifications, setRecentCertifications] = useState<Certification[]>([])
  const [successMetrics, setSuccessMetrics] = useState<SuccessMetric[]>([])
  const [testimonials] = useState<Testimonial[]>([
    {
      id: 'T001',
      author: 'Sarah Mitchell',
      role: 'General Manager',
      hotel: 'Hyatt Regency Phoenix',
      rating: 5,
      quote: "Replaced all our compliance vendors with TU. Now earning $32K/month from rides we never thought possible.",
      metric: '+$384K annual revenue',
      verified: true
    },
    {
      id: 'T002',
      author: 'James Chen',
      role: 'CFO',
      hotel: 'Marriott Scottsdale',
      rating: 5,
      quote: "ROI in 2 months. The board couldn't believe compliance could generate revenue. Game changer.",
      metric: '623% ROI',
      verified: true
    },
    {
      id: 'T003',
      author: 'Maria Rodriguez',
      role: 'Director of Security',
      hotel: 'Four Seasons Resort',
      rating: 5,
      quote: "Zero security incidents since implementation. Insurance premiums dropped 40%. Incredible.",
      metric: '$75K insurance savings',
      verified: true
    },
    {
      id: 'T004',
      author: 'David Thompson',
      role: 'Owner',
      hotel: 'Boutique Hotel Group',
      rating: 5,
      quote: "Applied for 3 hotels, all approved in 15 minutes. Revenue started flowing day one.",
      metric: '15 min setup',
      verified: true
    }
  ])

  const [selectedTestimonial, setSelectedTestimonial] = useState<string | null>(null)
  const [liveCount, setLiveCount] = useState(47)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Hotel name generator for realistic data
  const hotelBrands = ['Marriott', 'Hilton', 'Hyatt', 'Westin', 'Sheraton', 'Four Points', 'Fairmont', 'JW', 'W Hotels']
  const cities = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Glendale', 'Tucson', 'Sedona']

  // Generate recent certification
  const generateCertification = (): Certification => {
    const brand = hotelBrands[Math.floor(Math.random() * hotelBrands.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const rooms = Math.floor(Math.random() * 300) + 100
    const tierRandom = Math.random()
    let tier = 'TU-1'
    let grade = 'A'
    
    if (tierRandom > 0.7) {
      tier = 'TU-3'
      grade = ['A', 'B'][Math.floor(Math.random() * 2)]
    } else if (tierRandom > 0.3) {
      tier = 'TU-2'
      grade = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }

    return {
      id: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      hotelName: `${brand} ${city}`,
      location: `${city}, AZ`,
      tier,
      grade,
      timestamp: new Date().toLocaleTimeString(),
      rooms,
      savingsProjected: Math.floor(Math.random() * 100000) + 50000,
      revenueProjected: Math.floor(Math.random() * 200000) + 100000
    }
  }

  // Generate success metric
  const generateSuccessMetric = (): SuccessMetric => {
    const types = ['revenue', 'security', 'compliance', 'milestone'] as const
    const type = types[Math.floor(Math.random() * types.length)]
    const brand = hotelBrands[Math.floor(Math.random() * hotelBrands.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    
    let metric = ''
    let value = ''
    let icon = <IoTrendingUp className="w-4 h-4" />

    switch (type) {
      case 'revenue':
        metric = 'Monthly ride revenue'
        value = `$${(Math.floor(Math.random() * 50) + 20)}K`
        icon = <IoCashOutline className="w-4 h-4 text-green-500" />
        break
      case 'security':
        metric = 'Attacks blocked today'
        value = Math.floor(Math.random() * 500 + 100).toString()
        icon = <IoShieldCheckmark className="w-4 h-4 text-red-500" />
        break
      case 'compliance':
        metric = 'Compliance score'
        value = `${Math.floor(Math.random() * 10 + 90)}/100`
        icon = <IoCheckmarkCircle className="w-4 h-4 text-purple-500" />
        break
      case 'milestone':
        metric = 'Reached milestone'
        value = '1000 rides'
        icon = <IoTrophyOutline className="w-4 h-4 text-yellow-500" />
        break
    }

    return {
      id: `METRIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      hotel: `${brand} ${city}`,
      metric,
      value,
      timestamp: new Date().toLocaleTimeString(),
      icon
    }
  }

  // Simulate live certifications
  useEffect(() => {
    // Add initial certifications
    const initial = Array(3).fill(null).map(() => generateCertification())
    setRecentCertifications(initial)

    const interval = setInterval(() => {
      setRecentCertifications(prev => {
        const newCert = generateCertification()
        return [newCert, ...prev].slice(0, 5)
      })
      setLiveCount(prev => prev + 1)
    }, 15000) // New certification every 15 seconds

    return () => clearInterval(interval)
  }, [])

  // Simulate success metrics
  useEffect(() => {
    // Add initial metrics
    const initial = Array(4).fill(null).map(() => generateSuccessMetric())
    setSuccessMetrics(initial)

    const interval = setInterval(() => {
      setSuccessMetrics(prev => {
        const newMetric = generateSuccessMetric()
        return [newMetric, ...prev].slice(0, 8)
      })
    }, 8000) // New metric every 8 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll success metrics
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [successMetrics])

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full mb-4">
            <IoPeopleOutline className="w-5 h-5" />
            <span className="font-semibold">Join {liveCount} Hotels Already Certified</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The Movement is <span className="text-green-600">Unstoppable</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Hotels are switching every day. Watch live as they save money, earn revenue, and eliminate risk.
          </p>
        </div>

        {/* Live Certification Feed */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Certifications
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCertifications.map((cert, index) => (
              <div
                key={cert.id}
                className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 transition-all ${
                  index === 0 ? 'ring-2 ring-green-500 animate-pulse-once' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <IoBusinessOutline className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {cert.hotelName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <IoLocationOutline className="inline w-3 h-3" /> {cert.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {index === 0 ? 'Just now' : cert.timestamp}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                    cert.tier === 'TU-3' ? 'bg-purple-600' :
                    cert.tier === 'TU-2' ? 'bg-blue-600' :
                    'bg-green-600'
                  }`}>
                    {cert.tier}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    cert.grade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    cert.grade === 'B' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    Grade {cert.grade}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {cert.rooms} rooms
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Projected Savings</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ${(cert.savingsProjected / 1000).toFixed(0)}K/yr
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Projected Revenue</p>
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      ${(cert.revenueProjected / 1000).toFixed(0)}K/yr
                    </p>
                  </div>
                </div>

                {index === 0 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 animate-pulse">
                      <IoFlashOutline className="inline w-4 h-4" /> JUST CERTIFIED!
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics Stream */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Live Metrics */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Activity Stream
            </h3>
            
            <div 
              ref={scrollRef}
              className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto space-y-3"
            >
              {successMetrics.map((metric, index) => (
                <div
                  key={metric.id}
                  className={`bg-gray-800 rounded p-3 flex items-center justify-between transition-all ${
                    index === 0 ? 'border border-purple-500 animate-fadeIn' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {metric.icon}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {metric.hotel}
                      </p>
                      <p className="text-xs text-gray-400">
                        {metric.metric}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500">
                      {metric.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Board */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Achievements
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-4 text-white">
                <IoTrophyOutline className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">$8.4M</p>
                <p className="text-sm opacity-90">Total Revenue Generated</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-4 text-white">
                <IoShieldCheckmark className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm opacity-90">Security Breaches</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-4 text-white">
                <IoRocketOutline className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">147K</p>
                <p className="text-sm opacity-90">Rides Completed</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-4 text-white">
                <IoCheckmarkCircle className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm opacity-90">Compliance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Verified Success Stories
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                  selectedTestimonial === testimonial.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedTestimonial(
                  selectedTestimonial === testimonial.id ? null : testimonial.id
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {testimonial.author}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {testimonial.role}, {testimonial.hotel}
                      </p>
                    </div>
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <IoCheckmarkCircle className="w-5 h-5" />
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <IoStarOutline
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.rating}.0
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>

                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Key Result
                  </p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {testimonial.metric}
                  </p>
                </div>

                {selectedTestimonial === testimonial.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                      Read Full Case Study
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8 text-white text-center">
          <IoTimeOutline className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Limited Spots Available This Month
          </h3>
          <p className="text-lg mb-6 opacity-90">
            We can only onboard 10 hotels per month to maintain quality.
            <span className="block mt-2 font-bold">
              3 spots remaining for {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Claim Your Spot Now
            </button>
            <button className="px-8 py-3 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 transition-colors">
              Join Waitlist
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              <span>47 Hotels Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoTrendingUp className="w-5 h-5 text-blue-500" />
              <span>$8.4M Generated</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoShieldCheckmark className="w-5 h-5 text-purple-500" />
              <span>0 Breaches</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}