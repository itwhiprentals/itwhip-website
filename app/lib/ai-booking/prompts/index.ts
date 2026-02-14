// app/lib/ai-booking/prompts/index.ts
// Main export - combines all prompt sections into buildSystemPrompt

import type { BookingSession, VehicleSummary, WeatherContext } from '../types';

import { IDENTITY } from './identity';
import { buildStateContext, buildUserContext, BOOKING_SEQUENCE } from './state-flow';
import { buildVehicleContext, buildWeatherContext } from './vehicle-handling';
import { PERSONALITY_RULES, OFF_TOPIC_RULES, ALLOWED_QUESTIONS } from './behavior';
import { RESPONSE_FORMAT, SEARCH_QUERY_EXAMPLES, FULL_RESPONSE_EXAMPLES, VEHICLE_SELECTION_EXAMPLES } from './response-schema';
import { getExamplesForPrompt } from './examples';
import {
  SERVICE_AREA_CONTEXT,
  DEFAULT_DATES_BEHAVIOR,
  buildLocationContext,
  getActiveMarketsContext,
} from './location-context';

// Re-export individual sections for direct imports if needed
export { IDENTITY } from './identity';
export { buildStateContext, buildUserContext, BOOKING_SEQUENCE } from './state-flow';
export { buildVehicleContext, buildWeatherContext } from './vehicle-handling';
export { PERSONALITY_RULES, OFF_TOPIC_RULES, ALLOWED_QUESTIONS } from './behavior';
export { RESPONSE_FORMAT, SEARCH_QUERY_EXAMPLES, FULL_RESPONSE_EXAMPLES, VEHICLE_SELECTION_EXAMPLES } from './response-schema';
export { EXAMPLE_CONVERSATIONS, getExamplesForPrompt } from './examples';
export {
  SERVICE_AREA_CONTEXT,
  DEFAULT_DATES_BEHAVIOR,
  buildLocationContext,
  getActiveMarketsContext,
} from './location-context';

/** Map locale code to a full language name for prompt instructions */
const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
};

/**
 * Parameters for building the system prompt
 */
export interface PromptContext {
  session: BookingSession;
  isLoggedIn: boolean;
  isVerified: boolean;
  vehicles?: VehicleSummary[];
  weather?: WeatherContext;
  location?: string | null;
  locale?: string;
}

/**
 * Build the complete system prompt for Claude
 * Combines all sections based on current context
 */
export function buildSystemPrompt(params: PromptContext): string {
  const { session, isLoggedIn, isVerified, vehicles, weather, location, locale } = params;

  const language = LOCALE_LANGUAGE[locale ?? 'en'] ?? 'English';
  const languageInstruction = locale && locale !== 'en'
    ? `LANGUAGE: You MUST respond to the user in ${language}. All your conversational text, questions, descriptions, and labels should be in ${language}. However, car names (make/model), city names, and JSON field names stay in English.`
    : '';

  return [
    // 1. Identity & role
    IDENTITY,
    // 1b. Language instruction (if non-English)
    languageInstruction,
    // 2. Context data at top (per long context tips - put data above instructions)
    SERVICE_AREA_CONTEXT,
    buildLocationContext(location ?? session.location),
    buildStateContext(session),
    buildUserContext(isLoggedIn, isVerified),
    vehicles?.length ? buildVehicleContext(vehicles) : '',
    weather ? buildWeatherContext(weather) : '',
    // 3. Instructions & workflow
    BOOKING_SEQUENCE,
    DEFAULT_DATES_BEHAVIOR,
    // 4. Behavior rules
    PERSONALITY_RULES,
    OFF_TOPIC_RULES,
    ALLOWED_QUESTIONS,
    // 5. Examples (multishot prompting - per documentation)
    SEARCH_QUERY_EXAMPLES,
    FULL_RESPONSE_EXAMPLES,
    VEHICLE_SELECTION_EXAMPLES,  // NEW: Critical for vehicle selection vs info requests
    // 6. Output format at bottom (per long context tips - query/format last)
    RESPONSE_FORMAT,
  ]
    .filter(Boolean)
    .join('\n\n');
}
