// app/(guest)/rentals/[carId]/book/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  IoCarOutline, 
  IoCalendarOutline, 
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoCloseOutline
} from 'react-icons/io5'
import { format, differenceInDays } from 'date-fns'
// Fixed import paths - removed one level of ../
import BookingSteps from '../../components/booking/BookingSteps'
import DriverVerification from '../../components/booking/DriverVerification'
import PriceBreakdown from '../../components/booking/PriceBreakdown'
import PaymentForm from '../../components/booking/PaymentForm'
import { calculateRentalPrice } from '../../lib/pricing'
import type { RentalCarWithDetails } from '@/types/rental'

interface BookingPageProps {
  params: { carId: string }
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get dates from URL params
  const pickupDate = searchParams.get('pickupDate') || ''
  const returnDate = searchParams.get('returnDate') || ''
  const pickupTime = searchParams.get('pickupTime') || '10:00'
  const returnTime = searchParams.get('returnTime') || '10:00'
  const deliveryType = searchParams.get('delivery') || 'pickup'
  
  // State
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [car, setCar] = useState<RentalCarWithDetails | null>(null)
  const [bookingData, setBookingData] = useState({
    carId: params.carId,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    deliveryType,
    deliveryAddress: '',
    extras: [] as string[],
    insurance: 'basic' as 'basic' | 'premium' | 'none',
    notes: ''
  })
  
  const [verificationData, setVerificationData] = useState({
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    licensePhotoUrl: '',
    selfiePhotoUrl: '',
    age: '',
    agreedToTerms: false
  })
  
  const [paymentData, setPaymentData] = useState({
    paymentMethodId: '',
    saveCard: false
  })

  // Calculate pricing
  const numberOfDays = differenceInDays(new Date(returnDate), new Date(pickupDate)) || 1
  const pricing = car ? calculateRentalPrice(
    car.dailyRate,
    numberOfDays,
    {
      weeklyDiscount: car.weeklyDiscount || undefined,
      monthlyDiscount: car.monthlyDiscount || undefined,
      deliveryFee: deliveryType === 'delivery' ? car.deliveryFee : 0,
      insuranceType: bookingData.insurance,
      extras: bookingData.extras,
      youngDriverFee: parseInt(verificationData.age) < 25 ? 25 : 0
    }
  ) : null

  // Fetch car details
  useEffect(() => {
    fetchCarDetails()
  }, [params.carId])

  const fetchCarDetails = async () => {
    try {
      const response = await fetch(`/api/rentals/cars/${params.carId}`)
      if (!response.ok) throw new Error('Car not found')
      const data = await response.json()
      setCar(data)
    } catch (error) {
      console.error('Error fetching car:', error)
      router.push('/rentals')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle verification completion
  const handleVerificationComplete = (data: typeof verificationData) => {
    setVerificationData(data)
    handleNextStep()
  }

  // Handle payment completion
  const handlePaymentComplete = async (paymentMethodId: string) => {
    setPaymentData({ ...paymentData, paymentMethodId })
    
    // Submit booking
    try {
      setIsLoading(true)
      
      const bookingPayload = {
        ...bookingData,
        ...verificationData,
        paymentMethodId,
        pricing: pricing?.breakdown,
        totalAmount: pricing?.total
      }

      const response = await fetch('/api/rentals/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })

      if (!response.ok) {
        throw new Error('Booking failed')
      }

      const { bookingId } = await response.json()
      
      // Redirect to confirmation
      router.push(`/rentals/confirmation/${bookingId}`)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle extras toggle
  const toggleExtra = (extra: string) => {
    setBookingData(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra]
    }))
  }

  if (isLoading || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              Back to car details
            </button>
            
            <div className="flex items-center text-sm text-gray-500">
              <IoShieldCheckmarkOutline className="w-5 h-5 mr-1 text-green-500" />
              Secure checkout
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BookingSteps currentStep={currentStep} />
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Trip Details */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Trip Details</h2>
                
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Date & Time
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={bookingData.pickupDate}
                        onChange={(e) => setBookingData({...bookingData, pickupDate: e.target.value})}
                        className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                      <input
                        type="time"
                        value={bookingData.pickupTime}
                        onChange={(e) => setBookingData({...bookingData, pickupTime: e.target.value})}
                        className="px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Return Date & Time
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={bookingData.returnDate}
                        onChange={(e) => setBookingData({...bookingData, returnDate: e.target.value})}
                        className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                      <input
                        type="time"
                        value={bookingData.returnTime}
                        onChange={(e) => setBookingData({...bookingData, returnTime: e.target.value})}
                        className="px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['pickup', 'delivery', 'airport'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setBookingData({...bookingData, deliveryType: type})}
                        className={`p-3 rounded-lg border ${
                          bookingData.deliveryType === type
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="font-medium capitalize">{type}</div>
                        <div className="text-sm text-gray-500">
                          {type === 'pickup' && 'Meet host at location'}
                          {type === 'delivery' && `+$${car.deliveryFee || 0} delivery fee`}
                          {type === 'airport' && 'Airport pickup/return'}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {bookingData.deliveryType === 'delivery' && (
                    <input
                      type="text"
                      placeholder="Enter delivery address"
                      value={bookingData.deliveryAddress}
                      onChange={(e) => setBookingData({...bookingData, deliveryAddress: e.target.value})}
                      className="mt-3 w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                  )}
                </div>

                {/* Extras */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add-ons
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'gps', name: 'GPS Navigation', price: 10 },
                      { id: 'child_seat', name: 'Child Seat', price: 15 },
                      { id: 'toll_pass', name: 'Toll Pass', price: 20 },
                      { id: 'fuel', name: 'Prepaid Fuel', price: 45 }
                    ].map((extra) => (
                      <label
                        key={extra.id}
                        className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={bookingData.extras.includes(extra.id)}
                            onChange={() => toggleExtra(extra.id)}
                            className="mr-3"
                          />
                          <span>{extra.name}</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          +${extra.price}/day
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Insurance Protection
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'none', name: 'Decline', price: 0, coverage: 'No coverage' },
                      { id: 'basic', name: 'Basic', price: 25, coverage: '$1000 deductible' },
                      { id: 'premium', name: 'Premium', price: 45, coverage: '$0 deductible' }
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setBookingData({...bookingData, insurance: plan.id as any})}
                        className={`p-3 rounded-lg border ${
                          bookingData.insurance === plan.id
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.coverage}</div>
                        {plan.price > 0 && (
                          <div className="text-sm font-medium mt-1">
                            ${plan.price}/day
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="Any special requests or notes for the host..."
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700"
                >
                  Continue to Verification
                </button>
              </div>
            )}

            {/* Step 2: Driver Verification */}
            {currentStep === 2 && (
              <DriverVerification
                onComplete={handleVerificationComplete}
                onBack={handlePreviousStep}
                initialData={verificationData}
              />
            )}

            {/* Step 3: Review & Payment */}
            {currentStep === 3 && pricing && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Review & Payment</h2>
                
                {/* Price Breakdown */}
                <PriceBreakdown
                  pricing={pricing}
                  numberOfDays={numberOfDays}
                  extras={bookingData.extras}
                  insurance={bookingData.insurance}
                  deliveryFee={bookingData.deliveryType === 'delivery' ? car.deliveryFee || 0 : 0}
                />
                
                {/* Payment Form */}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <PaymentForm
                    amount={pricing.total}
                    onComplete={handlePaymentComplete}
                    onBack={handlePreviousStep}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              {/* Car Info */}
              <div className="flex items-start space-x-4 mb-6 pb-6 border-b dark:border-gray-700">
                {car.photos && car.photos[0] && (
                  <Image
                    src={car.photos[0].url}
                    alt={`${car.make} ${car.model}`}
                    width={100}
                    height={75}
                    className="rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {car.carType} • {car.seats} seats
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex text-amber-400">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className={i < Math.floor(car.rating || 5) ? '' : 'opacity-30'}>
                          {star}
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {car.rating || 5} ({car.totalTrips || 0} trips)
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <IoCalendarOutline className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Dates</div>
                    <div className="font-medium">
                      {bookingData.pickupDate && bookingData.returnDate ? (
                        <>
                          {format(new Date(bookingData.pickupDate), 'MMM d')} - {format(new Date(bookingData.returnDate), 'MMM d, yyyy')}
                        </>
                      ) : (
                        'Select dates'
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <IoLocationOutline className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">
                      {bookingData.deliveryType === 'delivery' 
                        ? bookingData.deliveryAddress || 'Enter delivery address'
                        : car.address || 'Pickup location'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <IoTimeOutline className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">
                      {bookingData.pickupTime} - {bookingData.returnTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              {pricing && (
                <div className="pt-6 border-t dark:border-gray-700">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      ${car.dailyRate} × {numberOfDays} days
                    </span>
                    <span className="font-medium">${pricing.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600 mb-2">
                      <span>Discount</span>
                      <span>-${pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bookingData.deliveryType === 'delivery' && car.deliveryFee && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                      <span>Delivery fee</span>
                      <span>${car.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {pricing.serviceFee && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                      <span>Service fee</span>
                      <span>${pricing.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {pricing.taxes && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-4">
                      <span>Taxes</span>
                      <span>${pricing.taxes.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-amber-600">
                        ${pricing.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Host Info */}
              {car.host && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <div className="flex items-center">
                    {car.host.profilePhoto && (
                      <Image
                        src={car.host.profilePhoto}
                        alt={car.host.name}
                        width={40}
                        height={40}
                        className="rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{car.host.name}</div>
                      <div className="text-sm text-gray-500">
                        Responds in ~{car.host.responseTime || 15} min
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start">
                  <IoInformationCircleOutline className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium mb-1">Cancellation Policy</div>
                    Free cancellation up to 24 hours before pickup. 50% refund if cancelled within 24 hours.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}