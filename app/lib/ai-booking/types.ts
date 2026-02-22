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
  /** Unique session identifier for tracking */
  sessionId: string;
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

  /** User's maximum TOTAL budget (not daily rate) - used for filtering vehicle cards */
  maxTotalBudget?: number | null;
  /** Number of rental days (for total cost calculation) */
  rentalDays?: number | null;

  /** Verified email from OTP flow (null if not yet verified) */
  verifiedEmail: string | null;
  /** Timestamp (ms) when email was verified — expires after 30 min */
  verifiedAt: number | null;
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
  /** Browser fingerprint for anonymous user tracking */
  visitorId?: string | null;
  /** Pass back vehicles from previous response so Claude can reference them */
  previousVehicles?: VehicleSummary[] | null;
  /** User's locale for multilingual responses */
  locale?: string;
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
  | 'START_OVER'
  | 'NEEDS_EMAIL_OTP';

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
  /** All photos for carousel display */
  photos: string[];
  rating: number | null;
  reviewCount: number;
  /** Total completed trips for this vehicle */
  trips: number;
  distance: string | null;
  location: string;
  instantBook: boolean;
  /** Vehicle type: RENTAL (regular) or RIDESHARE (for Uber/Lyft drivers) */
  vehicleType: 'RENTAL' | 'RIDESHARE' | null;
  seats: number | null;
  transmission: string | null;
  /** Actual deposit from hybrid system (per-vehicle or host settings) */
  depositAmount: number;
  /** Real daily insurance rate for Basic tier (from InsuranceProvider pricing rules) */
  insuranceBasicDaily: number | null;
  /** Host's first name for display */
  hostFirstName: string | null;
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
  carType?: string;           // Body type: SUV, sedan, luxury, sports, electric
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  make?: string;
  priceMin?: number;
  priceMax?: number;
  seats?: number;
  transmission?: string;
  noDeposit?: boolean;        // Filter for cars with no security deposit
  instantBook?: boolean;      // Filter for instant book cars
  vehicleType?: 'RENTAL' | 'RIDESHARE';  // Filter for rideshare-approved vehicles
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

// =============================================================================
// CHECKOUT PIPELINE (deterministic — no AI, driven by useCheckout hook)
// =============================================================================

export enum CheckoutStep {
  IDLE = 'IDLE',
  INSURANCE = 'INSURANCE',
  DELIVERY = 'DELIVERY',
  ADDONS = 'ADDONS',
  REVIEW = 'REVIEW',
  PAYMENT = 'PAYMENT',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/** Insurance tier option returned by checkout/init */
export interface InsuranceTierOption {
  tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY';
  dailyPremium: number;
  totalPremium: number;
  coverage: {
    liability: number;
    collision: number | 'vehicle_value';
    deductible: number;
    description: string;
  };
  /** MINIMUM tier increases the security deposit */
  increasedDeposit: number | null;
}

/** Delivery option returned by checkout/init */
export interface DeliveryOption {
  type: 'pickup' | 'airport' | 'hotel' | 'home';
  label: string;
  fee: number;
  available: boolean;
}

/** Add-on option returned by checkout/init */
export interface AddOnOption {
  id: 'refuelService' | 'additionalDriver' | 'extraMiles' | 'vipConcierge';
  label: string;
  description: string;
  price: number;
  perDay: boolean;
  selected: boolean;
}

/** Individual add-on line item in the grand total breakdown */
export interface AddOnItem {
  id: string;
  label: string;
  /** Calculated total: flat fee or perDay * days */
  amount: number;
}

/** Guest balance information */
export interface GuestBalances {
  credits: number;
  bonus: number;
  depositWallet: number;
  maxBonusPercent: number;
}

/** Saved payment card from Stripe */
export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

/**
 * Full checkout state managed by useCheckout hook.
 * NOTE: grandTotal is NOT stored here — it's computed via computeGrandTotal() in the hook.
 * The server breakdown from payment-intent is the billing source of truth.
 */
export interface CheckoutState {
  step: CheckoutStep;
  /** Server-side session ID threaded through all APIs to prevent tampering */
  checkoutSessionId: string | null;
  vehicleId: string;
  summary: BookingSummary;
  insuranceOptions: InsuranceTierOption[];
  selectedInsurance: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY' | null;
  deliveryOptions: DeliveryOption[];
  /** null forces explicit selection (no default) */
  selectedDelivery: 'pickup' | 'airport' | 'hotel' | 'home' | null;
  addOns: AddOnOption[];
  clientSecret: string | null;
  paymentIntentId: string | null;
  bookingConfirmation: BookingConfirmation | null;
  error: string | null;
  /** Guest credit/bonus/deposit wallet balances */
  guestBalances: GuestBalances | null;
  /** Saved payment cards from Stripe */
  savedCards: SavedCard[];
  /** Applied credits (reduces rental total) */
  appliedCredits: number;
  /** Applied bonus (reduces rental total, capped at maxBonusPercent) */
  appliedBonus: number;
  /** Applied deposit wallet (reduces deposit) */
  appliedDepositWallet: number;
  /** Active promo code */
  promoCode: string | null;
  /** Promo discount amount */
  promoDiscount: number;
  /** Selected saved payment method ID */
  selectedPaymentMethod: string | null;
  /** Price changed since checkout init */
  priceChanged: { oldRate: number; newRate: number } | null;
}

/** Display-only grand total computed from current CheckoutState */
export interface GrandTotal {
  rental: number;
  serviceFee: number;
  insurance: number;
  delivery: number;
  addOns: AddOnItem[];
  addOnsTotal: number;
  tax: number;
  taxRate: string;
  deposit: number;
  /** Discounts from credits, bonus, promo */
  appliedCredits: number;
  appliedBonus: number;
  promoDiscount: number;
  appliedDepositWallet: number;
  totalDiscount: number;
  /** Total before discounts */
  subtotalBeforeDiscounts: number;
  total: number;
}

export interface BookingConfirmation {
  bookingId: string;
  referenceCode: string;
  vehicle: { year: number; make: string; model: string; photo: string | null };
  dates: { start: string; end: string; days: number };
  total: number;
  paymentLast4: string;
  paymentBrand: string;
}
