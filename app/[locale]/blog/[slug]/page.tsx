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

// Posts that have custom OG images (static PNGs in /public/og/blog/)
const postsWithStaticOgImages = [
  'turo-vs-itwhip-arizona-2025',
]

// Posts with Cloudinary-hosted OG images (1200x630 auto-cropped)
const cloudinaryOgImages: Record<string, string> = {
  'renting-out-car-worth-it': 'https://res.cloudinary.com/du1hjyrgm/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/blog/arizona-car-rental-income-driveway-suv.jpg',
  'p2p-insurance-tiers': 'https://res.cloudinary.com/du1hjyrgm/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/blog/p2p-car-rental-insurance-fender-bender-damage.jpg',
  'esg-car-sharing': 'https://res.cloudinary.com/du1hjyrgm/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/blog/esg-car-sharing-fleet-aerial-view.jpg',
  'phoenix-airport-alternatives': 'https://res.cloudinary.com/du1hjyrgm/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/blog/phoenix-sky-harbor-airport-plane-takeoff.jpg',
  'best-cars-sedona-road-trip-2025': 'https://res.cloudinary.com/du1hjyrgm/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/blog/sedona-scenic-drive-red-rock-formations.jpg',
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getLocalizedPostBySlug(slug, locale)
  if (!post) return { title: 'Post Not Found | ItWhip Blog' }

  // Use custom OG image if exists, otherwise fall back to default
  const ogImage = cloudinaryOgImages[post.slug]
    ?? (postsWithStaticOgImages.includes(post.slug) ? `https://itwhip.com/og/blog/${post.slug}.png` : 'https://itwhip.com/og-image.jpg')

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
  const postOgImage = cloudinaryOgImages[post.slug]
    ?? (postsWithStaticOgImages.includes(post.slug) ? `https://itwhip.com/og/blog/${post.slug}.png` : 'https://itwhip.com/og-image.jpg')

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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://itwhip.com' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://itwhip.com/blog' },
      { '@type': 'ListItem', 'position': 3, 'name': post.title }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostClient post={post} prevPost={prev} nextPost={next} />
    </>
  )
}
