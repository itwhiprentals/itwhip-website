// app/blog/[slug]/BlogPostClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale, useFormatter } from 'next-intl'
import { type BlogPost } from '@/content/posts'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoFacebook,
  IoLinkOutline,
  IoCheckmarkOutline,
  IoListOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoMailOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoLeafOutline,
  IoLocationOutline
} from 'react-icons/io5'

interface AdjacentPost {
  slug: string
  title: string
}

interface Props {
  post: BlogPost
  prevPost: AdjacentPost | null
  nextPost: AdjacentPost | null
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Comparison: { icon: <IoCarSportOutline className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  Hosts: { icon: <IoPersonOutline className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50' },
  Insurance: { icon: <IoShieldCheckmarkOutline className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50' },
  ESG: { icon: <IoLeafOutline className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Local: { icon: <IoLocationOutline className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50' }
}

// Extract headings from HTML content for TOC
function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /<h([23])[^>]*>([^<]+)<\/h[23]>/gi
  let match
  let index = 0
  while ((match = regex.exec(html)) !== null) {
    const id = `heading-${index}`
    headings.push({ id, text: match[2], level: parseInt(match[1]) })
    index++
  }
  return headings
}

// Add IDs to headings in HTML
function addHeadingIds(html: string): string {
  let index = 0
  return html.replace(/<h([23])([^>]*)>([^<]+)<\/h[23]>/gi, (match, level, attrs, text) => {
    const id = `heading-${index}`
    index++
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`
  })
}

export default function BlogPostClient({ post, prevPost, nextPost }: Props) {
  const router = useRouter()
  const t = useTranslations('BlogPost')
  const locale = useLocale()
  const format = useFormatter()
  const [readProgress, setReadProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(post.readTime)
  const [copied, setCopied] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/rentals')
  }

  // Format date using locale
  function formatDate(dateString: string): string {
    return format.dateTime(new Date(dateString), { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const config = categoryConfig[post.category]
  const headings = extractHeadings(post.content)
  const contentWithIds = addHeadingIds(post.content)
  const canonicalBase = 'https://itwhip.com'
  const localePath = locale === 'en' ? '' : `/${locale}`
  const shareUrl = `${canonicalBase}${localePath}/blog/${post.slug}`
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`

  // Reading progress & time remaining
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      const element = articleRef.current
      const rect = element.getBoundingClientRect()
      const totalHeight = element.scrollHeight - window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      const progress = Math.min(100, (scrolled / totalHeight) * 100)
      setReadProgress(progress)

      const remaining = Math.max(0, Math.ceil(post.readTime * (1 - progress / 100)))
      setTimeRemaining(remaining)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [post.readTime])

  // Copy link
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setShowToc(false)
    }
  }

  // Newsletter submit
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <>
      {/* Article Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .article-body { font-size: 1rem; line-height: 1.7; color: #374151; }
        .article-body p { margin-bottom: 1.25rem; }
        .article-body p.lead { font-size: 1.0625rem; color: #6b7280; margin-bottom: 1.75rem; }
        .article-body h2 { font-size: 1.375rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 0.875rem; line-height: 1.3; scroll-margin-top: 80px; }
        .article-body h3 { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-top: 1.75rem; margin-bottom: 0.625rem; line-height: 1.4; scroll-margin-top: 80px; }
        .article-body ul { margin: 1.5rem 0; padding-left: 0; list-style: none; }
        .article-body ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.625rem; }
        .article-body ul li::before { content: ""; position: absolute; left: 0; top: 0.625rem; width: 6px; height: 6px; background-color: #7c3aed; border-radius: 50%; }
        .article-body ol { margin: 1.5rem 0; padding-left: 1.5rem; counter-reset: item; list-style: none; }
        .article-body ol li { position: relative; padding-left: 0.5rem; margin-bottom: 0.625rem; counter-increment: item; }
        .article-body ol li::before { content: counter(item) "."; position: absolute; left: -1.5rem; color: #7c3aed; font-weight: 600; }
        .article-body li strong { color: #111827; }
        .article-body a { color: #7c3aed; text-decoration: underline; text-underline-offset: 2px; }
        .article-body a:hover { color: #6d28d9; }
        .article-body strong { font-weight: 600; color: #111827; }
        .article-body table { width: 100%; margin: 1.5rem 0; border-collapse: collapse; font-size: 1rem; }
        .article-body th, .article-body td { padding: 0.75rem 1rem; text-align: left; border: 1px solid #e5e7eb; }
        .article-body th { font-weight: 600; color: #111827; background-color: #f9fafb; }
        .article-body td { color: #4b5563; }
        .article-body blockquote { margin: 1.5rem 0; padding: 1rem 1.5rem; border-left: 3px solid #7c3aed; background-color: #f9fafb; color: #4b5563; }
        .article-body pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; font-size: 0.875rem; }
        .article-body code { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .article-body pre code { background: transparent; padding: 0; }
        .dark .article-body { color: #d1d5db; }
        .dark .article-body h2 { color: #f9fafb; }
        .dark .article-body h3 { color: #f3f4f6; }
        .dark .article-body p.lead { color: #9ca3af; }
        .dark .article-body strong, .dark .article-body li strong { color: #f9fafb; }
        .dark .article-body th { background-color: #1f2937; color: #f9fafb; border-color: #374151; }
        .dark .article-body td { color: #d1d5db; border-color: #374151; }
        .dark .article-body blockquote { background-color: #1f2937; color: #d1d5db; }
        .dark .article-body code { background: #374151; color: #e5e7eb; }
      `}} />

      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        {/* Main Site Header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            handleGetAppClick={handleGetAppClick}
            handleSearchClick={handleSearchClick}
          />
        </div>

        {/* Article Toolbar - includes progress bar */}
        <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between">
            <Link href="/blog" className="flex items-center text-gray-600 hover:text-purple-600 transition text-sm">
              <IoArrowBackOutline className="w-4 h-4 mr-1.5" />
              <span className="font-medium">{t('backToBlog')}</span>
            </Link>

            <div className="flex items-center space-x-1">
              {/* Time Remaining */}
              <span className="hidden sm:flex items-center text-xs text-gray-400 mr-2">
                <IoTimeOutline className="w-3.5 h-3.5 mr-1" />
                {timeRemaining > 0 ? t('minLeft', { time: timeRemaining }) : t('done')}
              </span>

              {/* TOC Button */}
              {headings.length > 0 && (
                <button
                  onClick={() => setShowToc(!showToc)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={t('contents')}
                >
                  <IoListOutline className="w-5 h-5" />
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={copyLink}
                className="p-2 text-gray-400 hover:text-gray-600 transition"
                aria-label={t('copyLink')}
              >
                {copied ? <IoCheckmarkOutline className="w-5 h-5 text-green-500" /> : <IoLinkOutline className="w-5 h-5" />}
              </button>

              {/* Social Share */}
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600 transition">
                <IoLogoTwitter className="w-5 h-5" />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600 transition">
                <IoLogoLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Progress Bar - at bottom of toolbar, more visible */}
          <div className="h-1 bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-purple-600 transition-all duration-150"
              style={{ width: `${readProgress}%` }}
            />
          </div>
        </div>

        {/* Table of Contents Dropdown */}
        {showToc && headings.length > 0 && (
          <div className="fixed top-[110px] md:top-[118px] right-4 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{t('contents')}</span>
              <button onClick={() => setShowToc(false)} className="text-gray-400 hover:text-gray-600">
                <IoCloseOutline className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                    heading.level === 3 ? 'pl-6 text-gray-500' : 'text-gray-700 dark:text-gray-300 font-medium'
                  }`}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Article - with margin for fixed header + toolbar (56/64 header + 48 toolbar = 104/112, +16 buffer) */}
        <article className="pt-[120px] md:pt-[128px] pb-10 sm:pb-12 flex-1" ref={articleRef}>
          <div className="max-w-[680px] mx-auto px-4 sm:px-6">

            {/* Header */}
            <header className="mb-8 mt-4">
              <div className="flex justify-center mb-5">
                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-sm font-medium ${config.bg} ${config.color}`}>
                  {config.icon}
                  <span>{t(`category${post.category}`)}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                {post.title}
              </h1>

              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                {post.excerpt}
              </p>

              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="flex items-center">
                  <IoPersonOutline className="w-3.5 h-3.5 mr-1" />
                  {post.author.name}
                </span>
                <span>·</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span>·</span>
                <span>{t('minRead', { time: post.readTime })}</span>
              </div>
            </header>

            {/* Content */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap gap-2">
                {post.keywords.slice(0, 5).map((keyword) => (
                  <span key={keyword} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <IoPersonOutline className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{post.author.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{post.author.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('authorBio')}
                </p>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 p-5 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <IoMailOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{t('newsletterTitle')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('newsletterDescription')}</p>

                  {subscribed ? (
                    <p className="text-sm text-green-600 font-medium flex items-center">
                      <IoCheckmarkOutline className="w-4 h-4 mr-1" /> {t('subscribed')}
                    </p>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition">
                        {t('subscribe')}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('share')}</span>
              <div className="flex space-x-2">
                <button onClick={copyLink} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center">
                  {copied ? <IoCheckmarkOutline className="w-4 h-4 mr-1" /> : <IoLinkOutline className="w-4 h-4 mr-1" />}
                  {copied ? t('copied') : t('copy')}
                </button>
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Twitter</a>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">LinkedIn</a>
              </div>
            </div>

            {/* Next/Previous Navigation */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {prevPost ? (
                <Link href={`/blog/${prevPost.slug}`} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
                  <span className="text-xs text-gray-500 flex items-center mb-1">
                    <IoChevronBackOutline className="w-3 h-3 mr-1" /> {t('previous')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 transition">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}

              {nextPost ? (
                <Link href={`/blog/${nextPost.slug}`} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group text-right">
                  <span className="text-xs text-gray-500 flex items-center justify-end mb-1">
                    {t('next')} <IoChevronForwardOutline className="w-3 h-3 ml-1" />
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 transition">
                    {nextPost.title}
                  </span>
                </Link>
              ) : <div />}
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-purple-600 rounded-lg text-white text-center">
              <h3 className="text-lg font-bold mb-2">{t('ctaTitle')}</h3>
              <p className="text-purple-100 text-sm mb-4">{t('ctaDescription')}</p>
              <div className="flex justify-center gap-3">
                <Link href="/list-your-car" className="px-5 py-2.5 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                  {t('listYourCar')}
                </Link>
                <Link href="/rentals" className="px-5 py-2.5 bg-purple-700 text-white rounded-lg text-sm font-semibold hover:bg-purple-800 transition">
                  {t('findACar')}
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Main Site Footer */}
        <Footer />
      </div>
    </>
  )
}
