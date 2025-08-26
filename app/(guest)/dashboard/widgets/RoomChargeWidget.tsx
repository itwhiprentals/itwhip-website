// app/(guest)/dashboard/widgets/RoomChargeWidget.tsx
// Room Charge Widget - Manages room charging for all hotel services
// Shows running total, itemized charges, and enables one-click payment

'use client'

import { useState, useEffect } from 'react'
import { 
  IoBedOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAddOutline,
  IoRemoveOutline,
  IoReceiptOutline,
  IoCardOutline,
  IoTimeOutline,
  IoRestaurantOutline,
  IoCarOutline,
  IoBasketOutline,
  IoSparklesOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUp,
  IoExpandOutline,
  IoContractOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoRefreshOutline
} from 'react-icons/io5'

// Types
interface RoomChargeWidgetProps {
  roomNumber?: string
  hotelName?: string
  guestName?: string
  checkoutDate?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
  onPaymentComplete?: (charges: RoomCharge[]) => void
  maxChargeLimit?: number
  requirePin?: boolean
}

interface RoomCharge {
  id: string
  timestamp: string
  category: 'ride' | 'food' | 'amenities' | 'spa' | 'minibar' | 'service' | 'other'
  description: string
  vendor?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'pending' | 'posted' | 'disputed' | 'removed'
  icon: any
  taxRate: number
  tip?: number
  serviceCharge?: number
  reference?: string
  authorizedBy?: string
}

interface ChargeCategory {
  id: string
  name: string
  icon: any
  total: number
  count: number
  color: string
}

interface PaymentMethod {
  id: string
  type: 'room' | 'card' | 'cash' | 'points'
  name: string
  icon: any
  available: boolean
  selected: boolean
}

export default function RoomChargeWidget({
  roomNumber = '412',
  hotelName = 'Grand Hotel Phoenix',
  guestName = 'Guest',
  checkoutDate = '',
  isExpanded = false,
  onToggleExpand,
  onPaymentComplete,
  maxChargeLimit = 5000,
  requirePin = false
}: RoomChargeWidgetProps) {
  // State management
  const [charges, setCharges] = useState<RoomCharge[]>([])
  const [expandedView, setExpandedView] = useState(isExpanded)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedCharges, setSelectedCharges] = useState<Set<string>>(new Set())
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'room', type: 'room', name: 'Charge to Room', icon: IoBedOutline, available: true, selected: true },
    { id: 'card', type: 'card', name: 'Credit Card', icon: IoCardOutline, available: true, selected: false },
    { id: 'points', type: 'points', name: 'Loyalty Points', icon: IoSparklesOutline, available: false, selected: false }
  ])
  const [pinCode, setPinCode] = useState('')
  const [showPinEntry, setShowPinEntry] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chargeLimit, setChargeLimit] = useState(maxChargeLimit)
  const [spendingAlerts, setSpendingAlerts] = useState({
    fifty: false,
    seventyFive: false,
    ninety: false
  })
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [showReceipt, setShowReceipt] = useState(false)
  const [disputeMode, setDisputeMode] = useState(false)

  // Load charges on mount and set up auto-refresh
  useEffect(() => {
    loadCharges()
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadCharges()
        setLastRefresh(new Date())
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Check spending alerts
  useEffect(() => {
    const total = calculateTotals().grandTotal
    const percentage = (total / chargeLimit) * 100
    
    if (percentage >= 50 && !spendingAlerts.fifty) {
      setSpendingAlerts(prev => ({ ...prev, fifty: true }))
    }
    if (percentage >= 75 && !spendingAlerts.seventyFive) {
      setSpendingAlerts(prev => ({ ...prev, seventyFive: true }))
    }
    if (percentage >= 90 && !spendingAlerts.ninety) {
      setSpendingAlerts(prev => ({ ...prev, ninety: true }))
    }
  }, [charges, chargeLimit])

  // Load room charges
  const loadCharges = async () => {
    try {
      // This would normally fetch from API
      // Mock data for now
      const mockCharges: RoomCharge[] = [
        {
          id: 'ch-1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          category: 'ride',
          description: 'Airport Transfer - PHX to Hotel',
          vendor: 'ItWhip Premium',
          quantity: 1,
          unitPrice: 47.00,
          totalPrice: 47.00,
          status: 'posted',
          icon: IoCarOutline,
          taxRate: 0.08,
          reference: 'RIDE-78234',
          authorizedBy: guestName
        },
        {
          id: 'ch-2',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          category: 'food',
          description: 'Room Service - Breakfast',
          vendor: 'Hotel Restaurant',
          quantity: 2,
          unitPrice: 28.50,
          totalPrice: 57.00,
          status: 'posted',
          icon: IoRestaurantOutline,
          taxRate: 0.08,
          tip: 10.00,
          serviceCharge: 5.00,
          reference: 'RS-45612',
          authorizedBy: guestName
        },
        {
          id: 'ch-3',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          category: 'amenities',
          description: 'Premium Toiletry Set',
          vendor: 'Hotel Store',
          quantity: 1,
          unitPrice: 35.00,
          totalPrice: 35.00,
          status: 'pending',
          icon: IoBasketOutline,
          taxRate: 0.08,
          reference: 'STORE-90123',
          authorizedBy: guestName
        },
        {
          id: 'ch-4',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          category: 'minibar',
          description: 'Minibar Charges',
          vendor: 'In-Room Dining',
          quantity: 3,
          unitPrice: 12.00,
          totalPrice: 36.00,
          status: 'pending',
          icon: IoSparklesOutline,
          taxRate: 0.08,
          reference: 'MB-67890',
          authorizedBy: 'Auto-charge'
        },
        {
          id: 'ch-5',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          category: 'spa',
          description: 'Spa Treatment - Swedish Massage',
          vendor: 'Serenity Spa',
          quantity: 1,
          unitPrice: 150.00,
          totalPrice: 150.00,
          status: 'pending',
          icon: IoSparklesOutline,
          taxRate: 0.08,
          tip: 30.00,
          reference: 'SPA-11223',
          authorizedBy: guestName
        }
      ]
      
      setCharges(mockCharges)
    } catch (error) {
      console.error('Failed to load charges:', error)
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    const activeCharges = charges.filter(c => c.status !== 'removed')
    
    const subtotal = activeCharges.reduce((sum, charge) => sum + charge.totalPrice, 0)
    const tax = activeCharges.reduce((sum, charge) => sum + (charge.totalPrice * charge.taxRate), 0)
    const tips = activeCharges.reduce((sum, charge) => sum + (charge.tip || 0), 0)
    const serviceCharges = activeCharges.reduce((sum, charge) => sum + (charge.serviceCharge || 0), 0)
    const grandTotal = subtotal + tax + tips + serviceCharges
    
    return { subtotal, tax, tips, serviceCharges, grandTotal }
  }

  // Get charges by category
  const getChargesByCategory = (): ChargeCategory[] => {
    const categories: { [key: string]: ChargeCategory } = {}
    
    charges
      .filter(c => c.status !== 'removed')
      .forEach(charge => {
        if (!categories[charge.category]) {
          categories[charge.category] = {
            id: charge.category,
            name: charge.category.charAt(0).toUpperCase() + charge.category.slice(1),
            icon: charge.icon,
            total: 0,
            count: 0,
            color: getCategoryColor(charge.category)
          }
        }
        
        categories[charge.category].total += charge.totalPrice
        categories[charge.category].count += 1
      })
    
    return Object.values(categories).sort((a, b) => b.total - a.total)
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'ride': return 'text-green-600 bg-green-50'
      case 'food': return 'text-orange-600 bg-orange-50'
      case 'amenities': return 'text-blue-600 bg-blue-50'
      case 'spa': return 'text-purple-600 bg-purple-50'
      case 'minibar': return 'text-pink-600 bg-pink-50'
      case 'service': return 'text-indigo-600 bg-indigo-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Toggle charge selection
  const toggleChargeSelection = (chargeId: string) => {
    const newSelected = new Set(selectedCharges)
    if (newSelected.has(chargeId)) {
      newSelected.delete(chargeId)
    } else {
      newSelected.add(chargeId)
    }
    setSelectedCharges(newSelected)
  }

  // Dispute charges
  const disputeCharges = () => {
    if (selectedCharges.size === 0) return
    
    setCharges(charges.map(charge => 
      selectedCharges.has(charge.id)
        ? { ...charge, status: 'disputed' as const }
        : charge
    ))
    
    setSelectedCharges(new Set())
    setDisputeMode(false)
  }

  // Remove charge
  const removeCharge = (chargeId: string) => {
    setCharges(charges.map(charge => 
      charge.id === chargeId
        ? { ...charge, status: 'removed' as const }
        : charge
    ))
  }

  // Process payment
  const processPayment = async () => {
    if (requirePin && !pinCode) {
      setShowPinEntry(true)
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mark all pending charges as posted
      setCharges(charges.map(charge => 
        charge.status === 'pending'
          ? { ...charge, status: 'posted' as const }
          : charge
      ))
      
      if (onPaymentComplete) {
        onPaymentComplete(charges.filter(c => c.status === 'pending'))
      }
      
      setPinCode('')
      setShowPinEntry(false)
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 60) {
      return `${minutes} min ago`
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Export receipt
  const exportReceipt = (format: 'pdf' | 'email') => {
    // This would normally generate PDF or send email
    console.log(`Exporting receipt as ${format}`)
    setShowReceipt(false)
  }

  const totals = calculateTotals()
  const categories = getChargesByCategory()
  const chargePercentage = (totals.grandTotal / chargeLimit) * 100

  // Compact view (default)
  if (!expandedView) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <IoBedOutline className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Room {roomNumber}</h3>
          </div>
          <button
            onClick={() => setExpandedView(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Expand"
          >
            <IoExpandOutline className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Quick Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Charges</span>
            <span className="text-lg font-bold text-gray-900">
              ${totals.grandTotal.toFixed(2)}
            </span>
          </div>
          
          {/* Spending Indicator */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  chargePercentage >= 90 ? 'bg-red-500' :
                  chargePercentage >= 75 ? 'bg-orange-500' :
                  chargePercentage >= 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(chargePercentage, 100)}%` }}
              />
            </div>
            {chargePercentage >= 75 && (
              <p className="text-xs text-orange-600 mt-1">
                {chargePercentage >= 90 ? '⚠️ Near limit' : 'Approaching limit'}
              </p>
            )}
          </div>
          
          {/* Recent Charges */}
          <div className="space-y-1">
            {charges.slice(0, 2).map(charge => (
              <div key={charge.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <charge.icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600 truncate max-w-[150px]">
                    {charge.description}
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  ${charge.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          {charges.length > 2 && (
            <button
              onClick={() => setExpandedView(true)}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              +{charges.length - 2} more charges
            </button>
          )}
          
          {/* Quick Actions */}
          <div className="pt-2 flex space-x-2">
            <button
              onClick={() => setExpandedView(true)}
              className="flex-1 bg-green-600 text-white text-sm rounded-lg py-2 hover:bg-green-700 transition-colors"
            >
              Review Charges
            </button>
            {charges.some(c => c.status === 'pending') && (
              <button
                onClick={processPayment}
                className="flex-1 bg-blue-600 text-white text-sm rounded-lg py-2 hover:bg-blue-700 transition-colors"
              >
                Approve All
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Receipt modal
  if (showReceipt) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Receipt</h3>
          <button
            onClick={() => setShowReceipt(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>
        
        {/* Hotel Header */}
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold text-gray-900">{hotelName}</h4>
          <p className="text-sm text-gray-500">Room {roomNumber} • {guestName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleString()}
          </p>
        </div>
        
        {/* Charges List */}
        <div className="space-y-2 mb-4">
          {charges
            .filter(c => c.status !== 'removed')
            .map(charge => (
              <div key={charge.id} className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-900">{charge.description}</p>
                  <p className="text-xs text-gray-500">{formatTime(charge.timestamp)}</p>
                </div>
                <p className="font-medium text-gray-900">
                  ${charge.totalPrice.toFixed(2)}
                </p>
              </div>
            ))}
        </div>
        
        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">${totals.tax.toFixed(2)}</span>
          </div>
          {totals.tips > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tips</span>
              <span className="text-gray-900">${totals.tips.toFixed(2)}</span>
            </div>
          )}
          {totals.serviceCharges > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charges</span>
              <span className="text-gray-900">${totals.serviceCharges.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span className="text-lg">${totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => exportReceipt('pdf')}
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 rounded-lg py-2 hover:bg-gray-200 transition-colors"
          >
            <IoDownloadOutline className="w-4 h-4" />
            <span className="text-sm">Download PDF</span>
          </button>
          <button
            onClick={() => exportReceipt('email')}
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 rounded-lg py-2 hover:bg-gray-200 transition-colors"
          >
            <IoMailOutline className="w-4 h-4" />
            <span className="text-sm">Email Receipt</span>
          </button>
        </div>
      </div>
    )
  }

  // Expanded view
  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IoBedOutline className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Room {roomNumber} Charges</h3>
              <p className="text-sm text-gray-500">{hotelName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <IoRefreshOutline className="w-4 h-4" />
            </button>
            
            {/* Manual refresh */}
            <button
              onClick={() => {
                loadCharges()
                setLastRefresh(new Date())
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh now"
            >
              <IoRefreshOutline className="w-4 h-4" />
            </button>
            
            {/* Contract view */}
            <button
              onClick={() => setExpandedView(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Minimize"
            >
              <IoContractOutline className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Last refresh time */}
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {formatTime(lastRefresh.toISOString())}
        </p>
      </div>

      {/* Spending Limit Alert */}
      {chargePercentage >= 75 && (
        <div className={`p-3 ${
          chargePercentage >= 90 ? 'bg-red-50' : 'bg-orange-50'
        }`}>
          <div className="flex items-center">
            <IoWarningOutline className={`w-5 h-5 mr-2 ${
              chargePercentage >= 90 ? 'text-red-600' : 'text-orange-600'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                chargePercentage >= 90 ? 'text-red-900' : 'text-orange-900'
              }`}>
                {chargePercentage >= 90 
                  ? `Critical: You've used ${chargePercentage.toFixed(0)}% of your charge limit`
                  : `Alert: You've used ${chargePercentage.toFixed(0)}% of your charge limit`
                }
              </p>
              <p className={`text-xs mt-1 ${
                chargePercentage >= 90 ? 'text-red-700' : 'text-orange-700'
              }`}>
                ${totals.grandTotal.toFixed(2)} of ${chargeLimit.toFixed(2)} limit
              </p>
            </div>
            <button
              onClick={() => setChargeLimit(chargeLimit + 1000)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Increase Limit
            </button>
          </div>
        </div>
      )}

      {/* Category Summary */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
            <div key={category.id} className={`rounded-lg p-3 ${category.color}`}>
              <div className="flex items-center justify-between mb-1">
                <category.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{category.count}</span>
              </div>
              <p className="text-sm font-medium capitalize">{category.name}</p>
              <p className="text-lg font-bold">${category.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charges List */}
      <div className="max-h-96 overflow-y-auto">
        {disputeMode && (
          <div className="p-3 bg-amber-50 border-b border-amber-200">
            <p className="text-sm text-amber-900">
              Select charges to dispute, then click "Dispute Selected"
            </p>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {charges.map(charge => (
            <div 
              key={charge.id} 
              className={`p-4 hover:bg-gray-50 transition-colors ${
                charge.status === 'disputed' ? 'bg-red-50' :
                charge.status === 'removed' ? 'bg-gray-50 opacity-50' :
                ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {disputeMode && charge.status !== 'removed' && (
                    <input
                      type="checkbox"
                      checked={selectedCharges.has(charge.id)}
                      onChange={() => toggleChargeSelection(charge.id)}
                      className="mt-1 text-green-600"
                    />
                  )}
                  
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <charge.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{charge.description}</p>
                      {charge.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                      {charge.status === 'disputed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Disputed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span>{charge.vendor}</span>
                      <span>•</span>
                      <span>{formatTime(charge.timestamp)}</span>
                      {charge.reference && (
                        <>
                          <span>•</span>
                          <span>Ref: {charge.reference}</span>
                        </>
                      )}
                    </div>
                    
                    {charge.quantity > 1 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {charge.quantity} × ${charge.unitPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-lg font-semibold text-gray-900">
                    ${charge.totalPrice.toFixed(2)}
                  </p>
                  
                  {(charge.tip || charge.serviceCharge) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {charge.tip && <p>+${charge.tip.toFixed(2)} tip</p>}
                      {charge.serviceCharge && <p>+${charge.serviceCharge.toFixed(2)} service</p>}
                    </div>
                  )}
                  
                  {charge.status === 'pending' && !disputeMode && (
                    <button
                      onClick={() => removeCharge(charge.id)}
                      className="text-xs text-red-600 hover:text-red-700 mt-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200">
        {/* Totals */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm text-gray-900">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Tax & Fees</span>
            <span className="text-sm text-gray-900">
              ${(totals.tax + totals.serviceCharges).toFixed(2)}
            </span>
          </div>
          {totals.tips > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tips</span>
              <span className="text-sm text-gray-900">${totals.tips.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-green-600">
              ${totals.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PIN Entry */}
        {showPinEntry && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Room PIN to Approve
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="4-digit PIN"
                maxLength={4}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={processPayment}
                disabled={pinCode.length !== 4}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors"
          >
            <IoReceiptOutline className="w-4 h-4" />
            <span>Receipt</span>
          </button>
          
          <button
            onClick={() => setDisputeMode(!disputeMode)}
            className="flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors"
          >
            <IoWarningOutline className="w-4 h-4" />
            <span>{disputeMode ? 'Cancel' : 'Dispute'}</span>
          </button>
          
          {disputeMode ? (
            <button
              onClick={disputeCharges}
              disabled={selectedCharges.size === 0}
              className="col-span-2 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 transition-colors disabled:bg-gray-300"
            >
              Dispute Selected ({selectedCharges.size})
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center space-x-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors"
              >
                <IoInformationCircleOutline className="w-4 h-4" />
                <span>Details</span>
              </button>
              
              <button
                onClick={processPayment}
                disabled={!charges.some(c => c.status === 'pending') || isLoading}
                className="flex items-center justify-center space-x-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors disabled:bg-gray-300"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle className="w-4 h-4" />
                    <span>Approve All</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-700">Secure Room Charging</p>
              <p>All charges are encrypted and require authorization. You can dispute any charge within 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}