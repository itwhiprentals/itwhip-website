import { Metadata } from 'next'
import PressContent from './PressContent'

export const metadata: Metadata = {
  title: 'Press & Media | ItWhip',
  description: 'ItWhip press releases, media kit, and news coverage. Arizona\'s peer-to-peer car sharing marketplace press resources.',
  alternates: {
    canonical: 'https://itwhip.com/press',
  },
  openGraph: {
    title: 'Press & Media | ItWhip',
    description: 'Press resources, media kit, and news coverage for ItWhip.',
    url: 'https://itwhip.com/press',
    type: 'website',
  },
}

export default function PressPage() {
  return <PressContent />
}
