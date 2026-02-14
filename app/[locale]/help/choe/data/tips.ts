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
  titleKey: string
  descKey: string
  exampleKey: string
}

export const tips: Tip[] = [
  {
    id: 'be-specific',
    icon: IoLocationOutline,
    titleKey: 'tip1Title',
    descKey: 'tip1Desc',
    exampleKey: 'tip1Example'
  },
  {
    id: 'mention-budget',
    icon: IoWalletOutline,
    titleKey: 'tip2Title',
    descKey: 'tip2Desc',
    exampleKey: 'tip2Example'
  },
  {
    id: 'vehicle-type',
    icon: IoCarSportOutline,
    titleKey: 'tip3Title',
    descKey: 'tip3Desc',
    exampleKey: 'tip3Example'
  },
  {
    id: 'dates-matter',
    icon: IoCalendarOutline,
    titleKey: 'tip4Title',
    descKey: 'tip4Desc',
    exampleKey: 'tip4Example'
  },
  {
    id: 'ask-questions',
    icon: IoChatbubbleEllipsesOutline,
    titleKey: 'tip5Title',
    descKey: 'tip5Desc',
    exampleKey: 'tip5Example'
  },
  {
    id: 'no-deposit',
    icon: IoSparklesOutline,
    titleKey: 'tip6Title',
    descKey: 'tip6Desc',
    exampleKey: 'tip6Example'
  }
]
