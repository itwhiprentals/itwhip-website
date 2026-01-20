'use client'

export interface StageBoxProps {
  label: string
  value: number
  bgColor: string
  textColor: string
  icon: React.ReactNode
}

export default function StageBox({ label, value, bgColor, textColor, icon }: StageBoxProps) {
  return (
    <div className={`px-4 py-2 ${bgColor} rounded-lg text-center min-w-[80px] transition-transform hover:scale-105`}>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <span className={textColor}>{icon}</span>
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className={`text-xs ${textColor} font-medium`}>
        {label}
      </div>
    </div>
  )
}
