'use client'

import { IoMailOutline } from 'react-icons/io5'
import StageBox from './StageBox'

export default function SentStage({ value }: { value: number }) {
  return (
    <StageBox
      label="Sent"
      value={value}
      bgColor="bg-blue-200 dark:bg-blue-900/50"
      textColor="text-blue-700 dark:text-blue-300"
      icon={<IoMailOutline className="w-3 h-3" />}
    />
  )
}
