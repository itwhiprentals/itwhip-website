// app/lib/ai-booking/detection/intent-detection.ts
// Intent detection from user messages
// Layer 2 of the 3-layer fallback system (Claude → Intent Detection → Prisma)

import type { SearchQuery } from '../types';

/**
 * Detected user intents
 */
export interface DetectedIntents {
  noDeposit: boolean;
  lowestPrice: boolean;
  instantBook: boolean;
  delivery: boolean;
  luxury: boolean;
  electric: boolean;
  suv: boolean;
  rideshare: boolean;
}

/**
 * Detect if user wants no-deposit cars
 * CRITICAL: This is Layer 2 backup when Claude fails to set noDeposit: true
 */
export function wantsNoDeposit(message: string): boolean {
  return /\b(no deposit|without deposit|zero deposit|\$0 deposit|no security deposit|deposit.?free|no.?deposit)\b/i.test(
    message
  );
}

/**
 * Detect if user wants lowest price / budget options
 */
export function wantsLowestPrice(message: string): boolean {
  return /\b(cheap|cheapest|budget|lowest price|most affordable|under \$|least expensive|inexpensive|affordable|low cost|best deal)\b/i.test(
    message
  );
}

/**
 * Detect if user wants instant booking
 */
export function wantsInstantBook(message: string): boolean {
  return /\b(instant|book now|right now|immediately|asap|today|quick|instant book)\b/i.test(
    message
  );
}

/**
 * Detect if user wants delivery (airport/hotel)
 */
export function wantsDelivery(message: string): boolean {
  return /\b(deliver|delivery|airport|hotel|pick.?up|drop.?off|sky harbor|phx airport|meet me at)\b/i.test(
    message
  );
}

/**
 * Detect if user wants luxury vehicles
 */
export function wantsLuxury(message: string): boolean {
  return /\b(luxury|premium|nice|fancy|high.?end|executive|upscale|top.?of.?the.?line|best you have)\b/i.test(
    message
  );
}

/**
 * Detect if user wants electric vehicles
 */
export function wantsElectric(message: string): boolean {
  return /\b(electric|ev|tesla|hybrid|eco|green|plug.?in|zero emission)\b/i.test(message);
}

/**
 * Detect if user wants SUV
 */
export function wantsSUV(message: string): boolean {
  return /\b(suv|truck|4x4|off.?road|jeep|crossover|4.?wheel|awd|all.?wheel)\b/i.test(message);
}

/**
 * Detect if user wants rideshare-approved vehicles
 */
export function wantsRideshare(message: string): boolean {
  return /\b(uber|lyft|doordash|instacart|rideshare|ride.?share|gig|delivery driver|grubhub)\b/i.test(
    message
  );
}

/**
 * Detect all intents from a user message
 */
export function detectAllIntents(message: string): DetectedIntents {
  return {
    noDeposit: wantsNoDeposit(message),
    lowestPrice: wantsLowestPrice(message),
    instantBook: wantsInstantBook(message),
    delivery: wantsDelivery(message),
    luxury: wantsLuxury(message),
    electric: wantsElectric(message),
    suv: wantsSUV(message),
    rideshare: wantsRideshare(message),
  };
}

/**
 * Apply detected intents to a search query
 * This fills gaps when Claude fails to extract filters
 */
export function applyIntentsToQuery(
  query: SearchQuery | null,
  intents: DetectedIntents
): SearchQuery {
  const result: SearchQuery = { ...(query || {}) };

  // Apply boolean filters (always add if detected and not already set)
  if (intents.noDeposit && !result.noDeposit) {
    result.noDeposit = true;
  }

  if (intents.instantBook && !result.instantBook) {
    result.instantBook = true;
  }

  // Apply carType only if not already set (don't override Claude's choice)
  if (!result.carType) {
    if (intents.luxury) {
      result.carType = 'luxury';
    } else if (intents.electric) {
      result.carType = 'electric';
    } else if (intents.suv) {
      result.carType = 'SUV';
    }
  }

  return result;
}

/**
 * Check if a search query has any filters applied
 */
export function hasFilters(query: SearchQuery | null): boolean {
  if (!query) return false;

  return !!(
    query.make ||
    query.carType ||
    query.priceMin ||
    query.priceMax ||
    query.seats ||
    query.transmission ||
    query.noDeposit ||
    query.instantBook
  );
}

/**
 * Get a human-readable summary of detected intents
 * Useful for debugging and logging
 */
export function summarizeIntents(intents: DetectedIntents): string {
  const active = Object.entries(intents)
    .filter(([, value]) => value)
    .map(([key]) => key);

  if (active.length === 0) return 'No specific intents detected';

  return `Detected: ${active.join(', ')}`;
}
