// app/(guest)/rentals/components/booking/DriverVerification.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { 
 IoCardOutline,
 IoCameraOutline,
 IoDocumentTextOutline,
 IoCalendarOutline,
 IoCheckmarkCircleOutline,
 IoCloseCircleOutline,
 IoInformationCircleOutline,
 IoShieldCheckmarkOutline,
 IoArrowBackOutline,
 IoArrowForwardOutline,
 IoPersonOutline
} from 'react-icons/io5'

interface VerificationData {
 licenseNumber: string
 licenseState: string
 licenseExpiry: string
 licensePhotoUrl: string
 insurancePhotoUrl: string
 selfiePhotoUrl: string
 age: string
 dateOfBirth: string
 agreedToTerms: boolean
}

interface DriverVerificationProps {
 onComplete: (data: VerificationData) => void
 onBack: () => void
 initialData?: VerificationData
 carSource?: string // To know if P2P or Amadeus
}

const US_STATES = [
 { code: 'AL', name: 'Alabama' },
 { code: 'AK', name: 'Alaska' },
 { code: 'AZ', name: 'Arizona' },
 { code: 'AR', name: 'Arkansas' },
 { code: 'CA', name: 'California' },
 { code: 'CO', name: 'Colorado' },
 { code: 'CT', name: 'Connecticut' },
 { code: 'DE', name: 'Delaware' },
 { code: 'FL', name: 'Florida' },
 { code: 'GA', name: 'Georgia' },
 { code: 'HI', name: 'Hawaii' },
 { code: 'ID', name: 'Idaho' },
 { code: 'IL', name: 'Illinois' },
 { code: 'IN', name: 'Indiana' },
 { code: 'IA', name: 'Iowa' },
 { code: 'KS', name: 'Kansas' },
 { code: 'KY', name: 'Kentucky' },
 { code: 'LA', name: 'Louisiana' },
 { code: 'ME', name: 'Maine' },
 { code: 'MD', name: 'Maryland' },
 { code: 'MA', name: 'Massachusetts' },
 { code: 'MI', name: 'Michigan' },
 { code: 'MN', name: 'Minnesota' },
 { code: 'MS', name: 'Mississippi' },
 { code: 'MO', name: 'Missouri' },
 { code: 'MT', name: 'Montana' },
 { code: 'NE', name: 'Nebraska' },
 { code: 'NV', name: 'Nevada' },
 { code: 'NH', name: 'New Hampshire' },
 { code: 'NJ', name: 'New Jersey' },
 { code: 'NM', name: 'New Mexico' },
 { code: 'NY', name: 'New York' },
 { code: 'NC', name: 'North Carolina' },
 { code: 'ND', name: 'North Dakota' },
 { code: 'OH', name: 'Ohio' },
 { code: 'OK', name: 'Oklahoma' },
 { code: 'OR', name: 'Oregon' },
 { code: 'PA', name: 'Pennsylvania' },
 { code: 'RI', name: 'Rhode Island' },
 { code: 'SC', name: 'South Carolina' },
 { code: 'SD', name: 'South Dakota' },
 { code: 'TN', name: 'Tennessee' },
 { code: 'TX', name: 'Texas' },
 { code: 'UT', name: 'Utah' },
 { code: 'VT', name: 'Vermont' },
 { code: 'VA', name: 'Virginia' },
 { code: 'WA', name: 'Washington' },
 { code: 'WV', name: 'West Virginia' },
 { code: 'WI', name: 'Wisconsin' },
 { code: 'WY', name: 'Wyoming' }
]

export default function DriverVerification({ 
 onComplete, 
 onBack, 
 initialData,
 carSource = 'p2p'
}: DriverVerificationProps) {
 const [isUploading, setIsUploading] = useState(false)
 const [errors, setErrors] = useState<Record<string, string>>({})
 const licenseInputRef = useRef<HTMLInputElement>(null)
 const insuranceInputRef = useRef<HTMLInputElement>(null)
 const selfieInputRef = useRef<HTMLInputElement>(null)
 
 const isP2P = carSource === 'p2p'
 
 const [data, setData] = useState<VerificationData>({
   licenseNumber: initialData?.licenseNumber || '',
   licenseState: initialData?.licenseState || '',
   licenseExpiry: initialData?.licenseExpiry || '',
   licensePhotoUrl: initialData?.licensePhotoUrl || '',
   insurancePhotoUrl: initialData?.insurancePhotoUrl || '',
   selfiePhotoUrl: initialData?.selfiePhotoUrl || '',
   age: initialData?.age || '',
   dateOfBirth: initialData?.dateOfBirth || '',
   agreedToTerms: initialData?.agreedToTerms || false
 })

 const [uploadProgress, setUploadProgress] = useState({
   license: 0,
   insurance: 0,
   selfie: 0
 })

 const handleFileUpload = async (file: File, type: 'license' | 'insurance' | 'selfie') => {
   if (!file) return

   if (file.size > 5 * 1024 * 1024) {
     setErrors({ ...errors, [type]: 'File size must be less than 5MB' })
     return
   }

   if (!file.type.startsWith('image/')) {
     setErrors({ ...errors, [type]: 'Please upload an image file' })
     return
   }

   setIsUploading(true)
   setUploadProgress({ ...uploadProgress, [type]: 0 })

   try {
     const formData = new FormData()
     formData.append('file', file)
     formData.append('type', type)

     const progressInterval = setInterval(() => {
       setUploadProgress(prev => ({
         ...prev,
         [type]: Math.min(prev[type] + 10, 90)
       }))
     }, 100)

     const response = await fetch('/api/rentals/upload', {
       method: 'POST',
       body: formData
     })

     clearInterval(progressInterval)
     setUploadProgress({ ...uploadProgress, [type]: 100 })

     if (!response.ok) throw new Error('Upload failed')

     const { url } = await response.json()
     
     const fieldMap = {
       license: 'licensePhotoUrl',
       insurance: 'insurancePhotoUrl',
       selfie: 'selfiePhotoUrl'
     }
     
     // Use functional update to ensure latest state
     setData(prevData => ({
       ...prevData,
       [fieldMap[type]]: url
     }))

     const newErrors = { ...errors }
     delete newErrors[type]
     setErrors(newErrors)

   } catch (error) {
     console.error('Upload error:', error)
     setErrors({ ...errors, [type]: 'Upload failed. Please try again.' })
   } finally {
     setIsUploading(false)
     setUploadProgress({ ...uploadProgress, [type]: 0 })
   }
 }

 const validateForm = (): boolean => {
   const newErrors: Record<string, string> = {}

   if (!data.licenseNumber) {
     newErrors.licenseNumber = 'License number is required'
   }

   if (!data.licenseState) {
     newErrors.licenseState = 'License state is required'
   }

   if (!data.licenseExpiry) {
     newErrors.licenseExpiry = 'License expiry date is required'
   } else {
     const expiryDate = new Date(data.licenseExpiry)
     if (expiryDate < new Date()) {
       newErrors.licenseExpiry = 'License has expired'
     }
   }

   if (!data.licensePhotoUrl) {
     newErrors.license = 'Please upload your driver\'s license'
   }

   if (!data.insurancePhotoUrl) {
     newErrors.insurance = 'Please upload proof of insurance'
   }

   // Selfie optional for testing
   // if (!data.selfiePhotoUrl) {
   //   newErrors.selfie = 'Please upload a selfie for verification'
   // }

   if (!data.dateOfBirth) {
     newErrors.dateOfBirth = 'Date of birth is required'
   }

   if (!data.agreedToTerms) {
     newErrors.terms = 'You must agree to the terms and conditions'
   }

   setErrors(newErrors)
   return Object.keys(newErrors).length === 0
 }

 const handleSubmit = () => {
   if (validateForm()) {
     const today = new Date()
     const birthDate = new Date(data.dateOfBirth)
     let age = today.getFullYear() - birthDate.getFullYear()
     const monthDiff = today.getMonth() - birthDate.getMonth()
     
     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
       age--
     }
     
     let ageRange = '30+'
     if (age < 21) ageRange = '18-20'
     else if (age < 25) ageRange = '21-24'
     else if (age < 30) ageRange = '25-29'
     
     onComplete({ ...data, age: ageRange })
   }
 }

 const removePhoto = (type: 'license' | 'insurance' | 'selfie') => {
   const fieldMap = {
     license: 'licensePhotoUrl',
     insurance: 'insurancePhotoUrl',
     selfie: 'selfiePhotoUrl'
   }
   
   // Use functional update to ensure latest state
   setData(prevData => ({
     ...prevData,
     [fieldMap[type]]: ''
   }))
 }

 return (
   <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
     <div className="flex items-center mb-6">
       <IoShieldCheckmarkOutline className="w-8 h-8 text-amber-600 mr-3" />
       <div>
         <h2 className="text-xl font-semibold">Driver Verification</h2>
         <p className="text-sm text-gray-500 dark:text-gray-400">
           {isP2P ? 'Required documents for P2P rental verification' : 'Driver information'}
         </p>
       </div>
     </div>

     {/* P2P Security Notice */}
     {isP2P && (
       <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
         <div className="flex items-start">
           <IoInformationCircleOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
           <div className="text-sm">
             <div className="font-medium text-amber-800 dark:text-amber-300 mb-1">
               Manual Review Process for P2P Rentals
             </div>
             <div className="text-amber-700 dark:text-amber-400 space-y-1">
               <p>• Documents will be reviewed by our team within 2-4 hours</p>
               <p>• Payment will only be processed after approval</p>
               <p>• Host will be notified once your booking is confirmed</p>
               <p>• You'll receive an email with the review outcome</p>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Your Information is Secure notice */}
     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
       <div className="flex items-start">
         <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
         <div className="text-sm text-blue-800 dark:text-blue-300">
           <div className="font-medium mb-1">Your information is secure</div>
           <div className="text-blue-700 dark:text-blue-400">
             All documents are encrypted and stored securely. We use this information solely for 
             verification purposes and comply with all privacy regulations.
           </div>
         </div>
       </div>
     </div>

     {/* License Information */}
     <div className="space-y-4 mb-6">
       <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Driver's License Number <span className="text-red-500">*</span>
         </label>
         <input
           type="text"
           value={data.licenseNumber}
           onChange={(e) => setData(prevData => ({ ...prevData, licenseNumber: e.target.value.toUpperCase() }))}
           className={`
             w-full px-4 py-2 border rounded-lg dark:bg-gray-700
             ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
           `}
           placeholder="Enter license number"
         />
         {errors.licenseNumber && (
           <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
         )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             Issuing State <span className="text-red-500">*</span>
           </label>
           <select
             value={data.licenseState}
             onChange={(e) => setData(prevData => ({ ...prevData, licenseState: e.target.value }))}
             className={`
               w-full px-4 py-2 border rounded-lg dark:bg-gray-700
               ${errors.licenseState ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
             `}
           >
             <option value="">Select state</option>
             {US_STATES.map((state) => (
               <option key={state.code} value={state.code}>
                 {state.name}
               </option>
             ))}
           </select>
           {errors.licenseState && (
             <p className="mt-1 text-sm text-red-600">{errors.licenseState}</p>
           )}
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             Expiry Date <span className="text-red-500">*</span>
           </label>
           <input
             type="date"
             value={data.licenseExpiry}
             onChange={(e) => setData(prevData => ({ ...prevData, licenseExpiry: e.target.value }))}
             min={new Date().toISOString().split('T')[0]}
             className={`
               w-full px-4 py-2 border rounded-lg dark:bg-gray-700
               ${errors.licenseExpiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
             `}
           />
           {errors.licenseExpiry && (
             <p className="mt-1 text-sm text-red-600">{errors.licenseExpiry}</p>
           )}
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             Date of Birth <span className="text-red-500">*</span>
           </label>
           <input
             type="date"
             value={data.dateOfBirth}
             onChange={(e) => setData(prevData => ({ ...prevData, dateOfBirth: e.target.value }))}
             max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
             className={`
               w-full px-4 py-2 border rounded-lg dark:bg-gray-700
               ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
             `}
           />
           {errors.dateOfBirth && (
             <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
           )}
         </div>
       </div>
     </div>

     {/* Document Uploads */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
       {/* License Upload */}
       <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Driver's License Photo <span className="text-red-500">*</span>
         </label>
         <div
           onClick={() => !data.licensePhotoUrl && licenseInputRef.current?.click()}
           className={`
             relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
             hover:border-amber-400 transition-colors h-40
             ${errors.license ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
             ${data.licensePhotoUrl ? 'border-solid' : ''}
           `}
         >
           <input
             ref={licenseInputRef}
             type="file"
             accept="image/*"
             onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'license')}
             className="hidden"
           />

           {data.licensePhotoUrl ? (
             <div className="relative h-full">
               <img
                 src={data.licensePhotoUrl}
                 alt="License"
                 className="w-full h-full object-cover rounded"
               />
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   removePhoto('license')
                 }}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
               >
                 <IoCloseCircleOutline className="w-5 h-5" />
               </button>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full">
               <IoCardOutline className="w-8 h-8 text-gray-400 mb-2" />
               <p className="text-xs text-gray-600 dark:text-gray-400">
                 Upload License
               </p>
             </div>
           )}

           {uploadProgress.license > 0 && uploadProgress.license < 100 && (
             <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-b-lg">
               <div
                 className="h-full bg-amber-600 rounded-b-lg transition-all"
                 style={{ width: `${uploadProgress.license}%` }}
               />
             </div>
           )}
         </div>
         {errors.license && (
           <p className="mt-1 text-sm text-red-600">{errors.license}</p>
         )}
       </div>

       {/* Insurance Upload */}
       <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Insurance Document <span className="text-red-500">*</span>
         </label>
         <div
           onClick={() => !data.insurancePhotoUrl && insuranceInputRef.current?.click()}
           className={`
             relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
             hover:border-amber-400 transition-colors h-40
             ${errors.insurance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
             ${data.insurancePhotoUrl ? 'border-solid' : ''}
           `}
         >
           <input
             ref={insuranceInputRef}
             type="file"
             accept="image/*"
             onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'insurance')}
             className="hidden"
           />

           {data.insurancePhotoUrl ? (
             <div className="relative h-full">
               <img
                 src={data.insurancePhotoUrl}
                 alt="Insurance"
                 className="w-full h-full object-cover rounded"
               />
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   removePhoto('insurance')
                 }}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
               >
                 <IoCloseCircleOutline className="w-5 h-5" />
               </button>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full">
               <IoDocumentTextOutline className="w-8 h-8 text-gray-400 mb-2" />
               <p className="text-xs text-gray-600 dark:text-gray-400">
                 Upload Insurance
               </p>
             </div>
           )}

           {uploadProgress.insurance > 0 && uploadProgress.insurance < 100 && (
             <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-b-lg">
               <div
                 className="h-full bg-amber-600 rounded-b-lg transition-all"
                 style={{ width: `${uploadProgress.insurance}%` }}
               />
             </div>
           )}
         </div>
         {errors.insurance && (
           <p className="mt-1 text-sm text-red-600">{errors.insurance}</p>
         )}
       </div>

       {/* Selfie Upload (Simplified for testing) */}
       <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Selfie <span className="text-gray-400 text-xs">(Optional for testing)</span>
         </label>
         <div
           onClick={() => !data.selfiePhotoUrl && selfieInputRef.current?.click()}
           className={`
             relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
             hover:border-amber-400 transition-colors h-40
             ${data.selfiePhotoUrl ? 'border-solid border-gray-300' : 'border-gray-300 dark:border-gray-600'}
           `}
         >
           <input
             ref={selfieInputRef}
             type="file"
             accept="image/*"
             onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
             className="hidden"
           />

           {data.selfiePhotoUrl ? (
             <div className="relative h-full">
               <img
                 src={data.selfiePhotoUrl}
                 alt="Selfie"
                 className="w-full h-full object-cover rounded"
               />
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   removePhoto('selfie')
                 }}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
               >
                 <IoCloseCircleOutline className="w-5 h-5" />
               </button>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full">
               <IoPersonOutline className="w-8 h-8 text-gray-400 mb-2" />
               <p className="text-xs text-gray-600 dark:text-gray-400">
                 Upload Selfie
               </p>
               <p className="text-xs text-gray-500 mt-1">
                 (Optional)
               </p>
             </div>
           )}

           {uploadProgress.selfie > 0 && uploadProgress.selfie < 100 && (
             <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-b-lg">
               <div
                 className="h-full bg-amber-600 rounded-b-lg transition-all"
                 style={{ width: `${uploadProgress.selfie}%` }}
               />
             </div>
           )}
         </div>
       </div>
     </div>

     {/* Terms Agreement */}
     <div className="mb-6">
       <label className="flex items-start cursor-pointer">
         <input
           type="checkbox"
           checked={data.agreedToTerms}
           onChange={(e) => setData(prevData => ({ ...prevData, agreedToTerms: e.target.checked }))}
           className="mt-1 mr-3"
         />
         <div className="text-sm">
           <span className="text-gray-700 dark:text-gray-300">
             I agree to the{' '}
             <a href="/terms" target="_blank" className="text-amber-600 hover:underline">
               Terms and Conditions
             </a>
             {' '}and confirm that I have valid driver's license and insurance.
             {isP2P && ' I understand my booking will be reviewed before confirmation.'}
           </span>
         </div>
       </label>
       {errors.terms && (
         <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
       )}
     </div>

     {/* Verification Status */}
     {data.licensePhotoUrl && data.insurancePhotoUrl && (
       <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
         <div className="flex items-center">
           <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
           <span className="text-sm text-green-800 dark:text-green-300 font-medium">
             {isP2P 
               ? 'Documents ready for manual review (2-4 hour processing)'
               : 'Documents uploaded successfully'}
           </span>
         </div>
       </div>
     )}

     {/* Action Buttons */}
     <div className="flex justify-between">
       <button
         onClick={onBack}
         className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
       >
         <IoArrowBackOutline className="w-5 h-5 mr-2" />
         Back
       </button>

       <button
         onClick={handleSubmit}
         disabled={isUploading}
         className={`
           flex items-center px-6 py-3 rounded-lg font-medium
           ${
             isUploading
               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
               : 'bg-amber-600 text-white hover:bg-amber-700'
           }
         `}
       >
         Continue to Payment
         <IoArrowForwardOutline className="w-5 h-5 ml-2" />
       </button>
     </div>
   </div>
 )
}