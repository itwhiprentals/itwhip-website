import { Metadata } from 'next'
import ContactContent from './ContactContent'

export const metadata: Metadata = {
  title: 'Contact ItWhip | Support & Help',
  description: 'Get help with your ItWhip rental. Contact our Phoenix-based support team for hosts and guests. Email, chat, and phone support available.',
  alternates: {
    canonical: 'https://itwhip.com/contact',
  },
  openGraph: {
    title: 'Contact ItWhip | Support & Help',
    description: 'Contact ItWhip\'s Phoenix-based support team.',
    url: 'https://itwhip.com/contact',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactContent />
}
