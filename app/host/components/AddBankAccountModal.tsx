// app/host/components/AddBankAccountModal.tsx

'use client'

import { useState } from 'react'
import { IoCloseOutline, IoBusiness } from 'react-icons/io5'

interface AddBankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddBankAccountModal({ isOpen, onClose, onSuccess }: AddBankAccountModalProps) {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountType: 'checking'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError('Account numbers do not match')
      return
    }

    if (formData.routingNumber.length !== 9) {
      setError('Routing number must be 9 digits')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/host/banking/add-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: formData.accountHolderName,
          routingNumber: formData.routingNumber,
          accountNumber: formData.accountNumber,
          accountType: formData.accountType
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add bank account')
      }

      // Reset form and close
      setFormData({
        accountHolderName: '',
        routingNumber: '',
        accountNumber: '',
        confirmAccountNumber: '',
        accountType: 'checking'
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      setFormData({
        accountHolderName: '',
        routingNumber: '',
        accountNumber: '',
        confirmAccountNumber: '',
        accountType: 'checking'
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <IoBusiness className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Bank Account
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Holder Name *
            </label>
            <input
              type="text"
              required
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          {/* Routing Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Routing Number *
            </label>
            <input
              type="text"
              required
              pattern="[0-9]{9}"
              maxLength={9}
              value={formData.routingNumber}
              onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="110000000"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">9 digits</p>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Number *
            </label>
            <input
              type="password"
              required
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••••"
              disabled={loading}
            />
          </div>

          {/* Confirm Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Account Number *
            </label>
            <input
              type="password"
              required
              value={formData.confirmAccountNumber}
              onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••••"
              disabled={loading}
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Type *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="checking"
                  checked={formData.accountType === 'checking'}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Checking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="savings"
                  checked={formData.accountType === 'savings'}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Savings</span>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Micro-Deposit Verification</strong>
              <br />
              We'll send 2 small deposits to verify ownership. You'll confirm the amounts in 2-3 business days.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Bank Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}