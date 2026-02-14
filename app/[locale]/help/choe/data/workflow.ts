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
  titleKey: string
  descKey: string
  exampleKey?: string
}

export const workflowSteps: WorkflowStep[] = [
  {
    step: 1,
    icon: IoChatbubbleEllipsesOutline,
    titleKey: 'workflowStep1Title',
    descKey: 'workflowStep1Desc',
    exampleKey: 'workflowStep1Example'
  },
  {
    step: 2,
    icon: IoSearchOutline,
    titleKey: 'workflowStep2Title',
    descKey: 'workflowStep2Desc',
    exampleKey: 'workflowStep2Example'
  },
  {
    step: 3,
    icon: IoCarSportOutline,
    titleKey: 'workflowStep3Title',
    descKey: 'workflowStep3Desc',
    exampleKey: 'workflowStep3Example'
  },
  {
    step: 4,
    icon: IoCheckmarkCircle,
    titleKey: 'workflowStep4Title',
    descKey: 'workflowStep4Desc',
    exampleKey: 'workflowStep4Example'
  },
  {
    step: 5,
    icon: IoShieldCheckmarkOutline,
    titleKey: 'workflowStep5Title',
    descKey: 'workflowStep5Desc',
    exampleKey: 'workflowStep5Example'
  },
  {
    step: 6,
    icon: IoCardOutline,
    titleKey: 'workflowStep6Title',
    descKey: 'workflowStep6Desc',
    exampleKey: 'workflowStep6Example'
  },
  {
    step: 7,
    icon: IoRocketOutline,
    titleKey: 'workflowStep7Title',
    descKey: 'workflowStep7Desc',
    exampleKey: 'workflowStep7Example'
  }
]
