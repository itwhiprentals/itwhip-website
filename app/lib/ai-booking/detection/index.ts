// app/lib/ai-booking/detection/index.ts
// Main export - combines intent detection and fallback utilities

// Re-export intent detection
export {
  wantsNoDeposit,
  wantsLowestPrice,
  wantsInstantBook,
  wantsDelivery,
  wantsLuxury,
  wantsElectric,
  wantsSUV,
  wantsRideshare,
  detectAllIntents,
  applyIntentsToQuery,
  hasFilters,
  summarizeIntents,
  type DetectedIntents,
} from './intent-detection';

// Re-export fallback utilities
export {
  createFallbackQueries,
  shouldTryFallback,
  getFallbackMessage,
  getFallbackLevel,
  removeFilter,
  createMinimalQuery,
} from './fallback';
