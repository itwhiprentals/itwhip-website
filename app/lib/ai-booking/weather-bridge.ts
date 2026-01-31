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

/** Check if user is directly asking about weather (not car-related) */
export function isDirectWeatherQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  const patterns = [
    /what('s| is) the weather/,
    /how('s| is) the weather/,
    /weather (in|at|for|like)/,
    /is it (hot|cold|raining|sunny|warm|cool)/,
    /what('s| is) the temperature/,
    /how hot is it/,
    /how cold is it/,
  ];
  return patterns.some((p) => p.test(lower));
}

/** Extract city name from a weather question */
export function extractCityFromWeatherQuestion(message: string): string | null {
  const lower = message.toLowerCase();
  const cities = Object.keys(CITY_COORDS);
  for (const city of cities) {
    if (lower.includes(city)) return city;
  }
  return null;
}

/** Build a friendly weather response without calling Claude */
export function buildWeatherReply(weather: WeatherContext): string {
  const desc = weather.description;
  const temp = weather.temp;
  const city = weather.city.charAt(0).toUpperCase() + weather.city.slice(1);

  let emoji = '🌤️';
  if (desc.includes('cloud')) emoji = '☁️';
  else if (desc.includes('rain') || desc.includes('drizzle')) emoji = '🌧️';
  else if (desc.includes('storm') || desc.includes('thunder')) emoji = '⛈️';
  else if (desc.includes('clear') || desc.includes('sunny')) emoji = '☀️';
  else if (temp >= 100) emoji = '🔥';

  let comment = '';
  if (temp >= 100) comment = 'Great day for an AC-blasting ride!';
  else if (temp >= 85) comment = 'Perfect convertible weather!';
  else if (temp >= 70) comment = 'Beautiful driving weather!';
  else if (temp >= 55) comment = 'Nice and comfortable out there!';
  else comment = 'A little cool — cozy ride weather!';

  return `It's ${temp}°F and ${desc} in ${city} ${emoji} ${comment} Need a car to cruise around?`;
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
