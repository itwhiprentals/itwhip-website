// app/lib/constants/carColors.ts
// Color name to hex code mapping for car colors

export const CAR_COLOR_HEX_MAP: Record<string, string> = {
  'Black': '#1a1a1a',
  'White': '#f8f9fa',
  'Silver': '#c0c0c0',
  'Gray': '#808080',
  'Red': '#dc2626',
  'Blue': '#3b82f6',
  'Navy Blue': '#1e3a8a',
  'Brown': '#78350f',
  'Beige': '#d4c5b9',
  'Green': '#059669',
  'Gold': '#eab308',
  'Orange': '#ea580c',
  'Yellow': '#fbbf24',
  'Purple': '#9333ea',
  'Burgundy': '#7f1d1d',
  'Champagne': '#e5d5b7',
  'Pearl White': '#fafafa',
  'Midnight Blue': '#0c1e3d',
  'Other': '#6b7280'
}

/**
 * Get hex color code for a car color name
 * @param colorName - The name of the color (e.g., "Silver", "Red")
 * @returns Hex color code (e.g., "#c0c0c0")
 */
export function getCarColorHex(colorName: string): string {
  return CAR_COLOR_HEX_MAP[colorName] || '#6b7280' // Fallback to gray
}
