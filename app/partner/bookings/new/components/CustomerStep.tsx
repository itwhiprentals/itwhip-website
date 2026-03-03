// app/partner/bookings/new/components/CustomerStep.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoSearchOutline,
  IoPersonOutline,
  IoAddOutline,
  IoCloseOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5'
import { Customer } from '../types'

interface CustomerStepProps {
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer | null) => void
  onNext: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string
  setError: (error: string) => void
}

export default function CustomerStep({
  selectedCustomer,
  onSelectCustomer,
  onNext,
  loading,
  setLoading,
  error,
  setError,
}: CustomerStepProps) {
  const t = useTranslations('PartnerBookingNew')

  const [customerSearch, setCustomerSearch] = useState('')
  const [yourCustomers, setYourCustomers] = useState<Customer[]>([])
  const [otherMembers, setOtherMembers] = useState<Customer[]>([])
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [createAccount, setCreateAccount] = useState(false)

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setNewCustomer(prev => ({ ...prev, phone: formatted }))
  }

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setYourCustomers([])
      setOtherMembers([])
      return
    }
    try {
      const response = await fetch(`/api/partner/customers/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setYourCustomers(data.yourCustomers || [])
        setOtherMembers(data.otherMembers || [])
      }
    } catch {
      console.error('Search failed')
    }
  }

  const hasSearchResults = yourCustomers.length > 0 || otherMembers.length > 0

  const createNewCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.email) {
      setError(t('firstNameEmailRequired'))
      return
    }

    setLoading(true)
    setError('')

    const fullName = `${newCustomer.firstName.trim()} ${newCustomer.lastName.trim()}`.trim()
    const emailLower = newCustomer.email.trim().toLowerCase()

    if (!createAccount) {
      // Guest-only: no User account created, just store info locally
      onSelectCustomer({
        id: `guest_${Date.now()}`,
        name: fullName,
        email: emailLower,
        phone: newCustomer.phone || null,
        photo: null,
        isGuestOnly: true,
      })
      setShowNewCustomerForm(false)
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' })
      setLoading(false)
      onNext()
      return
    }

    // Create account: call API to create User record
    try {
      const response = await fetch('/api/partner/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newCustomer.firstName.trim(),
          lastName: newCustomer.lastName.trim(),
          email: emailLower,
          phone: newCustomer.phone || null
        })
      })

      const data = await response.json()

      if (data.success) {
        onSelectCustomer(data.customer)
        setShowNewCustomerForm(false)
        setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' })
        onNext()
      } else {
        setError(data.error || t('failedCreateCustomer'))
      }
    } catch {
      setError(t('failedCreateCustomer'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {selectedCustomer ? (
        <>
          {/* Selected customer card */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              {selectedCustomer.photo ? (
                <img src={selectedCustomer.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <IoPersonOutline className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectCustomer(null)}
              className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-gray-700"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={onNext}
            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {t('continueToVerification')}
            <IoChevronForwardOutline className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          {/* Search card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchCustomerPlaceholder')}
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  searchCustomers(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Results */}
          {hasSearchResults && (
            <div className="space-y-3">
              {/* Tier 1: Your Customers */}
              {yourCustomers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 px-1">{t('yourCustomers')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
                    {yourCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          onSelectCustomer(customer)
                          setCustomerSearch('')
                          setYourCustomers([])
                          setOtherMembers([])
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      >
                        {customer.photo ? (
                          <img src={customer.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <IoPersonOutline className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{customer.phone}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {customer.stripeIdentityStatus === 'verified' && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                              {t('verified')}
                            </span>
                          )}
                          {(customer.totalBookings ?? 0) > 0 && (
                            <span className="text-xs text-gray-400">
                              {t('tripCount', { count: customer.totalBookings })}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 2: Other Members */}
              {otherMembers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 px-1">{t('otherMembers')}</p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
                    {otherMembers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          onSelectCustomer(customer)
                          setCustomerSearch('')
                          setYourCustomers([])
                          setOtherMembers([])
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      >
                        {customer.photo ? (
                          <img src={customer.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <IoPersonOutline className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{t('itwhipMember')}</p>
                        </div>
                        {customer.stripeIdentityStatus === 'verified' && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                            {t('verified')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create New Customer */}
          {!showNewCustomerForm ? (
            <button
              onClick={() => setShowNewCustomerForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
              {t('createNewCustomer')}
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">{t('newCustomerTitle')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('firstNameLabel')}</label>
                  <input
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    placeholder={t('firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('lastNameLabel')}</label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phoneLabel')}</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  placeholder={t('phonePlaceholder')}
                />
              </div>
              {/* Create Account Toggle */}
              <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('createAccountToggle')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('createAccountToggleDescription')}</p>
                </div>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={createNewCustomer}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium"
                >
                  {loading ? t('creating') : t('createAndSelect')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
