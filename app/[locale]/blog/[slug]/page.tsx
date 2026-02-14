// app/blog/[slug]/page.tsx
// Blog post page with all features

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug } from '@/content/posts'
import BlogPostClient from './BlogPostClient'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'

// Generate static params
export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

// Posts that have custom OG images
const postsWithOgImages = [
  'turo-vs-itwhip-arizona-2025',
  'renting-out-car-worth-it',
  'p2p-insurance-tiers',
  'esg-car-sharing',
  'phoenix-airport-alternatives'
]

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found | ItWhip Blog' }

  // Use custom OG image if exists, otherwise fall back to default
  const ogImage = postsWithOgImages.includes(post.slug)
    ? `https://itwhip.com/og/blog/${post.slug}.png`
    : 'https://itwhip.com/og-image.jpg'

  return {
    title: `${post.title} | ItWhip Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: getCanonicalUrl(`/blog/${slug}`, locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      type: 'article',
      publishedTime: post.publishedAt,
      images: [
        {
          url: ogImage,
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
      images: [ogImage]
    },
    alternates: {
      canonical: getCanonicalUrl(`/blog/${slug}`, locale),
      languages: getAlternateLanguages(`/blog/${slug}`),
    }
  }
}

// Get next and previous posts
function getAdjacentPosts(currentSlug: string) {
  const currentIndex = blogPosts.findIndex(p => p.slug === currentSlug)
  return {
    prev: currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null,
    next: currentIndex > 0 ? blogPosts[currentIndex - 1] : null
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(slug)
  
  // Use custom OG image if exists, otherwise fall back to default
  const postOgImage = postsWithOgImages.includes(post.slug)
    ? `https://itwhip.com/og/blog/${post.slug}.png`
    : 'https://itwhip.com/og-image.jpg'

  // Schema - Fixed with proper datetime format and complete fields
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `https://itwhip.com/blog/${post.slug}`,
    datePublished: `${post.publishedAt}T00:00:00-07:00`,
    dateModified: `${post.publishedAt}T00:00:00-07:00`,
    image: postOgImage,
    // Fixed: Complete author object with url
    author: {
      '@type': 'Person',
      name: post.author.name,
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
    mainEntityOfPage: {
      '@type': 'WebPage',
      url: `https://itwhip.com/blog/${post.slug}`
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    inLanguage: 'en-US'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostClient post={post} prevPost={prev} nextPost={next} />
    </>
  )
}