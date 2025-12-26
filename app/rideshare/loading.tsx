// app/rideshare/loading.tsx
// Loading state for rideshare page

export default function RideshareLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header placeholder */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50" />

      <div className="pt-16">
        {/* Hero skeleton */}
        <div className="relative w-full min-h-[45vh] bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <div className="h-10 w-80 bg-gray-700 rounded-lg mx-auto" />
            <div className="h-6 w-64 bg-gray-700 rounded mx-auto" />
            <div className="h-12 w-96 bg-gray-700 rounded-lg mx-auto mt-4" />
          </div>
        </div>

        {/* Quick actions bar skeleton */}
        <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Content skeletons */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section title */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />

            {/* Cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    </div>
  )
}
