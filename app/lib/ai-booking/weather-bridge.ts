// app/lib/ai-booking/weather-bridge.ts
// Conditional weather fetch — only when relevant to vehicle recommendation
// SDK-extractable — no framework-specific imports

import { WeatherContext } from './types';

// =============================================================================
// WEATHER RELEVANCE CHECK
// =============================================================================

const WEATHER_KEYWORDS = [
  'convertible', 'rain', 'weather', 'top down', 'outdoor',
  'sunny', 'hot', 'cold', 'monsoon', 'wind', 'storm',
  'open top', 'cabriolet', 'roadster',
];

/** Check if user's message suggests weather is relevant to car choice */
export function isWeatherRelevant(message: string): boolean {
  const lower = message.toLowerCase();
  return WEATHER_KEYWORDS.some((kw) => lower.includes(kw));
}

// =============================================================================
// WEATHER FETCH
// =============================================================================

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  phoenix: { lat: 33.4484, lon: -112.074 },
  scottsdale: { lat: 33.4942, lon: -111.9261 },
  tempe: { lat: 33.4255, lon: -111.9400 },
  mesa: { lat: 33.4152, lon: -111.8315 },
  chandler: { lat: 33.3062, lon: -111.8413 },
  sedona: { lat: 34.8697, lon: -111.7610 },
  tucson: { lat: 32.2226, lon: -110.9747 },
  flagstaff: { lat: 35.1983, lon: -111.6513 },
};

/** Fetch weather for a location (only call when isWeatherRelevant returns true) */
export async function fetchWeatherContext(
  location: string
): Promise<WeatherContext | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  const cityKey = location.toLowerCase().trim();
  const coords = CITY_COORDS[cityKey];
  if (!coords) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      city: location,
      temp: Math.round(data.main?.temp || 0),
      description: data.weather?.[0]?.description || 'clear',
    };
  } catch {
    return null;
  }
}
