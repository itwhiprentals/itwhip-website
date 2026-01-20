'use client'

import { IoHandLeftOutline } from 'react-icons/io5'
import StageBox from './StageBox'

export default function ClickedStage({ value }: { value: number }) {
  return (
    <StageBox
      label="Clicked"
      value={value}
      bgColor="bg-orange-200 dark:bg-orange-900/50"
      textColor="text-orange-700 dark:text-orange-300"
      icon={<IoHandLeftOutline className="w-3 h-3" />}
    />
  )
}
