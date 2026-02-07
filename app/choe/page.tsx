// app/choe/page.tsx — Standalone fullscreen Choé AI chat page
// Outside (guest) route group: no Header/Footer, just the chat

import type { Metadata } from 'next'
import ChoePageClient from './ChoePageClient'

export const metadata: Metadata = {
  title: 'Choé | AI Car Search | ItWhip',
  description: 'Chat with Choé, your AI car rental assistant. Find the perfect car in Arizona with natural language search.',
}

export default function ChoePage() {
  return <ChoePageClient />
}
