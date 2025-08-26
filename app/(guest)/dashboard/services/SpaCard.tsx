// app/(guest)/dashboard/services/SpaCard.tsx
// Spa Card Component - Book spa treatments, wellness services, and relaxation packages
// High-margin service with 30% commission for hotels

'use client'

import { useState, useEffect } from 'react'
import { 
  IoSparklesOutline,
  IoFlowerOutline,
  IoWaterOutline,
  IoLeafOutline,
  IoBodyOutline,
  IoHandLeftOutline,
  IoHeartOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAddOutline,
  IoStarOutline,
  IoGiftOutline,
  IoBedOutline,
  IoCashOutline,
  IoTrendingUp,
  IoInformationCircleOutline,
  IoColorPaletteOutline,
  IoTicketOutline
} from 'react-icons/io5'

// Types
interface SpaCardProps {
  hotelId?: string
  hotelName?: string
  roomNumber?: string
  onBookingComplete?: (booking: SpaBooking) => void
  showRoomCharge?: boolean
  showCommission?: boolean
}

interface SpaTreatment {
  id: string
  category: string
  name: string
  description: string
  duration: number
  price: number
  originalPrice?: number
  commission: number
  rating: number
  reviews: number
  benefits: string[]
  popular: boolean
  signature: boolean
}

interface SpaBooking {
  id: string
  treatmentId: string
  treatment: SpaTreatment
  date: string
  time: string
  duration: number
  therapistPreference: string
  specialRequests?: string
  pricing: {
    treatmentPrice: number
    tax: number
    tip: number
    total: number
    commission: number
  }
  status: string
}

export default function SpaCard({
  hotelId = 'grand-hotel',
  hotelName = 'Grand Hotel Phoenix',
  roomNumber = '412',
  onBookingComplete,
  showRoomCharge = true,
  showCommission = true
}: SpaCardProps) {
  // State
  const [treatments, setTreatments] = useState<SpaTreatment[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTreatment, setSelectedTreatment] = useState<SpaTreatment | null>(null)
  const [bookingStage, setBookingStage] = useState<'browse' | 'details' | 'booking' | 'confirmed'>('browse')
  const [isLoading, setIsLoading] = useState(false)
  
  // Booking details
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [therapistPreference, setTherapistPreference] = useState('no-preference')
  const [specialRequests, setSpecialRequests] = useState('')
  const [tipAmount, setTipAmount] = useState(20)

  // Categories
  const categories = [
    { id: 'massage', name: 'Massage', icon: IoHandLeftOutline },
    { id: 'facial', name: 'Facial', icon: IoSparklesOutline },
    { id: 'body', name: 'Body', icon: IoBodyOutline },
    { id: 'wellness', name: 'Wellness', icon: IoLeafOutline }
  ]

  // Load treatments
  useEffect(() => {
    loadTreatments()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setBookingDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const loadTreatments = async () => {
    setIsLoading(true)
    try {
      // Mock data
      const mockTreatments: SpaTreatment[] = [
        {
          id: 'spa-1',
          category: 'massage',
          name: 'Swedish Massage',
          description: 'Classic relaxation massage with long, flowing strokes',
          duration: 60,
          price: 120,
          originalPrice: 150,
          commission: 30,
          rating: 4.8,
          reviews: 234,
          benefits: ['Stress relief', 'Improved circulation', 'Muscle relaxation'],
          popular: true,
          signature: false
        },
        {
          id: 'spa-2',
          category: 'massage',
          name: 'Deep Tissue Massage',
          description: 'Intensive massage targeting deep muscle layers',
          duration: 90,
          price: 180,
          originalPrice: 220,
          commission: 30,
          rating: 4.9,
          reviews: 189,
          benefits: ['Pain relief', 'Improved mobility', 'Tension release'],
          popular: true,
          signature: false
        },
        {
          id: 'spa-3',
          category: 'facial',
          name: 'Signature Hydrafacial',
          description: 'Advanced hydradermabrasion with LED therapy',
          duration: 60,
          price: 180,
          originalPrice: 225,
          commission: 30,
          rating: 4.9,
          reviews: 312,
          benefits: ['Deep cleansing', 'Hydration boost', 'Glowing skin'],
          popular: true,
          signature: true
        },
        {
          id: 'spa-4',
          category: 'body',
          name: 'Desert Stone Body Wrap',
          description: 'Detoxifying mud wrap with Arizona minerals',
          duration: 90,
          price: 200,
          originalPrice: 250,
          commission: 30,
          rating: 4.8,
          reviews: 156,
          benefits: ['Detoxification', 'Skin softening', 'Relaxation'],
          popular: false,
          signature: true
        },
        {
          id: 'spa-5',
          category: 'wellness',
          name: 'Reiki Energy Healing',
          description: 'Japanese energy healing for stress reduction',
          duration: 60,
          price: 100,
          commission: 30,
          rating: 4.9,
          reviews: 67,
          benefits: ['Energy balance', 'Stress relief', 'Emotional healing'],
          popular: false,
          signature: false
        }
      ]
      
      setTreatments(mockTreatments)
    } catch (error) {
      console.error('Failed to load treatments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter treatments
  const getFilteredTreatments = () => {
    if (selectedCategory === 'all') {
      return treatments
    }
    return treatments.filter(t => t.category === selectedCategory)
  }

  // Calculate total
  const calculateTotal = () => {
    if (!selectedTreatment) return { treatment: 0, tax: 0, tip: 0, total: 0, commission: 0 }
    
    const treatmentPrice = selectedTreatment.price
    const tax = treatmentPrice * 0.08
    const tip = (treatmentPrice * tipAmount) / 100
    const total = treatmentPrice + tax + tip
    const commission = (treatmentPrice * selectedTreatment.commission) / 100
    
    return { treatment: treatmentPrice, tax, tip, total, commission }
  }

  // Book treatment
  const bookTreatment = async () => {
    if (!selectedTreatment) return
    
    setIsLoading(true)
    try {
      const pricing = calculateTotal()
      
      const booking: SpaBooking = {
        id: Date.now().toString(),
        treatmentId: selectedTreatment.id,
        treatment: selectedTreatment,
        date: bookingDate,
        time: bookingTime,
        duration: selectedTreatment.duration,
        therapistPreference,
        specialRequests,
        pricing,
        status: 'confirmed'
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingStage('confirmed')
      
      if (onBookingComplete) {
        onBookingComplete(booking)
      }
      
      setTimeout(() => {
        setBookingStage('browse')
        setSelectedTreatment(null)
      }, 5000)
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmed view
  if (bookingStage === 'confirmed') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Spa Booking Confirmed!</h3>
          <p className="text-gray-600 mb-6">Your relaxation awaits</p>
          
          {selectedTreatment && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-3">{selectedTreatment.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{bookingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-green-600">${calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>
              
              {showRoomCharge && (
                <div className="mt-3 p-2 bg-blue-50 rounded">
                  <div className="flex items-center text-blue-700 text-sm">
                    <IoBedOutline className="w-4 h-4 mr-2" />
                    <span>Charged to Room {roomNumber}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => {
              setBookingStage('browse')
              setSelectedTreatment(null)
            }}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700"
          >
            Book Another Treatment
          </button>
        </div>
      </div>
    )
  }

  // Booking view
  if (bookingStage === 'booking' && selectedTreatment) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Book {selectedTreatment.name}</h3>
          <button
            onClick={() => setBookingStage('details')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <select
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
            </select>
          </div>

          {/* Therapist Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Therapist Preference</label>
            <div className="flex space-x-2">
              {['no-preference', 'female', 'male'].map(pref => (
                <button
                  key={pref}
                  onClick={() => setTherapistPreference(pref)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 capitalize ${
                    therapistPreference === pref
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {pref === 'no-preference' ? 'No Preference' : pref}
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Any preferences or needs?"
            />
          </div>

          {/* Tip */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gratuity</label>
            <div className="flex space-x-2">
              {[15, 18, 20, 25].map(percent => (
                <button
                  key={percent}
                  onClick={() => setTipAmount(percent)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 ${
                    tipAmount === percent
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Treatment</span>
                <span>${calculateTotal().treatment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${calculateTotal().tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tip ({tipAmount}%)</span>
                <span>${calculateTotal().tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">${calculateTotal().total.toFixed(2)}</span>
              </div>
            </div>
            
            {showCommission && (
              <div className="mt-3 p-2 bg-green-50 rounded">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Hotel Commission</span>
                  <span className="font-bold text-green-600">+${calculateTotal().commission.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setBookingStage('details')}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={bookTreatment}
              disabled={!bookingTime || isLoading}
              className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 disabled:bg-gray-300"
            >
              {isLoading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Details view
  if (bookingStage === 'details' && selectedTreatment) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Treatment Details</h3>
          <button
            onClick={() => {
              setBookingStage('browse')
              setSelectedTreatment(null)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-gray-900">{selectedTreatment.name}</h4>
            <p className="text-gray-600 mt-2">{selectedTreatment.description}</p>
            
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center">
                <IoStarOutline className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="ml-1 font-medium">{selectedTreatment.rating}</span>
                <span className="ml-1 text-sm text-gray-500">({selectedTreatment.reviews} reviews)</span>
              </div>
              {selectedTreatment.signature && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Signature
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center text-gray-600 mb-1">
                <IoTimeOutline className="w-4 h-4 mr-2" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="font-semibold">{selectedTreatment.duration} minutes</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center text-gray-600 mb-1">
                <IoCashOutline className="w-4 h-4 mr-2" />
                <span className="text-sm">Price</span>
              </div>
              <p className="font-semibold">${selectedTreatment.price}</p>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-2">Benefits</h5>
            <div className="space-y-1">
              {selectedTreatment.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {showCommission && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Hotel Commission (30%)</span>
                <span className="font-bold text-green-600">
                  +${(selectedTreatment.price * 0.3).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setBookingStage('browse')}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={() => setBookingStage('booking')}
              className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Browse view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Spa & Wellness</h3>
        {showCommission && (
          <div className="flex items-center text-sm text-green-600">
            <IoTrendingUp className="w-4 h-4 mr-1" />
            <span>30% commission</span>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Treatments
        </button>
        {categories.map(category => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{category.name}</span>
            </button>
          )
        })}
      </div>

      {/* Treatments */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading treatments...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredTreatments().map(treatment => (
            <div key={treatment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{treatment.name}</h4>
                    {treatment.popular && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <IoTimeOutline className="w-4 h-4 mr-1" />
                      <span>{treatment.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <IoStarOutline className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1">{treatment.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <p className="text-2xl font-bold text-gray-900">${treatment.price}</p>
                  {treatment.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">${treatment.originalPrice}</p>
                  )}
                  
                  {showCommission && (
                    <div className="mt-2 p-2 bg-purple-50 rounded">
                      <p className="text-xs text-purple-700">Hotel earns</p>
                      <p className="text-sm font-bold text-purple-600">
                        +${(treatment.price * 0.3).toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedTreatment(treatment)
                      setBookingStage('details')
                    }}
                    className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}