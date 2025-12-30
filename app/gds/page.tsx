import { Metadata } from 'next'
import GDSContent from './GDSContent'

export const metadata: Metadata = {
  title: 'Distribution & Partnerships | ItWhip',
  description: 'ItWhip distribution partnerships and GDS integration documentation. Connect travel systems with our P2P car rental platform in Arizona.',
  alternates: {
    canonical: 'https://itwhip.com/gds',
  },
  openGraph: {
    title: 'Distribution & Partnerships | ItWhip',
    description: 'Partner with ItWhip for car rental distribution in Arizona.',
    url: 'https://itwhip.com/gds',
    type: 'website',
  },
}

export default function GDSPage() {
  return <GDSContent />
}
