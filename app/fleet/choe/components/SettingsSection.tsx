// app/fleet/choe/components/SettingsSection.tsx

'use client'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}
