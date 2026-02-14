// app/help/choe/data/tips.ts
// Tips for getting the best results from Choé

import { IconType } from 'react-icons'
import {
  IoLocationOutline,
  IoWalletOutline,
  IoCarSportOutline,
  IoCalendarOutline,
  IoChatbubbleEllipsesOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export interface Tip {
  id: string
  icon: IconType
  title: string
  description: string
  example: string
}

export const tips: Tip[] = [
  {
    id: 'be-specific',
    icon: IoLocationOutline,
    title: 'Be Specific About Location',
    description: 'Tell Choé exactly where you need the car. City, neighborhood, or even airport.',
    example: '"SUV in Scottsdale near Old Town" or "car near Phoenix Sky Harbor"'
  },
  {
    id: 'mention-budget',
    icon: IoWalletOutline,
    title: 'Mention Your Budget Upfront',
    description: 'Choé can calculate daily rates from a total budget. No math required.',
    example: '"$400 total for 5 days" → Choé finds cars under $80/day'
  },
  {
    id: 'vehicle-type',
    icon: IoCarSportOutline,
    title: 'Tell Choé Your Preferences',
    description: 'SUV, sedan, electric, luxury, rideshare-ready — Choé knows them all.',
    example: '"I need something for DoorDash" → Choé finds rideshare-approved cars'
  },
  {
    id: 'dates-matter',
    icon: IoCalendarOutline,
    title: 'Include Dates When Possible',
    description: 'Choé can search with or without dates, but specific dates get better results.',
    example: '"Next Friday to Sunday" or "March 15-18"'
  },
  {
    id: 'ask-questions',
    icon: IoChatbubbleEllipsesOutline,
    title: 'Ask Follow-Up Questions',
    description: 'Didn\'t find what you want? Ask Choé to filter more, show different options, or explain features.',
    example: '"Show me only cars with no deposit" or "What about electric cars?"'
  },
  {
    id: 'no-deposit',
    icon: IoSparklesOutline,
    title: 'Ask About No-Deposit Options',
    description: 'Many of our hosts offer cars with no security deposit. Just ask!',
    example: '"I want a car with no deposit required"'
  }
]
