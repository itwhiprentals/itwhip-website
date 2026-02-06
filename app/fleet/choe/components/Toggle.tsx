// app/fleet/choe/components/Toggle.tsx
// Reusable toggle switch components for Fleet dashboard settings

'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'blue' | 'green' | 'orange'
}

/**
 * Base toggle switch component with smooth animation
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'purple',
}: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', knob: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', knob: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', knob: 'w-6 h-6', translate: 'translate-x-7' },
  }

  const colors = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    orange: 'bg-orange-500',
  }

  const { track, knob, translate } = sizes[size]
  const activeColor = colors[color]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative ${track} rounded-full transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        ${checked ? activeColor : 'bg-gray-300 dark:bg-gray-600'}
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 ${knob} bg-white rounded-full shadow-sm
          transition-transform duration-200 ease-in-out
          ${checked ? translate : 'translate-x-0'}
        `}
      />
    </button>
  )
}

// =============================================================================
// TOGGLE SETTING (Simple toggle with label)
// =============================================================================

interface ToggleSettingProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * Simple toggle with inline label
 */
export function ToggleSetting({
  label,
  checked,
  onChange,
  disabled = false,
}: ToggleSettingProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <ToggleSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  )
}

// =============================================================================
// TOGGLE SETTING CARD (Toggle with description in a bordered card)
// =============================================================================

interface ToggleSettingCardProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  color?: 'purple' | 'blue' | 'green' | 'orange'
}

/**
 * Toggle in a card with label and description
 * Used for Advanced AI Features section
 */
export function ToggleSettingCard({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  color = 'purple',
}: ToggleSettingCardProps) {
  return (
    <div
      className={`
        p-4 border border-gray-200 dark:border-gray-700 rounded-lg
        transition-all duration-200
        ${checked ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : ''}
        ${disabled ? 'opacity-60' : ''}
      `}
    >
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="mt-0.5">
          <ToggleSwitch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            color={color}
          />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
      </label>
    </div>
  )
}

// =============================================================================
// FEATURE CARD (For vehicle type preferences with colored indicator)
// =============================================================================

interface FeatureCardProps {
  title: string
  description: string
  indicatorColor: 'orange' | 'emerald' | 'blue' | 'purple'
  toggleLabel: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * Feature preference card with colored indicator
 * Used for Vehicle Type Preferences section
 */
export function FeatureCard({
  title,
  description,
  indicatorColor,
  toggleLabel,
  checked,
  onChange,
  disabled = false,
}: FeatureCardProps) {
  const indicatorColors = {
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  }

  return (
    <div
      className={`
        p-4 border border-gray-200 dark:border-gray-700 rounded-lg
        transition-all duration-200
        ${checked ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
        ${disabled ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${indicatorColors[indicatorColor]}`} />
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {description}
      </p>
      <ToggleSetting
        label={toggleLabel}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
