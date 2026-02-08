// app/choe/page.tsx — Standalone fullscreen Choé AI chat page
// Outside (guest) route group: no Header/Footer, just the chat

import type { Metadata, Viewport } from 'next'
import ChoePageClient from './ChoePageClient'

// Same viewport pattern as /help/choe — server-rendered meta tags that Safari reads
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export const metadata: Metadata = {
  title: 'Choé | AI Car Search | ItWhip',
  description: 'Chat with Choé, your AI car rental assistant. Find the perfect car in Arizona with natural language search.',
  openGraph: {
    title: 'Choé | AI Car Search | ItWhip',
    description: 'Chat with Choé, your AI car rental assistant. Find the perfect car in Arizona with natural language search.',
    url: 'https://itwhip.com/choe',
    type: 'website',
    images: [
      {
        url: '/images/choe-logo.png',
        width: 512,
        height: 512,
        alt: 'Choé AI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Choé | AI Car Search | ItWhip',
    description: 'Chat with Choé, your AI car rental assistant. Find the perfect car in Arizona.',
    images: ['/images/choe-logo.png'],
  },
}

export default function ChoePage() {
  return <ChoePageClient />
}
