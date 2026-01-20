'use client'

import { IoArrowForwardOutline } from 'react-icons/io5'

interface StageArrowProps {
  fromValue: number
  toValue: number
}

export default function StageArrow({ fromValue, toValue }: StageArrowProps) {
  const progressionRate = fromValue > 0 && toValue > 0
    ? Math.round((toValue / fromValue) * 100)
    : null

  return (
    <div className="flex flex-col items-center mx-1 min-w-[24px]">
      <IoArrowForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
      {progressionRate !== null && progressionRate > 0 && (
        <span className="text-[9px] text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
          {progressionRate}%
        </span>
      )}
    </div>
  )
}
