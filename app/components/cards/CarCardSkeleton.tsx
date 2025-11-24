// app/components/cards/CarCardSkeleton.tsx
'use client'

export default function CarCardSkeleton() {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-pulse">
      <div className="relative h-48 sm:h-56 bg-gray-200 dark:bg-gray-700">
        <div className="absolute top-3 left-3 h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="absolute bottom-3 right-3 px-4 py-2.5 bg-gray-300 dark:bg-gray-600 rounded-lg w-20 h-10" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="flex justify-between">
          <div className="flex gap-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-600">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}