// app/help/choe/data/features.ts
// Smart features data for Choé AI

import { IconType } from 'react-icons'
import {
  IoSearchOutline,
  IoCloudyOutline,
  IoCalculatorOutline,
  IoWalletOutline,
  IoChatbubbleEllipsesOutline,
  IoShieldCheckmarkOutline,
  IoBulbOutline,
  IoFlashOutline
} from 'react-icons/io5'

export interface Feature {
  id: string
  icon: IconType
  title: string
  description: string
  color: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'orange' | 'purple'
}

export const features: Feature[] = [
  {
    id: 'instant-search',
    icon: IoFlashOutline,
    title: 'Instant Search',
    description: 'Finds matching cars in seconds. No more scrolling through endless listings.',
    color: 'violet'
  },
  {
    id: 'weather-aware',
    icon: IoCloudyOutline,
    title: 'Weather-Aware',
    description: 'Recommends vehicles based on Arizona weather. Convertible when it\'s sunny, SUV when it rains.',
    color: 'blue'
  },
  {
    id: 'budget-calculator',
    icon: IoCalculatorOutline,
    title: 'Budget Calculator',
    description: '"$500 for 4 days" — Choé calculates your daily rate and finds cars that fit.',
    color: 'emerald'
  },
  {
    id: 'no-deposit',
    icon: IoWalletOutline,
    title: 'No-Deposit Finder',
    description: 'Prioritizes cars with no security deposit. Keep your money in your pocket.',
    color: 'amber'
  },
  {
    id: 'natural-language',
    icon: IoChatbubbleEllipsesOutline,
    title: 'Natural Language',
    description: 'Type like you\'re texting a friend. "I need an SUV for 6 people, under $50/day."',
    color: 'rose'
  },
  {
    id: 'security',
    icon: IoShieldCheckmarkOutline,
    title: '7-Layer Security',
    description: 'Protected against abuse and prompt injection. Your conversations are safe.',
    color: 'cyan'
  },
  {
    id: 'extended-thinking',
    icon: IoBulbOutline,
    title: 'Extended Thinking',
    description: 'Complex queries get deeper reasoning. Choé thinks harder when you need it.',
    color: 'purple'
  },
  {
    id: 'smart-search',
    icon: IoSearchOutline,
    title: 'Smart Search',
    description: 'Understands "cheap" means budget-friendly. "Nice" means luxury. No filters needed.',
    color: 'orange'
  }
]
