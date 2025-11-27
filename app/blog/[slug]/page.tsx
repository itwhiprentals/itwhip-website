// app/blog/[slug]/page.tsx
// Individual blog post page with Article schema

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug, getRecentPosts, type BlogPost } from '@/content/posts'
import { 
  IoArrowBackOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoShareSocialOutline,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoFacebook,
  IoArrowForwardOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoLeafOutline,
  IoLocationOutline
} from 'react-icons/io5'

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for each post
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | ItWhip Blog'
    }
  }

  return {
    title: `${post.title} | ItWhip Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://itwhip.com/blog/${post.slug}`,
      siteName: 'ItWhip',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: `https://itwhip.com/og/blog/${post.slug}.png`,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`https://itwhip.com/og/blog/${post.slug}.png`]
    },
    alternates: {
      canonical: `https://itwhip.com/blog/${post.slug}`
    }
  }
}

// Category config for styling
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

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get related posts (same category, excluding current)
function getRelatedPosts(currentPost: BlogPost, count: number = 3): BlogPost[] {
  return blogPosts
    .filter(post => post.slug !== currentPost.slug)
    .filter(post => post.category === currentPost.category)
    .slice(0, count)
}

export default function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = getPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post)
  const recentPosts = getRecentPosts(3).filter(p => p.slug !== post.slug)
  const config = categoryConfig[post.category]

  // Article Schema for this specific post
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://itwhip.com/blog/${post.slug}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://itwhip.com/blog/${post.slug}`
    },
    headline: post.title,
    description: post.excerpt,
    image: `https://itwhip.com/og/blog/${post.slug}.png`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
      url: 'https://itwhip.com/about'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ItWhip',
      logo: {
        '@type': 'ImageObject',
        url: 'https://itwhip.com/logo.png'
      }
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${post.readTime}M`,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/'
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://itwhip.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://itwhip.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://itwhip.com/blog/${post.slug}`
      }
    ]
  }

  // Share URLs
  const shareUrl = `https://itwhip.com/blog/${post.slug}`
  const shareText = encodeURIComponent(post.title)
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/blog"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                <IoArrowBackOutline className="w-5 h-5 mr-2" />
                <span className="font-medium">Back to Blog</span>
              </Link>
              
              <Link href="/" className="text-xl font-bold text-purple-600">
                ItWhip
              </Link>
              
              <div className="flex items-center space-x-2">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-400 transition"
                  aria-label="Share on Twitter"
                >
                  <IoLogoTwitter className="w-5 h-5" />
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-600 transition"
                  aria-label="Share on LinkedIn"
                >
                  <IoLogoLinkedin className="w-5 h-5" />
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-500 transition"
                  aria-label="Share on Facebook"
                >
                  <IoLogoFacebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-purple-600 transition">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-purple-600 transition">Blog</Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white truncate max-w-[200px]">
                {post.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* Article */}
        <article className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Article Header */}
            <header className="mb-8">
              {/* Category Badge */}
              <div className="flex items-center space-x-3 mb-4">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                  {config.icon}
                  <span>{post.category}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6">
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
                <span className="flex items-center">
                  <IoPersonOutline className="w-4 h-4 mr-1.5" />
                  {post.author.name}
                </span>
                <span className="flex items-center">
                  <IoCalendarOutline className="w-4 h-4 mr-1.5" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center">
                  <IoTimeOutline className="w-4 h-4 mr-1.5" />
                  {post.readTime} min read
                </span>
              </div>
            </header>

            {/* Article Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-ul:my-4 prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-ol:my-4
                prose-table:my-6 prose-table:w-full
                prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-3 prose-th:text-left
                prose-td:p-3 prose-td:border-t prose-td:border-gray-200 dark:prose-td:border-gray-700
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags/Keywords */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Related Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.keywords.slice(0, 6).map((keyword) => (
                  <span 
                    key={keyword}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-900 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <IoShareSocialOutline className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Share this article</span>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <IoLogoTwitter className="w-4 h-4" />
                    <span className="text-sm">Twitter</span>
                  </a>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <IoLogoLinkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <IoLogoFacebook className="w-4 h-4" />
                    <span className="text-sm">Facebook</span>
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="mt-10 p-6 sm:p-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                Ready to get started with ItWhip?
              </h3>
              <p className="text-purple-100 mb-6">
                Join Arizona's premier peer-to-peer car sharing platform. Hosts earn up to 90%, guests save more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/list-your-car"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition"
                >
                  List Your Car
                  <IoArrowForwardOutline className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/rentals"
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition"
                >
                  Find a Car
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {(relatedPosts.length > 0 || recentPosts.length > 0) && (
          <section className="py-12 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {relatedPosts.length > 0 ? 'Related Articles' : 'More from the Blog'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(relatedPosts.length > 0 ? relatedPosts : recentPosts).map((relatedPost) => {
                  const relatedConfig = categoryConfig[relatedPost.category]
                  return (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                      <article className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 hover:shadow-lg transition h-full flex flex-col">
                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${relatedConfig.bg} ${relatedConfig.color} w-fit mb-3`}>
                          {relatedConfig.icon}
                          <span>{relatedPost.category}</span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-1">
                          {relatedPost.title}
                        </h3>
                        
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto pt-3">
                          <IoTimeOutline className="w-3 h-3 mr-1" />
                          {relatedPost.readTime} min read
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
              
              <div className="text-center mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All Articles
                  <IoArrowForwardOutline className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="text-xl font-bold text-purple-600">
                ItWhip
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} ItWhip. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/privacy" className="hover:text-purple-600 transition">Privacy</Link>
                <Link href="/terms" className="hover:text-purple-600 transition">Terms</Link>
                <Link href="/contact" className="hover:text-purple-600 transition">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}