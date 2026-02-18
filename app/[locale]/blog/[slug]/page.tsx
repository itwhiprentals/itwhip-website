// app/blog/[slug]/page.tsx
// Blog post page with locale-aware content and SEO

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/content/posts'
import { getLocalizedPostBySlug } from '@/app/lib/blog'
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
  const post = getLocalizedPostBySlug(slug, locale)
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

// Get next and previous posts (localized)
function getAdjacentPosts(currentSlug: string, locale: string) {
  const currentIndex = blogPosts.findIndex(p => p.slug === currentSlug)
  const prev = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null
  const next = currentIndex > 0 ? blogPosts[currentIndex - 1] : null
  // Only pass title/slug for adjacent posts (they're displayed in nav)
  return {
    prev: prev ? { slug: prev.slug, title: prev.title } : null,
    next: next ? { slug: next.slug, title: next.title } : null
  }
}

// Locale to inLanguage mapping
function getInLanguage(locale: string): string {
  const map: Record<string, string> = { en: 'en-US', es: 'es-419', fr: 'fr-FR' }
  return map[locale] || 'en-US'
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const post = getLocalizedPostBySlug(slug, locale)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(slug, locale)

  // Use custom OG image if exists, otherwise fall back to default
  const postOgImage = postsWithOgImages.includes(post.slug)
    ? `https://itwhip.com/og/blog/${post.slug}.png`
    : 'https://itwhip.com/og-image.jpg'

  const canonicalUrl = getCanonicalUrl(`/blog/${post.slug}`, locale)

  // Schema with locale-aware URLs and language
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: canonicalUrl,
    datePublished: `${post.publishedAt}T00:00:00-07:00`,
    dateModified: `${post.updatedAt || post.publishedAt}T00:00:00-07:00`,
    image: postOgImage,
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
      url: canonicalUrl
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    inLanguage: getInLanguage(locale)
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
