// app/lib/ai-booking/prompts/index.ts
// Main export - combines all prompt sections into buildSystemPrompt

import type { BookingSession, VehicleSummary, WeatherContext } from '../types';

import { IDENTITY } from './identity';
import { buildStateContext, buildUserContext, BOOKING_SEQUENCE } from './state-flow';
import { buildVehicleContext, buildWeatherContext } from './vehicle-handling';
import { PERSONALITY_RULES, OFF_TOPIC_RULES, ALLOWED_QUESTIONS } from './behavior';
import { RESPONSE_FORMAT, SEARCH_QUERY_EXAMPLES, FULL_RESPONSE_EXAMPLES } from './response-schema';
import { getExamplesForPrompt } from './examples';

// Re-export individual sections for direct imports if needed
export { IDENTITY } from './identity';
export { buildStateContext, buildUserContext, BOOKING_SEQUENCE } from './state-flow';
export { buildVehicleContext, buildWeatherContext } from './vehicle-handling';
export { PERSONALITY_RULES, OFF_TOPIC_RULES, ALLOWED_QUESTIONS } from './behavior';
export { RESPONSE_FORMAT, SEARCH_QUERY_EXAMPLES, FULL_RESPONSE_EXAMPLES } from './response-schema';
export { EXAMPLE_CONVERSATIONS, getExamplesForPrompt } from './examples';

/**
 * Parameters for building the system prompt
 */
export interface PromptContext {
  session: BookingSession;
  isLoggedIn: boolean;
  isVerified: boolean;
  vehicles?: VehicleSummary[];
  weather?: WeatherContext;
}

/**
 * Build the complete system prompt for Claude
 * Combines all sections based on current context
 */
export function buildSystemPrompt(params: PromptContext): string {
  const { session, isLoggedIn, isVerified, vehicles, weather } = params;

  return [
    IDENTITY,
    buildStateContext(session),
    buildUserContext(isLoggedIn, isVerified),
    vehicles?.length ? buildVehicleContext(vehicles) : '',
    weather ? buildWeatherContext(weather) : '',
    BOOKING_SEQUENCE,
    PERSONALITY_RULES,
    OFF_TOPIC_RULES,
    ALLOWED_QUESTIONS,
    RESPONSE_FORMAT,
    SEARCH_QUERY_EXAMPLES,
    FULL_RESPONSE_EXAMPLES,
  ]
    .filter(Boolean)
    .join('\n\n');
}
