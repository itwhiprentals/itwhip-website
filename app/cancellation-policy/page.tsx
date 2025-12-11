// app/cancellation-policy/page.tsx
import { Metadata } from 'next'
import CancellationPolicyContent from './CancellationPolicyContent'

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | ItWhip Car Rentals Phoenix',
  description: 'Understand ItWhip\'s cancellation and refund policy for car rentals in Phoenix. Guest cancellation timelines, host policies, refund processing, and trip modifications explained.',
  keywords: [
    'car rental cancellation policy',
    'Phoenix car rental refund',
    'ItWhip cancellation',
    'peer to peer car sharing cancellation',
    'car rental refund timeline',
    'trip modification policy',
    'Arizona car rental cancellation'
  ],
  openGraph: {
    title: 'Cancellation & Refund Policy | ItWhip Car Rentals',
    description: 'Flexible cancellation policies for car rentals in Phoenix. Cancel up to 72 hours before for a full refund.',
    type: 'website',
    url: 'https://itwhip.com/cancellation-policy',
  },
  alternates: {
    canonical: 'https://itwhip.com/cancellation-policy',
  },
}

export default function CancellationPolicyPage() {
  return <CancellationPolicyContent />
}
