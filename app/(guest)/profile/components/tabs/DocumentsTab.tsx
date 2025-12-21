// app/(guest)/profile/components/tabs/DocumentsTab.tsx
// ✅ UPDATED: Added insurance summary (synced from InsuranceTab)

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { 
  IoCloudUploadOutline, 
  IoCheckmarkCircle, 
  IoTimeOutline,
  IoCloseCircle,
  IoDocumentTextOutline,
  IoCardOutline,
  IoCameraOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoTrashOutline,
  IoImageOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface DocumentsTabProps {
  profile: {
    driversLicenseUrl?: string
    selfieUrl?: string
    additionalDocumentUrl?: string
    additionalDocumentType?: string
    documentsVerified: boolean
    documentVerifiedAt?: string
  }
  onDocumentUpdate: () => void
  onSwitchTab?: (tab: string) => void
}

type DocumentType = 'driversLicense' | 'selfie' | 'additionalDocument'

interface StagedFile {
  type: DocumentType
  file: File
  preview: string
  additionalType?: string
}

interface Insurance {
  provider: string | null
  policyNumber: string | null
  cardFrontUrl: string | null
  cardBackUrl: string | null
  verified: boolean
  status: string
}

export default function DocumentsTab({ profile, onDocumentUpdate, onSwitchTab }: DocumentsTabProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<DocumentType | null>(null)
  const [selectedAdditionalType, setSelectedAdditionalType] = useState<string>(profile.additionalDocumentType || 'passport')
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [insurance, setInsurance] = useState<Insurance | null>(null)
  const [insuranceLoading, setInsuranceLoading] = useState(true)
  
  const licenseInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)

  // Load insurance data
  useEffect(() => {
    loadInsurance()
  }, [])

  const loadInsurance = async () => {
    try {
      setInsuranceLoading(true)
      const response = await fetch('/api/guest/profile/insurance')
      if (response.ok) {
        const data = await response.json()
        setInsurance(data.current)
      }
    } catch (error) {
      console.error('Failed to load insurance:', error)
    } finally {
      setInsuranceLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const newStagedFile: StagedFile = {
        type,
        file,
        preview: reader.result as string,
        additionalType: type === 'additionalDocument' ? selectedAdditionalType : undefined
      }

      setStagedFiles(prev => {
        const filtered = prev.filter(f => f.type !== type)
        return [...filtered, newStagedFile]
      })
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  const removeStagedFile = (type: DocumentType) => {
    setStagedFiles(prev => prev.filter(f => f.type !== type))
  }

  const handleDeleteDocument = async (type: DocumentType) => {
    if (!confirm(`Are you sure you want to delete this document? You'll need to upload it again.`)) {
      return
    }

    setDeleting(type)
    try {
      const response = await fetch('/api/guest/profile/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        alert('Document removed successfully')
        onDocumentUpdate()
        sessionStorage.setItem('documentsUpdated', 'true')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove document')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to remove document. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleUploadAll = async () => {
    if (stagedFiles.length === 0) {
      alert('Please select at least one document to upload')
      return
    }

    setUploading(true)

    try {
      for (const staged of stagedFiles) {
        const formData = new FormData()
        formData.append('file', staged.file)
        formData.append('type', staged.type)
        
        if (staged.additionalType) {
          formData.append('additionalType', staged.additionalType)
        }

        const response = await fetch('/api/guest/profile/documents', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to upload ${staged.type}`)
        }
      }

      alert('All documents uploaded successfully! We will review them within 24 hours.')
      setStagedFiles([])
      onDocumentUpdate()
      sessionStorage.setItem('documentsUpdated', 'true')
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload documents. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getDocumentStatus = (hasDocument: boolean, verified: boolean) => {
    if (verified && hasDocument) {
      return {
        icon: IoCheckmarkCircle,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'Verified',
        textColor: 'text-green-800 dark:text-green-300'
      }
    }
    if (hasDocument && !verified) {
      return {
        icon: IoTimeOutline,
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'Under Review',
        textColor: 'text-yellow-800 dark:text-yellow-300'
      }
    }
    return {
      icon: IoCloseCircle,
      color: 'text-gray-400 dark:text-gray-600',
      bg: 'bg-gray-50 dark:bg-gray-900/50',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'Not Uploaded',
      textColor: 'text-gray-600 dark:text-gray-400'
    }
  }

  const licenseStatus = getDocumentStatus(!!profile.driversLicenseUrl, profile.documentsVerified)
  const selfieStatus = getDocumentStatus(!!profile.selfieUrl, profile.documentsVerified)
  const additionalStatus = getDocumentStatus(!!profile.additionalDocumentUrl, profile.documentsVerified)

  const requiredDocsUploaded = profile.driversLicenseUrl && profile.selfieUrl
  const isFullyVerified = requiredDocsUploaded && profile.documentsVerified
  const hasInsurance = insurance?.provider && insurance?.policyNumber

  const getStagedFile = (type: DocumentType) => stagedFiles.find(f => f.type === type)

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Identity Verification</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Complete verification once and enjoy instant booking for all future rentals
        </p>
      </div>

      {/* Verification Status Banner */}
      {isFullyVerified ? (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2.5">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                Fully Verified Account ✨
              </h3>
              <p className="text-xs text-green-800 dark:text-green-300 mb-2">
                You're all set! Enjoy instant booking, access to premium vehicles, and priority support.
              </p>
              {profile.documentVerifiedAt && (
                <p className="text-[10px] text-green-700 dark:text-green-400">
                  Verified on {new Date(profile.documentVerifiedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : requiredDocsUploaded && !profile.documentsVerified ? (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2.5">
            <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Documents Under Review
              </h3>
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                All required documents received! Our team is reviewing them and you'll be notified within 24 hours.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2.5">
            <IoSparklesOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                Unlock Full Benefits with Verification
              </h3>
              <p className="text-xs text-green-800 dark:text-green-300 mb-2">
                Upload the 2 required documents to unlock instant booking and access to premium vehicles.
              </p>
              <ul className="text-[10px] text-green-700 dark:text-green-400 space-y-0.5">
                <li>✓ Rent luxury cars without additional checks</li>
                <li>✓ Complete bookings in seconds</li>
                <li>✓ No repeated document uploads</li>
                <li>✓ Priority customer support</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Summary Card (Optional - Read Only) */}
      {!insuranceLoading && hasInsurance && (
        <div className={`mb-4 border rounded-lg p-3 ${
          insurance.verified && insurance.status === 'ACTIVE'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : insurance.status === 'EXPIRED'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2">
              <IoShieldCheckmarkOutline className={`w-4 h-4 mt-0.5 ${
                insurance.verified && insurance.status === 'ACTIVE'
                  ? 'text-green-600 dark:text-green-400'
                  : insurance.status === 'EXPIRED'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                  Personal Insurance <span className="text-[10px] text-gray-500">(Optional)</span>
                </h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  {insurance.provider} • {insurance.policyNumber}
                </p>
                {insurance.verified && insurance.status === 'ACTIVE' && (
                  <p className="text-[10px] text-green-700 dark:text-green-400 mt-1">
                    ✓ Verified - 50% deposit reduction active
                  </p>
                )}
              </div>
            </div>
            {insurance.verified ? (
              <IoCheckmarkCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <IoTimeOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            )}
          </div>

          {/* Insurance Card Thumbnails */}
          {(insurance.cardFrontUrl || insurance.cardBackUrl) && (
            <div className="flex gap-2 mb-2">
              {insurance.cardFrontUrl && (
                <div className="relative w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img src={insurance.cardFrontUrl} alt="Card Front" className="w-full h-full object-cover" />
                  <p className="absolute bottom-0 left-0 right-0 text-center text-[8px] text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90">
                    Front
                  </p>
                </div>
              )}
              {insurance.cardBackUrl && (
                <div className="relative w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img src={insurance.cardBackUrl} alt="Card Back" className="w-full h-full object-cover" />
                  <p className="absolute bottom-0 left-0 right-0 text-center text-[8px] text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90">
                    Back
                  </p>
                </div>
              )}
            </div>
          )}

          {/* View/Manage Button */}
          {onSwitchTab && (
            <button
              onClick={() => onSwitchTab('insurance')}
              className="w-full px-2 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-[10px] rounded transition-colors flex items-center justify-center gap-1"
            >
              <span>Manage Insurance</span>
              <IoArrowForwardOutline className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Required Documents Notice */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md">
        <div className="flex items-start gap-2.5">
          <IoInformationCircleOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
              Required Documents (2 Required + 1 Optional)
            </h4>
            <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
              <li>1. <strong>Driver's License:</strong> Valid license (government-issued ID) <span className="text-red-500">*</span></li>
              <li>2. <strong>Selfie Verification:</strong> Hold your driver's license next to your face <span className="text-red-500">*</span></li>
              <li>3. <strong>Additional Verification:</strong> Passport, National ID, School ID, Utility Bill, Bank Statement (optional but speeds up review)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Staged Files Preview */}
      {stagedFiles.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg shadow-md">
          <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Ready to Upload ({stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''})
          </h4>
          <div className="space-y-2">
            {stagedFiles.map(staged => (
              <div key={staged.type} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                <img src={staged.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {staged.type === 'driversLicense' && "Driver's License"}
                    {staged.type === 'selfie' && 'Selfie Verification'}
                    {staged.type === 'additionalDocument' && 'Additional Document'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {staged.file.name}
                  </p>
                </div>
                <button
                  onClick={() => removeStagedFile(staged.type)}
                  className="p-1 text-red-500 hover:text-red-600"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <IoCloudUploadOutline className="w-4 h-4" />
                <span>Submit All Documents</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Document Upload Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Driver's License */}
        <div className={`border ${licenseStatus.border} ${licenseStatus.bg} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <IoCardOutline className={`w-4 h-4 ${licenseStatus.color}`} />
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                License <span className="text-red-500">*</span>
              </h3>
            </div>
            <licenseStatus.icon className={`w-4 h-4 ${licenseStatus.color}`} />
          </div>

          <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
            {profile.driversLicenseUrl ? (
              <Image
                src={profile.driversLicenseUrl}
                alt="Driver's License"
                fill
                className="object-cover"
              />
            ) : getStagedFile('driversLicense') ? (
              <img
                src={getStagedFile('driversLicense')!.preview}
                alt="License Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <IoImageOutline className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                  Valid driver's license
                </p>
              </div>
            )}
            {getStagedFile('driversLicense') && (
              <button
                onClick={() => removeStagedFile('driversLicense')}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <IoCloseCircle className="w-3 h-3" />
              </button>
            )}
          </div>

          {profile.driversLicenseUrl && !profile.documentsVerified ? (
            <button
              onClick={() => handleDeleteDocument('driversLicense')}
              disabled={deleting === 'driversLicense'}
              className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {deleting === 'driversLicense' ? 'Removing...' : 'Remove'}
            </button>
          ) : !profile.driversLicenseUrl && (
            <>
              <button
                onClick={() => licenseInputRef.current?.click()}
                className="w-full px-2 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-[10px] rounded transition-colors"
              >
                Select Photo
              </button>
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'driversLicense')}
              />
            </>
          )}
        </div>

        {/* Selfie Verification */}
        <div className={`border ${selfieStatus.border} ${selfieStatus.bg} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <IoCameraOutline className={`w-4 h-4 ${selfieStatus.color}`} />
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                Selfie <span className="text-red-500">*</span>
              </h3>
            </div>
            <selfieStatus.icon className={`w-4 h-4 ${selfieStatus.color}`} />
          </div>

          <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
            {profile.selfieUrl ? (
              <Image
                src={profile.selfieUrl}
                alt="Selfie Verification"
                fill
                className="object-cover"
              />
            ) : getStagedFile('selfie') ? (
              <img
                src={getStagedFile('selfie')!.preview}
                alt="Selfie Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <IoImageOutline className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                  Hold license next to face
                </p>
              </div>
            )}
            {getStagedFile('selfie') && (
              <button
                onClick={() => removeStagedFile('selfie')}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <IoCloseCircle className="w-3 h-3" />
              </button>
            )}
          </div>

          {profile.selfieUrl && !profile.documentsVerified ? (
            <button
              onClick={() => handleDeleteDocument('selfie')}
              disabled={deleting === 'selfie'}
              className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {deleting === 'selfie' ? 'Removing...' : 'Remove'}
            </button>
          ) : !profile.selfieUrl && (
            <>
              <button
                onClick={() => selfieInputRef.current?.click()}
                className="w-full px-2 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-[10px] rounded transition-colors"
              >
                Select Photo
              </button>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'selfie')}
              />
            </>
          )}
        </div>

        {/* Additional Document (Optional) */}
        {!profile.documentsVerified && (
          <div className={`border ${additionalStatus.border} ${additionalStatus.bg} rounded-lg p-3 col-span-2 sm:col-span-1`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <IoDocumentTextOutline className={`w-4 h-4 ${additionalStatus.color}`} />
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                  Extra ID <span className="text-[10px] text-gray-500">(Optional)</span>
                </h3>
              </div>
              <additionalStatus.icon className={`w-4 h-4 ${additionalStatus.color}`} />
            </div>

            <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
              {profile.additionalDocumentUrl ? (
                <Image
                  src={profile.additionalDocumentUrl}
                  alt="Additional Document"
                  fill
                  className="object-cover"
                />
              ) : getStagedFile('additionalDocument') ? (
                <img
                  src={getStagedFile('additionalDocument')!.preview}
                  alt="Additional Document Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <IoImageOutline className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                    Passport, ID, School, Bill
                  </p>
                </div>
              )}
              {getStagedFile('additionalDocument') && (
                <button
                  onClick={() => removeStagedFile('additionalDocument')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <IoCloseCircle className="w-3 h-3" />
                </button>
              )}
            </div>

            {!profile.additionalDocumentUrl && !getStagedFile('additionalDocument') && (
              <select
                value={selectedAdditionalType}
                onChange={(e) => setSelectedAdditionalType(e.target.value)}
                className="w-full px-2 py-1 mb-2 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID Card</option>
                <option value="school_id">School ID</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="employment_letter">Employment Letter</option>
                <option value="lease_agreement">Lease Agreement</option>
              </select>
            )}

            {profile.additionalDocumentUrl ? (
              <button
                onClick={() => handleDeleteDocument('additionalDocument')}
                disabled={deleting === 'additionalDocument'}
                className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {deleting === 'additionalDocument' ? 'Removing...' : 'Remove'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => additionalInputRef.current?.click()}
                  className="w-full px-2 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-[10px] rounded transition-colors"
                >
                  Select Photo
                </button>
                <input
                  ref={additionalInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'additionalDocument')}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md">
        <div className="flex items-start gap-2.5">
          <IoInformationCircleOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
              Photo Guidelines
            </h4>
            <ul className="space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400">
              <li>• All text must be clearly readable</li>
              <li>• Use bright lighting, avoid glare or shadows</li>
              <li>• Capture the entire document in frame</li>
              <li>• For selfie: Hold driver's license beside face, both clearly visible</li>
              <li>• Review typically completed within 2-4 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}