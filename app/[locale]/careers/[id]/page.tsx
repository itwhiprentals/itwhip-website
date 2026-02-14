// app/careers/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoArrowBackOutline,
  IoLocationOutline,
  IoBriefcaseOutline,
  IoCashOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoShareOutline,
  IoBookmarkOutline,
  IoCalendarOutline
} from 'react-icons/io5'

interface JobDetail {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string
  responsibilities: string
  salaryRange: string | null
  equity: string | null
  applicationCount: number
  views: number
  createdAt: string
  daysOpen: number
  openPositions: number
}

interface SimilarJob {
  id: string
  title: string
  department: string
  location: string
  salaryRange: string
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const t = useTranslations('CareerDetail')
  const [job, setJob] = useState<JobDetail | null>(null)
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [jobId, setJobId] = useState<string>('')

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
      fetchJobDetail()
    }
  }, [jobId])

  const fetchJobDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/careers/${jobId}`)
      const data = await response.json()
      
      if (data.success) {
        setJob(data.job)
        setSimilarJobs(data.similarJobs || [])
      } else {
        setError(data.error || t('jobNotFound'))
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
      setError(t('failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share && job) {
      navigator.share({
        title: job.title,
        text: `Check out this job at ItWhip: ${job.title}`,
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert(t('linkCopied'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loadingJobDetails')}</p>
        </div>
      </div>
    )
  }

  if (error) {
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
              {t('backToAllPositions')}
            </Link>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/careers" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600">
              <IoArrowBackOutline className="w-4 h-4 mr-1" />
              {t('allPositions')}
            </Link>
          </div>
        </div>

        {/* Job Header */}
        <div className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {job.title}
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
                  <span className="flex items-center">
                    <IoTimeOutline className="w-4 h-4 mr-1" />
                    {job.type.replace('_', ' ')}
                  </span>
                  {job.salaryRange && (
                    <span className="flex items-center text-green-600">
                      <IoCashOutline className="w-4 h-4 mr-1" />
                      {job.salaryRange}
                    </span>
                  )}
                  {job.equity && (
                    <span className="text-purple-600">
                      + {job.equity}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <IoPeopleOutline className="w-3 h-3 mr-1" />
                    {t('applicantCount', { count: job.applicationCount })}
                  </span>
                  <span className="flex items-center">
                    <IoCalendarOutline className="w-3 h-3 mr-1" />
                    {t('postedDaysAgo', { count: job.daysOpen })}
                  </span>
                  {job.openPositions > 1 && (
                    <span className="text-green-600 font-medium">
                      {t('openingsCount', { count: job.openPositions })}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex flex-col space-y-2">
                <button
                  onClick={handleShare}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <IoShareOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/careers/${job.id}/apply`}
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                {t('applyNow')}
                <IoArrowForwardOutline className="w-5 h-5 ml-2" />
              </Link>
              <button
                onClick={handleShare}
                className="sm:hidden inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <IoShareOutline className="w-5 h-5 mr-2" />
                {t('share')}
              </button>
            </div>
          </div>
        </div>

        {/* Job Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('aboutThisRole')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {job.description}
                </p>
              </section>

              {/* Requirements */}
              <section className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('whatWereLookingFor')}
                </h2>
                <div className="space-y-2">
                  {job.requirements.split('\n').map((req, idx) => (
                    <div key={idx} className="flex items-start">
                      {req.startsWith('•') && (
                        <>
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{req.substring(2)}</span>
                        </>
                      )}
                      {!req.startsWith('•') && req.trim() && (
                        <p className="text-gray-600 dark:text-gray-400 font-medium">{req}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Responsibilities */}
              <section className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('whatYoullDo')}
                </h2>
                <div className="space-y-2">
                  {job.responsibilities.split('\n').map((resp, idx) => (
                    <div key={idx} className="flex items-start">
                      {resp.startsWith('•') && (
                        <>
                          <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{resp.substring(2)}</span>
                        </>
                      )}
                      {!resp.startsWith('•') && resp.trim() && (
                        <p className="text-gray-600 dark:text-gray-400 font-medium">{resp}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply CTA */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('readyToApply')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('joinOurTeam')}
                </p>
                <Link
                  href={`/careers/${job.id}/apply`}
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
                >
                  {t('applyNow')}
                  <IoArrowForwardOutline className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Other Openings */}
              {similarJobs.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {t('otherOpenings')}
                  </h3>
                  <div className="space-y-3">
                    {similarJobs.map(sJob => (
                      <Link
                        key={sJob.id}
                        href={`/careers/${sJob.id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-800 p-3 -m-3 rounded-lg transition"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {sJob.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {sJob.department} • {sJob.location}
                        </p>
                        {sJob.salaryRange && (
                          <p className="text-xs text-green-600 mt-1">
                            {sJob.salaryRange}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}