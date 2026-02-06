// app/help/chloe/data/features.ts
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
  details: string
  color: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'orange' | 'purple'
}

export const features: Feature[] = [
  {
    id: 'instant-search',
    icon: IoFlashOutline,
    title: 'Instant Search',
    description: 'Finds matching cars in seconds. No more scrolling through endless listings.',
    details: 'Choé searches our entire Arizona inventory in real-time, filtering by your preferences including location, dates, price range, and vehicle type. Results are sorted by relevance and best match for your needs.',
    color: 'violet'
  },
  {
    id: 'weather-aware',
    icon: IoCloudyOutline,
    title: 'Weather-Aware',
    description: 'Recommends vehicles based on Arizona weather. Convertible when it\'s sunny, SUV when it rains.',
    details: 'Integrated with live weather data for Phoenix, Scottsdale, Tempe, and all Arizona cities. Choé factors in temperature, precipitation, and UV index when suggesting vehicles for your trip.',
    color: 'blue'
  },
  {
    id: 'budget-calculator',
    icon: IoCalculatorOutline,
    title: 'Budget Calculator',
    description: '"$500 for 4 days" — Choé calculates your daily rate and finds cars that fit.',
    details: 'Tell Choé your total budget and trip length. The AI calculates your maximum daily rate, factors in service fees and taxes, and shows only vehicles within your budget. No surprises at checkout.',
    color: 'emerald'
  },
  {
    id: 'no-deposit',
    icon: IoWalletOutline,
    title: 'No-Deposit Finder',
    description: 'Prioritizes cars with no security deposit. Keep your money in your pocket.',
    details: 'Many ItWhip hosts offer zero-deposit rentals. Just say "no deposit" and Choé filters to show only cars where you won\'t need to put down a security deposit upfront.',
    color: 'amber'
  },
  {
    id: 'natural-language',
    icon: IoChatbubbleEllipsesOutline,
    title: 'Natural Language',
    description: 'Type like you\'re texting a friend. "I need an SUV for 6 people, under $50/day."',
    details: 'No forms, no dropdowns, no filter menus. Just describe what you need in plain English. Choé understands context, preferences, and even vague requests like "something nice for a date night."',
    color: 'rose'
  },
  {
    id: 'security',
    icon: IoShieldCheckmarkOutline,
    title: '7-Layer Security',
    description: 'Protected against abuse and prompt injection. Your conversations are safe.',
    details: 'Choé includes bot detection, rate limiting, input validation, prompt injection prevention, and end-to-end encryption. Your personal data and payment information are protected at every step.',
    color: 'cyan'
  },
  {
    id: 'extended-thinking',
    icon: IoBulbOutline,
    title: 'Extended Thinking',
    description: 'Complex queries get deeper reasoning. Choé thinks harder when you need it.',
    details: 'When you ask complex questions like "best car for a family road trip to Sedona with a baby seat and under $60/day", Choé takes extra time to reason through all requirements and find the perfect match.',
    color: 'purple'
  },
  {
    id: 'smart-search',
    icon: IoSearchOutline,
    title: 'Smart Search',
    description: 'Understands "cheap" means budget-friendly. "Nice" means luxury. No filters needed.',
    details: 'Choé interprets subjective terms: "cheap" filters to economy class, "spacious" looks for SUVs and minivans, "fun" suggests convertibles and sports cars. The AI learns from context to give you exactly what you mean.',
    color: 'orange'
  }
]
