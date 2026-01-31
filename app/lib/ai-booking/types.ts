// app/lib/ai-booking/types.ts
// Core types for the AI Booking service layer
// SDK-extractable — no framework-specific imports

// =============================================================================
// BOOKING STATES
// =============================================================================

export enum BookingState {
  INIT = 'INIT',
  COLLECTING_LOCATION = 'COLLECTING_LOCATION',
  COLLECTING_DATES = 'COLLECTING_DATES',
  COLLECTING_VEHICLE = 'COLLECTING_VEHICLE',
  CONFIRMING = 'CONFIRMING',
  CHECKING_AUTH = 'CHECKING_AUTH',
  READY_FOR_PAYMENT = 'READY_FOR_PAYMENT',
}

// =============================================================================
// SESSION
// =============================================================================

export interface BookingSession {
  state: BookingState;
  location: string | null;
  locationId: string | null;
  startDate: string | null;   // ISO date: "2026-02-01"
  endDate: string | null;     // ISO date: "2026-02-02"
  startTime: string | null;   // "HH:mm"
  endTime: string | null;     // "HH:mm"
  vehicleType: string | null; // "Tesla", "SUV", "Luxury", etc.
  vehicleId: string | null;
  messages: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// =============================================================================
// API REQUEST / RESPONSE
// =============================================================================

export interface AIBookingRequest {
  message: string;
  session: BookingSession;
  userId?: string | null;
  /** Pass back vehicles from previous response so Claude can reference them */
  previousVehicles?: VehicleSummary[] | null;
}

export interface AIBookingResponse {
  reply: string;
  session: BookingSession;
  vehicles: VehicleSummary[] | null;
  summary: BookingSummary | null;
  action: BookingAction | null;
  suggestions: string[] | null;
}

export type BookingAction =
  | 'HANDOFF_TO_PAYMENT'
  | 'NEEDS_LOGIN'
  | 'NEEDS_VERIFICATION'
  | 'HIGH_RISK_REVIEW'
  | 'START_OVER';

// =============================================================================
// VEHICLE (simplified for AI chat display)
// =============================================================================

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  photo: string | null;
  rating: number | null;
  reviewCount: number;
  distance: string | null;
  location: string;
  instantBook: boolean;
  seats: number | null;
  transmission: string | null;
}

// =============================================================================
// BOOKING SUMMARY (shown at confirmation)
// =============================================================================

export interface BookingSummary {
  vehicle: VehicleSummary;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  numberOfDays: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  estimatedTax: number;
  estimatedTotal: number;
  depositAmount: number;
}

// =============================================================================
// CLAUDE RESPONSE (internal — what Claude returns as JSON)
// =============================================================================

export interface ClaudeBookingOutput {
  reply: string;
  nextState: BookingState;
  extractedData: Partial<{
    location: string;
    locationId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    vehicleType: string;
    vehicleId: string;
  }>;
  action: BookingAction | null;
  searchQuery: SearchQuery | null;
}

export interface SearchQuery {
  location?: string;
  carType?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  make?: string;
  priceMin?: number;
  priceMax?: number;
  seats?: number;
  transmission?: string;
}

// =============================================================================
// WEATHER CONTEXT (optional, injected when relevant)
// =============================================================================

export interface WeatherContext {
  city: string;
  temp: number;
  description: string;
  forecast?: string;
}
