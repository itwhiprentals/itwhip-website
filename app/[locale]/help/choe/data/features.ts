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
  titleKey: string
  descKey: string
  detailsKey: string
  color: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'orange' | 'purple'
}

export const features: Feature[] = [
  {
    id: 'instant-search',
    icon: IoFlashOutline,
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
    detailsKey: 'feature1Details',
    color: 'violet'
  },
  {
    id: 'weather-aware',
    icon: IoCloudyOutline,
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
    detailsKey: 'feature2Details',
    color: 'blue'
  },
  {
    id: 'budget-calculator',
    icon: IoCalculatorOutline,
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
    detailsKey: 'feature3Details',
    color: 'emerald'
  },
  {
    id: 'no-deposit',
    icon: IoWalletOutline,
    titleKey: 'feature4Title',
    descKey: 'feature4Desc',
    detailsKey: 'feature4Details',
    color: 'amber'
  },
  {
    id: 'natural-language',
    icon: IoChatbubbleEllipsesOutline,
    titleKey: 'feature5Title',
    descKey: 'feature5Desc',
    detailsKey: 'feature5Details',
    color: 'rose'
  },
  {
    id: 'security',
    icon: IoShieldCheckmarkOutline,
    titleKey: 'feature6Title',
    descKey: 'feature6Desc',
    detailsKey: 'feature6Details',
    color: 'cyan'
  },
  {
    id: 'extended-thinking',
    icon: IoBulbOutline,
    titleKey: 'feature7Title',
    descKey: 'feature7Desc',
    detailsKey: 'feature7Details',
    color: 'purple'
  },
  {
    id: 'smart-search',
    icon: IoSearchOutline,
    titleKey: 'feature8Title',
    descKey: 'feature8Desc',
    detailsKey: 'feature8Details',
    color: 'orange'
  }
]
