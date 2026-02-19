// app/fleet/components/PhoneWidgetWrapper.tsx
// Dynamic import wrapper for PhoneWidget — prevents SSR issues with @twilio/voice-sdk
'use client'

import dynamic from 'next/dynamic'

const PhoneWidget = dynamic(() => import('./PhoneWidget'), {
  ssr: false,
  loading: () => null,
})

export default function PhoneWidgetWrapper() {
  return <PhoneWidget />
}
