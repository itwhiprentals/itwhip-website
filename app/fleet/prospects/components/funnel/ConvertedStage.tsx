'use client'

import { IoPersonAddOutline } from 'react-icons/io5'
import StageBox from './StageBox'

export default function ConvertedStage({ value }: { value: number }) {
  return (
    <StageBox
      label="Converted"
      value={value}
      bgColor="bg-green-200 dark:bg-green-900/50"
      textColor="text-green-700 dark:text-green-300"
      icon={<IoPersonAddOutline className="w-3 h-3" />}
    />
  )
}
