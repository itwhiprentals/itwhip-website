'use client'

import { IoDocumentTextOutline } from 'react-icons/io5'
import StageBox from './StageBox'

export default function DraftStage({ value }: { value: number }) {
  return (
    <StageBox
      label="Draft"
      value={value}
      bgColor="bg-gray-300 dark:bg-gray-600"
      textColor="text-gray-700 dark:text-gray-300"
      icon={<IoDocumentTextOutline className="w-3 h-3" />}
    />
  )
}
