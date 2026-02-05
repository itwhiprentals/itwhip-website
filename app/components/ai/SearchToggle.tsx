'use client'

import { IoSparkles, IoSearch } from 'react-icons/io5'

interface SearchToggleProps {
  mode: 'normal' | 'ai'
  onToggle: (mode: 'normal' | 'ai') => void
}

export default function SearchToggle({ mode, onToggle }: SearchToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => onToggle('normal')}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${mode === 'normal'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }
        `}
      >
        <IoSearch size={14} />
        Search
      </button>
      <button
        onClick={() => onToggle('ai')}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${mode === 'ai'
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-primary'
          }
        `}
      >
        <IoSparkles size={14} />
        AI Search
      </button>
    </div>
  )
}
