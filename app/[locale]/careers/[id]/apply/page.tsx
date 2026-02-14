// app/careers/[id]/apply/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoArrowBackOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLogoLinkedin,
  IoLinkOutline,
  IoSendOutline,
  IoBriefcaseOutline,
  IoLocationOutline
} from 'react-icons/io5'

interface JobInfo {
  id: string
  title: string
  department: string
  location: string
  type: string
}

export default function JobApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<JobInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [jobId, setJobId] = useState<string>('')
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
    source: 'website'
  })
  
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUrl, setResumeUrl] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Handle async params
  useEffect(() => {
    if (params.id) {
      setJobId(params.id)
    }
  }, [params.id])

  useEffect(() => {
    if (jobId) {
      fetchJobInfo()
    }
  }, [jobId])

  const fetchJobInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/careers/${jobId}`)
      const data = await response.json()
      
      if (data.success) {
        setJob(data.job)
      } else {
        setError('Job not found')
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
      setError('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setResumeFile(file)
    setUploadingResume(true)

    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'itwhip_resumes')
      formData.append('folder', 'resumes')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()
      if (data.secure_url) {
        setResumeUrl(data.secure_url)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Resume upload failed:', error)
      alert('Failed to upload resume. Please try again.')
      setResumeFile(null)
    } finally {
      setUploadingResume(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields')
      return
    }

    if (!resumeUrl) {
      alert('Please upload your resume')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Create form data for submission
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      submitData.append('resumeUrl', resumeUrl)

      const response = await fetch(`/api/careers/${jobId}/apply`, {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          linkedin: '',
          portfolio: '',
          coverLetter: '',
          source: 'website'
        })
        setResumeFile(null)
        setResumeUrl('')
        
        // Redirect to success message after 3 seconds
        setTimeout(() => {
          router.push('/careers?applied=success')
        }, 3000)
      } else {
        setError(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Application submission failed:', error)
      setError('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading application form...</p>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error}</h1>
            <Link href="/careers" className="text-amber-600 hover:text-amber-700 font-medium">
              ← Back to all positions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Application Submitted!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for applying to {job?.title}. We've received your application and will review it within 48-72 hours.
            </p>
            <p className="text-sm text-gray-500">Redirecting to careers page...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!job) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      <div className="pt-14 md:pt-16">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href={`/careers/${jobId}`} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600">
              <IoArrowBackOutline className="w-4 h-4 mr-1" />
              Back to Job Details
            </Link>
          </div>
        </div>

        {/* Job Header */}
        <div className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-6 sm:py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Apply for {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <IoBriefcaseOutline className="w-4 h-4 mr-1" />
                {job.department}
              </span>
              <span className="flex items-center">
                <IoLocationOutline className="w-4 h-4 mr-1" />
                {job.location}
              </span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Professional Links
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio/GitHub
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resume *
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                {resumeFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <IoDocumentTextOutline className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(resumeFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    {!uploadingResume && (
                      <button
                        type="button"
                        onClick={() => {
                          setResumeFile(null)
                          setResumeUrl('')
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <IoCloudUploadOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-amber-600 hover:text-amber-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                        disabled={uploadingResume}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX (Max 5MB)</p>
                  </div>
                )}
                
                {uploadingResume && (
                  <div className="mt-3">
                    <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cover Letter
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Tell us why you're interested in this role and what makes you a great fit.
              </p>
              <textarea
                rows={8}
                value={formData.coverLetter}
                onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                placeholder="Share your story..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                * Required fields
              </p>
              <button
                type="submit"
                disabled={submitting || uploadingResume || !resumeUrl}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <IoSendOutline className="w-5 h-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}