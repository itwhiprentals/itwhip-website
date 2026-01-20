'use client'

import { IoDocumentTextOutline } from 'react-icons/io5'
import StageBox from './StageBox'

export default function TotalStage({ value }: { value: number }) {
  return (
    <StageBox
      label="Total"
      value={value}
      bgColor="bg-gray-200 dark:bg-gray-700"
      textColor="text-gray-700 dark:text-gray-300"
      icon={<IoDocumentTextOutline className="w-3 h-3" />}
    />
  )
}
