// app/help/choe/data/workflow.ts
// How Choé works - 7-step booking flow

import { IconType } from 'react-icons'
import {
  IoChatbubbleEllipsesOutline,
  IoSearchOutline,
  IoCarSportOutline,
  IoCheckmarkCircle,
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoRocketOutline
} from 'react-icons/io5'

export interface WorkflowStep {
  step: number
  icon: IconType
  title: string
  description: string
  example?: string
}

export const workflowSteps: WorkflowStep[] = [
  {
    step: 1,
    icon: IoChatbubbleEllipsesOutline,
    title: 'Tell Choé What You Need',
    description: 'Just type naturally. Location, dates, preferences — Choé understands.',
    example: '"I need an SUV in Phoenix for next weekend, under $60/day"'
  },
  {
    step: 2,
    icon: IoSearchOutline,
    title: 'Choé Searches Inventory',
    description: 'Real-time search across all available vehicles. Weather and traffic considered.',
    example: 'Searching 150+ cars in Phoenix area...'
  },
  {
    step: 3,
    icon: IoCarSportOutline,
    title: 'Compare Your Options',
    description: 'See matching vehicles with photos, prices, and features. Ask follow-up questions.',
    example: '"Which one has the best reviews?"'
  },
  {
    step: 4,
    icon: IoCheckmarkCircle,
    title: 'Confirm Your Selection',
    description: 'Pick the car you want. Choé shows you the full breakdown — no hidden fees.',
    example: 'Toyota RAV4, $52/day, no deposit, 4.9★'
  },
  {
    step: 5,
    icon: IoShieldCheckmarkOutline,
    title: 'Verify Your Identity',
    description: 'Quick ID verification for first-time users. Already verified? Skip this step.',
    example: 'Upload your driver\'s license'
  },
  {
    step: 6,
    icon: IoCardOutline,
    title: 'Secure Payment',
    description: 'Powered by Stripe. Your card is authorized but not charged until host approval.',
    example: 'Payment secured — waiting for host'
  },
  {
    step: 7,
    icon: IoRocketOutline,
    title: 'You\'re Booked!',
    description: 'Confirmation email sent. Coordinate pickup with your host. Hit the road.',
    example: 'Booking confirmed! Check your email.'
  }
]
