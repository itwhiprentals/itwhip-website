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

/** Check if user is ONLY asking about weather (not also requesting a car/booking) */
export function isDirectWeatherQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  const weatherPatterns = [
    /what('s| is) the weather/,
    /how('s| is) the weather/,
    /weather (in|at|for|like)/,
    /is it (hot|cold|raining|sunny|warm|cool)/,
    /what('s| is) the temperature/,
    /how hot is it/,
    /how cold is it/,
  ];
  if (!weatherPatterns.some((p) => p.test(lower))) return false;

  // If message also contains booking intent, let Claude handle both
  const bookingPatterns = [
    /\bfind me\b/, /\bget me\b/, /\bshow me\b/, /\bi need\b/, /\bi want\b/, /\bbook\b/,
    /\brent\b/, /\bcar\b/, /\bsuv\b/, /\btruck\b/, /\bconvertible\b/, /\bsedan\b/, /\btesla\b/,
    /\bbmw\b/, /\bmercedes\b/, /\btoyota\b/, /\bhonda\b/, /\bavailable\b/, /\bsearch\b/,
    /\bthis weekend\b/, /\btomorrow\b/, /\bnext week\b/,
    /\bfriday\b/, /\bsaturday\b/, /\bsunday\b/,
    /\bmonday\b/, /\btuesday\b/, /\bwednesday\b/, /\bthursday\b/,
    /\bjeep\b/, /\bporsche\b/, /\bferrari\b/, /\blamborghini\b/,
  ];
  return !bookingPatterns.some((p) => p.test(lower));
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
  gilbert: { lat: 33.3528, lon: -111.7890 },
  glendale: { lat: 33.5387, lon: -112.1860 },
  peoria: { lat: 33.5806, lon: -112.2374 },
  surprise: { lat: 33.6292, lon: -112.3680 },
  goodyear: { lat: 33.4353, lon: -112.3577 },
  'paradise valley': { lat: 33.5310, lon: -111.9425 },
  'fountain hills': { lat: 33.6117, lon: -111.7174 },
  sedona: { lat: 34.8697, lon: -111.7610 },
  tucson: { lat: 32.2226, lon: -110.9747 },
  flagstaff: { lat: 35.1983, lon: -111.6513 },
};

/** Fetch weather for a location (only call when isWeatherRelevant returns true) */
export async function fetchWeatherContext(
  location: string
): Promise<WeatherContext | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
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
