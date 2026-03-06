// Shared date separator pill between messages

'use client'

interface DateSeparatorProps {
  date: string | Date
  locale?: string
}

export function DateSeparator({ date, locale }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-2">
      <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
        {new Date(date).toLocaleDateString(locale || 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  )
}
