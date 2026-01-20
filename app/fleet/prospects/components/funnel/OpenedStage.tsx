'use client'

import { IoMailOpenOutline } from 'react-icons/io5'
import StageBox from './StageBox'

export default function OpenedStage({ value }: { value: number }) {
  return (
    <StageBox
      label="Opened"
      value={value}
      bgColor="bg-purple-200 dark:bg-purple-900/50"
      textColor="text-purple-700 dark:text-purple-300"
      icon={<IoMailOpenOutline className="w-3 h-3" />}
    />
  )
}
