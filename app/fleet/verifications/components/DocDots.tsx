// app/fleet/verifications/components/DocDots.tsx
'use client'

interface DocDotsProps {
  hasLicenseFront: boolean
  hasLicenseBack: boolean
  hasInsurance: boolean
}

export default function DocDots({ hasLicenseFront, hasLicenseBack, hasInsurance }: DocDotsProps) {
  return (
    <div className="flex items-center gap-1" title="DL Front / DL Back / Insurance">
      <span
        title="DL Front"
        className={`w-2.5 h-2.5 rounded-full ${hasLicenseFront ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      />
      <span
        title="DL Back"
        className={`w-2.5 h-2.5 rounded-full ${hasLicenseBack ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      />
      <span
        title="Insurance"
        className={`w-2.5 h-2.5 rounded-full ${hasInsurance ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      />
    </div>
  )
}
