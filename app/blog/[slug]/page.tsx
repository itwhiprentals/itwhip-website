// app/blog/[slug]/page.tsx
// Blog post page with all features

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug } from '@/content/posts'
import BlogPostClient from './BlogPostClient'

// Generate static params
export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found | ItWhip Blog' }

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
      type: 'article',
      publishedTime: post.publishedAt,
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
  
  // Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    publisher: { '@type': 'Organization', name: 'ItWhip' }
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