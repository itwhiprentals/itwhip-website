// app/components/host/AddServiceRecordModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { calculateNextServiceDue, getServiceIntervalDescription } from '@/app/lib/service/calculate-next-service-due'
import { ServiceType } from '@prisma/client'

interface AddServiceRecordModalProps {
  carId: string
  onClose: () => void
  onSuccess: () => void
}

const SERVICE_TYPES = [
  { value: 'OIL_CHANGE', label: 'Oil Change' },
  { value: 'STATE_INSPECTION', label: 'State Inspection' },
  { value: 'TIRE_ROTATION', label: 'Tire Rotation' },
  { value: 'BRAKE_CHECK', label: 'Brake Inspection' },
  { value: 'FLUID_CHECK', label: 'Fluid Service' },
  { value: 'BATTERY_CHECK', label: 'Battery Check' },
  { value: 'AIR_FILTER', label: 'Air Filter Replacement' },
  { value: 'MAJOR_SERVICE_30K', label: '30,000 Mile Service' },
  { value: 'MAJOR_SERVICE_60K', label: '60,000 Mile Service' },
  { value: 'MAJOR_SERVICE_90K', label: '90,000 Mile Service' },
  { value: 'CUSTOM', label: 'Custom Service' }
]

const COMMON_ITEMS = [
  'Oil',
  'Oil Filter',
  'Air Filter',
  'Cabin Air Filter',
  'Spark Plugs',
  'Brake Pads',
  'Brake Fluid',
  'Coolant',
  'Transmission Fluid',
  'Power Steering Fluid',
  'Windshield Wipers',
  'Battery',
  'Tires Rotated',
  'Tires Balanced',
  'Wheel Alignment'
]

export default function AddServiceRecordModal({ carId, onClose, onSuccess }: AddServiceRecordModalProps) {
  const [formData, setFormData] = useState({
    serviceType: 'OIL_CHANGE',
    serviceDate: new Date().toISOString().split('T')[0],
    mileageAtService: '',
    shopName: '',
    shopAddress: '',
    technicianName: '',
    invoiceNumber: '',
    costTotal: '',
    notes: '',
    nextServiceDue: '',
    nextServiceMileage: '',
    itemsServiced: [] as string[]
  })

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string>('')
  const [inspectionFile, setInspectionFile] = useState<File | null>(null)
  const [inspectionUrl, setInspectionUrl] = useState<string>('')
  
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  // Auto-calculate next service due when service type or date changes
  useEffect(() => {
    if (formData.serviceType && formData.serviceDate && formData.mileageAtService) {
      const calculated = calculateNextServiceDue(
        formData.serviceType as ServiceType,
        formData.serviceDate,
        parseInt(formData.mileageAtService)
      )

      if (calculated.nextServiceDue) {
        setFormData(prev => ({
          ...prev,
          nextServiceDue: calculated.nextServiceDue 
            ? new Date(calculated.nextServiceDue).toISOString().split('T')[0]
            : ''
        }))
      }

      if (calculated.nextServiceMileage) {
        setFormData(prev => ({
          ...prev,
          nextServiceMileage: calculated.nextServiceMileage?.toString() || ''
        }))
      }
    }
  }, [formData.serviceType, formData.serviceDate, formData.mileageAtService])

  const handleFileUpload = async (file: File, type: 'receipt' | 'inspection') => {
    try {
      setUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('upload_preset', 'ml_default')
      formDataUpload.append('folder', 'service-records')

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/du1hjyrgm/auto/upload',
        {
          method: 'POST',
          body: formDataUpload
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      
      if (type === 'receipt') {
        setReceiptUrl(data.secure_url)
      } else {
        setInspectionUrl(data.secure_url)
      }

      return data.secure_url
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({
        ...prev,
        [type]: 'Upload failed. Please try again.'
      }))
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, receipt: 'Please upload an image or PDF file' }))
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receipt: 'File size must be less than 10MB' }))
        return
      }
      
      setReceiptFile(file)
      await handleFileUpload(file, 'receipt')
    }
  }

  const handleInspectionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, inspection: 'Please upload an image or PDF file' }))
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, inspection: 'File size must be less than 10MB' }))
        return
      }
      
      setInspectionFile(file)
      await handleFileUpload(file, 'inspection')
    }
  }

  const toggleItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      itemsServiced: prev.itemsServiced.includes(item)
        ? prev.itemsServiced.filter(i => i !== item)
        : [...prev.itemsServiced, item]
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
    if (!formData.serviceDate) newErrors.serviceDate = 'Service date is required'
    if (!formData.mileageAtService) newErrors.mileageAtService = 'Mileage is required'
    if (!formData.shopName) newErrors.shopName = 'Shop name is required'
    if (!formData.shopAddress) newErrors.shopAddress = 'Shop address is required'
    if (!formData.costTotal) newErrors.costTotal = 'Cost is required'
    if (!receiptUrl) newErrors.receipt = 'Receipt upload is required'

    if (formData.serviceType === 'STATE_INSPECTION' && !inspectionUrl) {
      newErrors.inspection = 'Inspection report is required for state inspections'
    }

    const mileage = parseInt(formData.mileageAtService)
    if (isNaN(mileage) || mileage < 0) {
      newErrors.mileageAtService = 'Please enter a valid mileage'
    }

    const cost = parseFloat(formData.costTotal)
    if (isNaN(cost) || cost < 0) {
      newErrors.costTotal = 'Please enter a valid cost'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      const response = await fetch(`/api/host/cars/${carId}/service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          serviceDate: formData.serviceDate,
          mileageAtService: parseInt(formData.mileageAtService),
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          technicianName: formData.technicianName || null,
          invoiceNumber: formData.invoiceNumber || null,
          receiptUrl: receiptUrl,
          inspectionReportUrl: inspectionUrl || null,
          itemsServiced: formData.itemsServiced,
          costTotal: parseFloat(formData.costTotal),
          notes: formData.notes || null,
          nextServiceDue: formData.nextServiceDue || null,
          nextServiceMileage: formData.nextServiceMileage ? parseInt(formData.nextServiceMileage) : null
        })
      })

      if (response.ok) {
        setSuccessMessage('Service record added successfully!')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        const data = await response.json()
        setErrors({ general: data.error || data.message || 'Failed to add service record' })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Service Record
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="m-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-300">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <IoInformationCircleOutline className="w-3 h-3" />
              Typical interval: {getServiceIntervalDescription(formData.serviceType as ServiceType)}
            </p>
          </div>

          {/* Service Date and Mileage */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.serviceDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.serviceDate && (
                <p className="text-xs text-red-500 mt-1">{errors.serviceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mileage at Service <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.mileageAtService}
                onChange={(e) => setFormData({ ...formData, mileageAtService: e.target.value })}
                min="0"
                placeholder="50000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.mileageAtService ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.mileageAtService && (
                <p className="text-xs text-red-500 mt-1">{errors.mileageAtService}</p>
              )}
            </div>
          </div>

          {/* Shop Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                placeholder="Quick Lube Auto Service"
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.shopName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.shopName && (
                <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shopAddress}
                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                placeholder="123 Main St, Phoenix, AZ 85001"
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.shopAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.shopAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.shopAddress}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technician Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.technicianName}
                  onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                  placeholder="Mike Johnson"
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-12345"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Cost <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.costTotal}
                onChange={(e) => setFormData({ ...formData, costTotal: e.target.value })}
                min="0"
                max="50000"
                step="0.01"
                placeholder="75.99"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.costTotal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            {errors.costTotal && (
              <p className="text-xs text-red-500 mt-1">{errors.costTotal}</p>
            )}
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt Upload <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {receiptUrl ? (
                <div className="flex items-center gap-3">
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Receipt uploaded</p>
                    <a 
                      href={receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      View receipt
                    </a>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploading ? 'Uploading...' : 'Click to upload receipt'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (max 10MB)</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {errors.receipt && (
              <p className="text-xs text-red-500 mt-1">{errors.receipt}</p>
            )}
          </div>

          {/* Inspection Report Upload (for inspections only) */}
          {formData.serviceType === 'STATE_INSPECTION' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inspection Report <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {inspectionUrl ? (
                  <div className="flex items-center gap-3">
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">Inspection report uploaded</p>
                      <a 
                        href={inspectionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View report
                      </a>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <IoDocumentTextOutline className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploading ? 'Uploading...' : 'Click to upload inspection report'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (max 10MB)</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleInspectionChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              {errors.inspection && (
                <p className="text-xs text-red-500 mt-1">{errors.inspection}</p>
              )}
            </div>
          )}

          {/* Items Serviced */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items Serviced
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {COMMON_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.itemsServiced.includes(item)}
                    onChange={() => toggleItem(item)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Next Service Due */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <IoCalendarOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Next Service Due (Auto-calculated)
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  You can override these values if needed
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Service Date
                </label>
                <input
                  type="date"
                  value={formData.nextServiceDue}
                  onChange={(e) => setFormData({ ...formData, nextServiceDue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Service Mileage
                </label>
                <input
                  type="number"
                  value={formData.nextServiceMileage}
                  onChange={(e) => setFormData({ ...formData, nextServiceMileage: e.target.value })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              maxLength={2000}
              placeholder="Any additional notes about this service..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
              {formData.notes.length}/2000
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || !receiptUrl}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Add Service Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}