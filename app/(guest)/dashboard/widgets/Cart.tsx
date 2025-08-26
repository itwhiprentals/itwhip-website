// app/(guest)/dashboard/widgets/Cart.tsx
// Shopping Cart Widget - Displays cart items and checkout options

'use client'

import { useState } from 'react'
import { 
  IoCartOutline,
  IoTrashOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface CartItem {
  id: string
  name: string
  price: number
  quantity?: number
  category?: string
  description?: string
}

interface CartProps {
  items: CartItem[]
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  isCompact?: boolean
}

export default function Cart({ items, onRemoveItem, onCheckout, isCompact = false }: CartProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {}
    items.forEach(item => {
      initial[item.id] = item.quantity || 1
    })
    return initial
  })

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => {
      const newQuantity = (prev[itemId] || 1) + change
      if (newQuantity < 1) return prev
      return { ...prev, [itemId]: newQuantity }
    })
  }

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const quantity = quantities[item.id] || 1
      return total + (item.price * quantity)
    }, 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCartOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Your cart is empty</p>
          <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
        </div>
      </div>
    )
  }

  if (isCompact) {
    // Compact version for sidebar
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <IoCartOutline className="w-5 h-5 mr-2" />
            Cart ({items.length})
          </h3>
          <span className="text-sm font-semibold text-green-600">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>

        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    ${item.price.toFixed(2)} × {quantities[item.id] || 1}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <IoTrashOutline className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Checkout • ${calculateTotal().toFixed(2)}
        </button>
      </div>
    )
  }

  // Full version
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <IoCartOutline className="w-6 h-6 mr-2" />
          Shopping Cart
        </h2>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <IoCartOutline className="w-8 h-8 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                  {item.category && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <IoTrashOutline className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <IoRemoveOutline className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantities[item.id] || 1}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <IoAddOutline className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="font-semibold text-gray-900">
                  ${(item.price * (quantities[item.id] || 1)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">${calculateTax(calculateSubtotal()).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Actions */}
      <div className="mt-6 space-y-3">
        <button
          onClick={onCheckout}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
        >
          <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
          Proceed to Checkout
        </button>
        
        <div className="flex items-center justify-center text-xs text-gray-500">
          <IoInformationCircleOutline className="w-4 h-4 mr-1" />
          Secure checkout powered by ItWhip
        </div>
      </div>
    </div>
  )
}