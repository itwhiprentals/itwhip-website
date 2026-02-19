// app/demo/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoCalendarOutline,
  IoTimeOutline,
  IoBusinessOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkCircle,
  IoVideocamOutline,
  IoLocationOutline,
  IoInformationCircleOutline,
  IoTrendingUpOutline,
  IoCashOutline,
  IoCarOutline
} from 'react-icons/io5'

export default function DemoPage() {
  const router = useRouter()
  
  // Form states
  const [formData, setFormData] = useState({
    hotelName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    rooms: '',
    currentShuttleCost: '',
    preferredDate: '',
    preferredTime: '',
    demoType: 'video',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Available time slots
  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-950 dark:to-black">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <section className="pt-24 pb-20 px-4 min-h-[80vh] flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full 
                flex items-center justify-center mx-auto">
                <IoCheckmarkCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Demo Scheduled Successfully!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Thank you for scheduling a demo with ItWhip. We've sent a confirmation email 
              to <strong>{formData.email}</strong> with all the details.
            </p>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                What's Next?
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">1.</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your email for the calendar invite and demo link
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">2.</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We'll send you a customized revenue report 24 hours before the demo
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prepare any questions about integration, pricing, or operations
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/calculator')}
                className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                  border-2 border-gray-300 dark:border-gray-700 rounded-lg font-bold 
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Revenue Calculator
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold 
                  hover:bg-amber-600 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <section className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Schedule Your Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See how your hotel can earn $300K+ annually from guest rides
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Tell Us About Your Hotel
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Hotel Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hotel Name *
                    </label>
                    <div className="relative">
                      <IoBusinessOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="hotelName"
                        value={formData.hotelName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Omni Scottsdale Resort"
                      />
                    </div>
                  </div>

                  {/* Contact Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <div className="relative">
                      <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 
                        rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="General Manager"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="john@hotel.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <div className="relative">
                      <IoCallOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="(855) 703-0806"
                      />
                    </div>
                  </div>

                  {/* Number of Rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 
                        rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="293"
                    />
                  </div>

                  {/* Current Shuttle Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Shuttle Cost ($)
                    </label>
                    <input
                      type="number"
                      name="currentShuttleCost"
                      value={formData.currentShuttleCost}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 
                        rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="35000"
                    />
                  </div>

                  {/* Demo Type */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Demo Type *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex items-center justify-center p-4 border-2 
                        rounded-lg cursor-pointer transition ${
                        formData.demoType === 'video' 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                          : 'border-gray-300 dark:border-gray-700'
                      }`}>
                        <input
                          type="radio"
                          name="demoType"
                          value="video"
                          checked={formData.demoType === 'video'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <IoVideocamOutline className="w-8 h-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Video Call (30 min)
                          </span>
                        </div>
                      </label>
                      
                      <label className={`relative flex items-center justify-center p-4 border-2 
                        rounded-lg cursor-pointer transition ${
                        formData.demoType === 'onsite' 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                          : 'border-gray-300 dark:border-gray-700'
                      }`}>
                        <input
                          type="radio"
                          name="demoType"
                          value="onsite"
                          checked={formData.demoType === 'onsite'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <IoLocationOutline className="w-8 h-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            On-site Visit (1 hour)
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Time *
                    </label>
                    <div className="relative">
                      <IoTimeOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 
                        rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Tell us about your current transportation challenges or specific questions..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 
                    text-white rounded-lg font-bold text-lg hover:from-amber-600 hover:to-amber-700 
                    transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Demo'}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* What to Expect */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  What to Expect
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-amber-500 font-bold">1.</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customized revenue analysis for your property
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-amber-500 font-bold">2.</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Live platform demonstration
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-amber-500 font-bold">3.</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Integration timeline and process
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-amber-500 font-bold">4.</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Q&A with our hotel success team
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Quick Facts
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <IoTrendingUpOutline className="w-5 h-5 text-amber-600" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        $300K+
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Average annual revenue per hotel
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <IoCashOutline className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        $0
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Investment required
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <IoCarOutline className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        24/7
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Luxury drivers available
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mt-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Need Help?
                </h3>
                
                <div className="space-y-3">
                  <a href="tel:+18557030806"
                    className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400
                      hover:text-gray-900 dark:hover:text-white transition">
                    <IoCallOutline className="w-5 h-5" />
                    <span>(855) 703-0806</span>
                  </a>
                  
                  <a href="mailto:info@itwhip.com" 
                    className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 
                      hover:text-gray-900 dark:hover:text-white transition">
                    <IoMailOutline className="w-5 h-5" />
                    <span>info@itwhip.com</span>
                  </a>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">
                    Available Monday-Friday
                    <br />9:00 AM - 6:00 PM PST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}