// app/blog/page.tsx
// Blog listing page with category filters

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { blogPosts, categories, type BlogPost } from '@/content/posts'
import { 
  IoNewspaperOutline,
  IoTimeOutline,
  IoArrowForwardOutline,
  IoCalendarOutline,
  IoFilterOutline,
  IoCarSportOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoLeafOutline,
  IoLocationOutline,
  IoSearchOutline
} from 'react-icons/io5'

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Comparison: { 
    icon: <IoCarSportOutline className="w-4 h-4" />, 
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  Hosts: { 
    icon: <IoPersonOutline className="w-4 h-4" />, 
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  Insurance: { 
    icon: <IoShieldCheckmarkOutline className="w-4 h-4" />, 
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30'
  },
  ESG: { 
    icon: <IoLeafOutline className="w-4 h-4" />, 
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  Local: { 
    icon: <IoLocationOutline className="w-4 h-4" />, 
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30'
  }
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function BlogPage() {
  const t = useTranslations('Blog')
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/rentals')
  }

  // Filter posts by category and search
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get featured post (first post or first matching filter)
  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Bar */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoNewspaperOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
            </div>
            <Link 
              href="/list-your-car"
              className="hidden md:flex items-center px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              {t('listYourCar')}
              <IoArrowForwardOutline className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-[106px] md:mt-[112px]">

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                {t('heroDescription')}
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-[106px] md:top-[112px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              <IoFilterOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
              
              {/* All Button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t('allPosts')}
              </button>
              
              {/* Category Buttons */}
              {categories.map((category) => {
                const config = categoryConfig[category]
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : `${config.bg} ${config.color} hover:opacity-80`
                    }`}
                  >
                    {config.icon}
                    <span>{category}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <IoNewspaperOutline className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('noArticlesFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('tryAdjustingSearch')}
                </p>
                <button
                  onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {t('clearFilters')}
                </button>
              </div>
            )}

            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-8">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <article className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 sm:p-8 text-white hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                        {t('featured')}
                      </span>
                      <span className={`px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium flex items-center space-x-1`}>
                        {categoryConfig[featuredPost.category]?.icon}
                        <span>{featuredPost.category}</span>
                      </span>
                      <span className="text-xs opacity-90 flex items-center">
                        <IoCalendarOutline className="w-3 h-3 mr-1" />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-purple-100 mb-6 max-w-3xl line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <IoPersonOutline className="w-4 h-4 mr-1" />
                          {featuredPost.author.name}
                        </span>
                        <span className="flex items-center">
                          <IoTimeOutline className="w-4 h-4 mr-1" />
                          {t('minRead', { time: featuredPost.readTime })}
                        </span>
                      </div>
                      <span className="flex items-center text-sm font-medium">
                        {t('readArticle')}
                        <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </article>
                </Link>
              </div>
            )}

            {/* Post Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post) => {
                  const config = categoryConfig[post.category]
                  return (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                      <article className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
                        {/* Category Banner */}
                        <div className={`px-4 py-2 ${config.bg} flex items-center justify-between`}>
                          <span className={`flex items-center space-x-1 text-xs font-medium ${config.color}`}>
                            {config.icon}
                            <span>{post.category}</span>
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <span className="flex items-center">
                              <IoPersonOutline className="w-3 h-3 mr-1" />
                              {post.author.name}
                            </span>
                            <span className="flex items-center">
                              <IoTimeOutline className="w-3 h-3 mr-1" />
                              {t('minShort', { time: post.readTime })}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition shadow-lg"
              >
                {t('listYourCar')}
              </Link>
              <Link
                href="/rentals"
                className="w-full sm:w-auto px-8 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
              >
                {t('findACar')}
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}