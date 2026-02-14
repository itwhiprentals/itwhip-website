// app/(guest)/rentals/components/verification/DocumentUpload.tsx
'use client'

import { useState } from 'react'
import { 
  IoCloudUploadOutline,
  IoDocumentOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle
} from 'react-icons/io5'

interface DocumentUploadProps {
  bookingId: string
  token: string
  onUploadComplete: () => void
}

export default function DocumentUpload({ 
  bookingId, 
  token, 
  onUploadComplete 
}: DocumentUploadProps) {
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [licenseUrl, setLicenseUrl] = useState('')
  const [insuranceUrl, setInsuranceUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (type: 'license' | 'insurance', file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    setError('')
    if (type === 'license') {
      setLicenseFile(file)
    } else {
      setInsuranceFile(file)
    }
  }

  const uploadFile = async (file: File, type: 'license' | 'insurance') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('bookingId', bookingId)
    formData.append('token', token)

    const response = await fetch('/api/rentals/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed for ${type}`)
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async () => {
    if (!licenseFile || !insuranceFile) {
      setError('Please upload both documents')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Upload both files
      const [licenseResult, insuranceResult] = await Promise.all([
        uploadFile(licenseFile, 'license'),
        uploadFile(insuranceFile, 'insurance')
      ])

      setLicenseUrl(licenseResult)
      setInsuranceUrl(insuranceResult)
      
      // Notify parent component
      onUploadComplete()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload documents. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Verification Documents
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please upload clear photos of your driver's license and insurance proof
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <IoInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Document Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Clear, readable photos</li>
              <li>All information must be visible</li>
              <li>No glare or shadows</li>
              <li>File size under 10MB</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Fields */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Driver's License */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Driver's License
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            licenseFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
          }`}>
            {licenseFile ? (
              <div>
                <IoCheckmarkCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {licenseFile.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {(licenseFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <IoDocumentOutline className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload or drag and drop
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect('license', e.target.files[0])}
              className="hidden"
              id="license-upload"
              disabled={uploading}
            />
            <label
              htmlFor="license-upload"
              className="mt-2 inline-block px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              {licenseFile ? 'Change File' : 'Select File'}
            </label>
          </div>
        </div>

        {/* Insurance Proof */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Insurance Proof
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            insuranceFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
          }`}>
            {insuranceFile ? (
              <div>
                <IoCheckmarkCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {insuranceFile.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {(insuranceFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <IoDocumentOutline className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload or drag and drop
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect('insurance', e.target.files[0])}
              className="hidden"
              id="insurance-upload"
              disabled={uploading}
            />
            <label
              htmlFor="insurance-upload"
              className="mt-2 inline-block px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              {insuranceFile ? 'Change File' : 'Select File'}
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <IoAlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!licenseFile || !insuranceFile || uploading}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            uploading || !licenseFile || !insuranceFile
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {uploading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Uploading...
            </div>
          ) : (
            <div className="flex items-center">
              <IoCloudUploadOutline className="w-5 h-5 mr-2" />
              Submit Documents
            </div>
          )}
        </button>
      </div>
    </div>
  )
}