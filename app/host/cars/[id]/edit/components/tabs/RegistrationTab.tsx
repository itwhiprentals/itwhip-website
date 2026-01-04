// app/host/cars/[id]/edit/components/tabs/RegistrationTab.tsx
'use client'

import { IoInformationCircleOutline, IoLockClosedOutline } from 'react-icons/io5'
import AddressAutocomplete from '../AddressAutocomplete'
import type { CarFormData } from '../../types'
import { US_STATES, TITLE_STATUSES } from '../../types'

interface RegistrationTabProps {
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  isLocked: boolean
  isApproved: boolean
  isFieldLocked: (fieldName: string) => boolean
}

export function RegistrationTab({
  formData,
  setFormData,
  isLocked,
  isApproved,
  isFieldLocked
}: RegistrationTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <IoInformationCircleOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
            Registration & Documentation Information
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            This information is required for insurance claims and regulatory compliance. Complete vehicle registration details ensure smooth claim processing and legal compliance with DMV/ADOT requirements.
          </p>
        </div>
      </div>

      {isLocked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Registration information cannot be modified while vehicle has an active claim
          </p>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registration & Ownership</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span>State of Registration <span className="text-red-500">*</span></span>
            {isFieldLocked('registrationState') && isApproved && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-normal">
                <IoLockClosedOutline className="w-3 h-3" />
                Locked
              </span>
            )}
          </label>
          <select
            value={formData.registrationState}
            onChange={(e) => setFormData({ ...formData, registrationState: e.target.value })}
            disabled={isFieldLocked('registrationState')}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isFieldLocked('registrationState') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
          >
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">State where vehicle is registered</p>
        </div>

        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Registration Expiration Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.registrationExpiryDate}
            onChange={(e) => setFormData({ ...formData, registrationExpiryDate: e.target.value })}
            disabled={isLocked}
            placeholder="Select expiration date"
            style={{ textAlign: 'left', WebkitAppearance: 'none' }}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-left [&::-webkit-datetime-edit]:text-left [&::-webkit-datetime-edit-fields-wrapper]:text-left [&::-webkit-date-and-time-value]:text-left ${!formData.registrationExpiryDate ? 'text-gray-400' : ''} ${isLocked ? 'opacity-60 cursor-not-allowed !bg-gray-50 dark:!bg-gray-900' : ''}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.registrationExpiryDate ? 'Date shown on registration card' : 'Select the expiration date from your registration card'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Registered Owner Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.registeredOwner}
            onChange={(e) => setFormData({ ...formData, registeredOwner: e.target.value })}
            disabled={isLocked}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            placeholder="Name exactly as shown on title"
          />
          <p className="text-xs text-gray-500 mt-1">Must match vehicle title</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.titleStatus}
            onChange={(e) => setFormData({ ...formData, titleStatus: e.target.value })}
            disabled={isLocked}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
          >
            {TITLE_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Vehicle Value <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.estimatedValue}
              onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
              disabled={isLocked}
              min="0"
              step="1000"
              className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
              placeholder="Current market value"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Current fair market value</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Odometer Reading
          </label>
          <input
            type="number"
            value={formData.currentMileage}
            onChange={(e) => setFormData({ ...formData, currentMileage: parseInt(e.target.value) || 0 })}
            disabled={isLocked}
            min="0"
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            placeholder="Miles"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Garage/Storage Location</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Where the vehicle is normally parked overnight (Required for insurance)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Garage Address <span className="text-red-500">*</span>
            </label>
            <AddressAutocomplete
              value={formData.garageAddress || ''}
              city={formData.garageCity}
              state={formData.garageState}
              zipCode={formData.garageZip}
              onAddressSelect={(address) => {
                setFormData(prev => ({
                  ...prev,
                  garageAddress: address.streetAddress,
                  garageCity: address.city,
                  garageState: address.state,
                  garageZip: address.zipCode
                }))
              }}
              disabled={isLocked}
              placeholder="Search for garage/storage address..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.garageCity}
              readOnly
              disabled={isLocked}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
              placeholder="Auto-filled"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.garageState}
                readOnly
                disabled={isLocked}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
                placeholder="Auto-filled"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.garageZip}
                readOnly
                disabled={isLocked}
                maxLength={10}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
                placeholder="Auto-filled"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Lien Information</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">If vehicle is financed or leased</p>

        <div className="space-y-4">
          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.hasLien}
              onChange={(e) => setFormData({ ...formData, hasLien: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Vehicle has a lien (financed/leased)</span>
          </label>

          {formData.hasLien && (
            <div className="ml-7 grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lienholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lienholderName}
                  onChange={(e) => setFormData({ ...formData, lienholderName: e.target.value })}
                  disabled={isLocked}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  placeholder="e.g., Chase Auto Finance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lienholder Address
                </label>
                <input
                  type="text"
                  value={formData.lienholderAddress}
                  onChange={(e) => setFormData({ ...formData, lienholderAddress: e.target.value })}
                  disabled={isLocked}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  placeholder="Lienholder's mailing address"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Safety & Anti-Theft Features</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">These features may reduce insurance premiums</p>

        <div className="space-y-3">
          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.hasAlarm}
              onChange={(e) => setFormData({ ...formData, hasAlarm: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Car Alarm System</span>
          </label>

          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.hasTracking}
              onChange={(e) => setFormData({ ...formData, hasTracking: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">GPS Tracking Device</span>
          </label>

          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.hasImmobilizer}
              onChange={(e) => setFormData({ ...formData, hasImmobilizer: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Engine Immobilizer</span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vehicle Modifications & Usage</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Use
            </label>
            <select
              value={formData.primaryUse}
              onChange={(e) => setFormData({ ...formData, primaryUse: e.target.value })}
              disabled={isLocked}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            >
              <option value="Rental">Rental Only</option>
              <option value="Personal">Personal & Rental</option>
              <option value="Business">Business Use</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Annual Mileage Estimate
            </label>
            <input
              type="number"
              value={formData.annualMileage}
              onChange={(e) => setFormData({ ...formData, annualMileage: parseInt(e.target.value) || 0 })}
              disabled={isLocked}
              min="0"
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
              placeholder="Miles driven per year"
            />
          </div>

          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.isModified}
              onChange={(e) => setFormData({ ...formData, isModified: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Vehicle has aftermarket modifications</span>
          </label>

          {formData.isModified && (
            <div className="ml-7">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Describe Modifications
              </label>
              <textarea
                value={formData.modifications}
                onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                disabled={isLocked}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                placeholder="List modifications (engine, suspension, body kit, etc.)"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistrationTab

