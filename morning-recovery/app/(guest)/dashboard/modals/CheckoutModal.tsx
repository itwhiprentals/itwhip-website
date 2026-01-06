// app/(guest)/dashboard/modals/CheckoutModal.tsx
// Checkout Modal - Handles payment processing for all services
// Supports multiple payment methods including room charging

'use client'

import { useState, useEffect } from 'react'
import { 
  IoClose,
  IoWalletOutline,
  IoCashOutline,
  IoCardOutline,
  IoBedOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoLockClosed,
  IoShieldCheckmark,
  IoReceiptOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoArrowForward,
  IoArrowBack,
  IoInformationCircle
} from 'react-icons/io5'
import { useHotel } from '../components/HotelContext'
import { useRouter } from 'next/navigation'

// Types
interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  onSuccess: (paymentData: PaymentData) => void
}

interface CartItem {
  id: string
  type: 'ride' | 'hotel' | 'food' | 'rental' | 'flight' | 'bundle' | 'amenity'
  name: string
  description: string
  price: number
  quantity: number
  metadata?: any
}

interface PaymentData {
  method: 'card' | 'room' | 'cash' | 'wallet'
  cardLast4?: string
  roomNumber?: string
  transactionId: string
  timestamp: string
  amount: number
  items: CartItem[]
}

interface PaymentMethod {
  id: 'card' | 'room' | 'cash' | 'wallet'
  name: string
  description: string
  icon: any
  available: boolean
  recommended?: boolean
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  total,
  onSuccess
}: CheckoutModalProps) {
  const router = useRouter()
  const { isAtHotel, hotelName, reservation, user } = useHotel()
  
  // State
  const [currentStep, setCurrentStep] = useState<'review' | 'payment' | 'processing' | 'success'>('review')
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'room' | 'cash' | 'wallet'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  
  // Form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  
  // Calculate fees and totals
  const processingFee = total * 0.029 // 2.9% processing fee
  const hotelCommission = isAtHotel && items.some(item => item.type === 'ride') 
    ? total * 0.15 
    : 0
  const finalTotal = total + processingFee

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
      icon: IoCardOutline,
      available: true
    },
    {
      id: 'room',
      name: 'Charge to Room',
      description: `Room ${reservation?.roomNumber || '---'}`,
      icon: IoBedOutline,
      available: isAtHotel,
      recommended: isAtHotel
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Apple Pay, Google Pay',
      icon: IoWalletOutline,
      available: true
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: IoCashOutline,
      available: items.some(item => item.type === 'food')
    }
  ]

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && currentStep !== 'processing') {
        handleClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentStep])

  // Handle close
  const handleClose = () => {
    if (currentStep === 'processing') return // Don't close while processing
    
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setCurrentStep('review')
      setError(null)
    }, 300)
  }

  // Process payment
  const processPayment = async () => {
    setIsProcessing(true)
    setCurrentStep('processing')
    setError(null)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate transaction data
      const paymentData: PaymentData = {
        method: selectedPayment,
        cardLast4: selectedPayment === 'card' ? cardNumber.slice(-4) : undefined,
        roomNumber: selectedPayment === 'room' ? reservation?.roomNumber : undefined,
        transactionId: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        amount: finalTotal,
        items
      }
      
      // Success
      setCurrentStep('success')
      setTimeout(() => {
        onSuccess(paymentData)
        handleClose()
      }, 2000)
      
    } catch (err) {
      setError('Payment failed. Please try again.')
      setCurrentStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  // Validate payment
  const validatePayment = (): boolean => {
    if (selectedPayment === 'card') {
      if (!cardNumber || cardNumber.length < 19) return false
      if (!cardName) return false
      if (!cardExpiry || cardExpiry.length < 5) return false
      if (!cardCvv || cardCvv.length < 3) return false
    }
    return true
  }

  if (!isOpen) return null

  // Render content based on step
  const renderContent = () => {
    switch (currentStep) {
      case 'review':
        return (
          <>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Review Your Order</h3>
              <p className="text-sm text-gray-600 mt-1">{items.length} items</p>
            </div>

            <div className="px-6 py-4 max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fees breakdown */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">${processingFee.toFixed(2)}</span>
                </div>
                {hotelCommission > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Hotel Commission</span>
                    <span className="font-medium text-green-600">
                      ${hotelCommission.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-xl">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Hotel benefit notice */}
              {hotelCommission > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">Supporting {hotelName}</p>
                      <p className="text-green-700 mt-1">
                        Your hotel earns ${hotelCommission.toFixed(2)} from this purchase
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setCurrentStep('payment')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Proceed to Payment
                <IoArrowForward className="inline w-4 h-4 ml-2" />
              </button>
            </div>
          </>
        )

      case 'payment':
        return (
          <>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              <p className="text-sm text-gray-600 mt-1">Total: ${finalTotal.toFixed(2)}</p>
            </div>

            <div className="px-6 py-4">
              {/* Payment method selection */}
              <div className="space-y-2 mb-6">
                {paymentMethods.filter(m => m.available).map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        selectedPayment === method.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-gray-600 mr-3" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">
                              {method.name}
                              {method.recommended && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        {selectedPayment === method.id && (
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Card payment form */}
              {selectedPayment === 'card' && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="save-card"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="save-card" className="ml-2 text-sm text-gray-700">
                      Save card for future purchases
                    </label>
                  </div>
                </div>
              )}

              {/* Room charge info */}
              {selectedPayment === 'room' && (
                <div className="pt-4 border-t">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <IoInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Charge to Room {reservation?.roomNumber}</p>
                        <p className="text-blue-700 mt-1">
                          This charge will appear on your hotel bill at checkout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security notice */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <IoLockClosed className="w-4 h-4 mr-2" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('review')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  <IoArrowBack className="inline w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={processPayment}
                  disabled={!validatePayment()}
                  className={`flex-1 font-medium py-3 rounded-lg transition-colors ${
                    validatePayment()
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Pay ${finalTotal.toFixed(2)}
                  <IoShieldCheckmark className="inline w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </>
        )

      case 'processing':
        return (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <IoLockClosed className="w-4 h-4 mr-2" />
              <span>Secure transaction in progress</span>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Your order has been confirmed</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-700 mb-1">Transaction ID</p>
              <p className="text-sm text-gray-900 font-mono">TXN-{Date.now()}</p>
            </div>
            <div className="mt-6 flex items-center justify-center text-sm text-green-600">
              <IoReceiptOutline className="w-4 h-4 mr-2" />
              <span>Receipt sent to your email</span>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isClosing ? 'opacity-0' : 'bg-opacity-50'
        }`}
        onClick={currentStep !== 'processing' ? handleClose : undefined}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}>
            {/* Header */}
            {currentStep !== 'processing' && currentStep !== 'success' && (
              <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Checkout</h2>
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  )
}