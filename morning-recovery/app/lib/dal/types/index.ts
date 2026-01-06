// app/lib/dal/types/index.ts
// Pure TypeScript types - NO Prisma dependencies
// This is the single source of truth for all enums and types

// ============================================================================
// USER & AUTH ENUMS
// ============================================================================

export enum UserRole {
    ANONYMOUS = 'ANONYMOUS',
    CLAIMED = 'CLAIMED',
    STARTER = 'STARTER',
    BUSINESS = 'BUSINESS',
    ENTERPRISE = 'ENTERPRISE',
    ADMIN = 'ADMIN'
  }
  
  export enum CertificationTier {
    NONE = 'NONE',
    TU_3_C = 'TU_3_C',
    TU_2_B = 'TU_2_B',
    TU_1_A = 'TU_1_A'
  }
  
  // ============================================================================
  // HOTEL ENUMS
  // ============================================================================
  
  export enum PropertyType {
    HOTEL = 'HOTEL',
    RESORT = 'RESORT',
    MOTEL = 'MOTEL',
    BNB = 'BNB',
    BOUTIQUE = 'BOUTIQUE',
    CHAIN = 'CHAIN',
    INDEPENDENT = 'INDEPENDENT'
  }
  
  export enum HotelSize {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    LARGE = 'LARGE',
    ENTERPRISE = 'ENTERPRISE'
  }
  
  export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CHECKED_IN = 'CHECKED_IN',
    CHECKED_OUT = 'CHECKED_OUT',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
  }
  
  export enum BookingSource {
    DIRECT = 'DIRECT',
    EXPEDIA = 'EXPEDIA',
    BOOKING_COM = 'BOOKING_COM',
    AIRBNB = 'AIRBNB',
    AMADEUS = 'AMADEUS',
    SABRE = 'SABRE',
    WEBSITE = 'WEBSITE',
    PHONE = 'PHONE',
    WALK_IN = 'WALK_IN'
  }
  
  // ============================================================================
  // RIDE ENUMS
  // ============================================================================
  
  export enum RideStatus {
    REQUESTED = 'REQUESTED',
    SEARCHING = 'SEARCHING',
    DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
    DRIVER_ARRIVED = 'DRIVER_ARRIVED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    GHOST = 'GHOST'
  }
  
  // ============================================================================
  // RENTAL ENUMS
  // ============================================================================
  
  export enum RentalBookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
  }
  
  // ============================================================================
  // REVENUE ENUMS
  // ============================================================================
  
  export enum RevenueStatus {
    PENDING = 'PENDING',
    AVAILABLE = 'AVAILABLE',
    PROCESSING = 'PROCESSING',
    WITHDRAWN = 'WITHDRAWN',
    HELD = 'HELD'
  }
  
  export enum TransactionType {
    RIDE_COMMISSION = 'RIDE_COMMISSION',
    BOOKING = 'BOOKING',
    WITHDRAWAL = 'WITHDRAWAL',
    FEE = 'FEE',
    REFUND = 'REFUND',
    FOOD_ORDER = 'FOOD_ORDER',
    CHEF_COMMISSION = 'CHEF_COMMISSION',
    CATERING_DEPOSIT = 'CATERING_DEPOSIT'
  }
  
  export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
  }
  
  // ============================================================================
  // SECURITY ENUMS
  // ============================================================================
  
  export enum ThreatSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
  }
  
  export enum ThreatStatus {
    DETECTED = 'DETECTED',
    INVESTIGATING = 'INVESTIGATING',
    MITIGATED = 'MITIGATED',
    BLOCKED = 'BLOCKED',
    RESOLVED = 'RESOLVED',
    FALSE_POSITIVE = 'FALSE_POSITIVE'
  }
  
  export enum AuditCategory {
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    DATA_ACCESS = 'DATA_ACCESS',
    DATA_MODIFICATION = 'DATA_MODIFICATION',
    CONFIGURATION = 'CONFIGURATION',
    SECURITY = 'SECURITY',
    COMPLIANCE = 'COMPLIANCE',
    FINANCIAL = 'FINANCIAL'
  }
  
  export enum AttackType {
    BRUTE_FORCE = 'BRUTE_FORCE',
    DICTIONARY = 'DICTIONARY',
    SQL_INJECTION = 'SQL_INJECTION',
    XSS = 'XSS',
    CSRF = 'CSRF',
    DDOS = 'DDOS',
    MAN_IN_MIDDLE = 'MAN_IN_MIDDLE',
    SESSION_HIJACK = 'SESSION_HIJACK',
    CREDENTIAL_STUFFING = 'CREDENTIAL_STUFFING',
    BOT = 'BOT'
  }
  
  // ============================================================================
  // METRICS ENUMS
  // ============================================================================
  
  export enum MetricPeriod {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
  }
  
  export enum RevenuePeriod {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    TOTAL = 'TOTAL'
  }
  
  // ============================================================================
  // FOOD SERVICE ENUMS (Future)
  // ============================================================================
  
  export enum FoodOrderStatus {
    RECEIVED = 'RECEIVED',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    PICKED_UP = 'PICKED_UP',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
  }
  
  export enum ChefServiceType {
    FOOD_TRUCK = 'FOOD_TRUCK',
    PERSONAL_CHEF = 'PERSONAL_CHEF',
    CATERING = 'CATERING',
    MEAL_PREP = 'MEAL_PREP',
    POP_UP = 'POP_UP',
    GHOST_KITCHEN = 'GHOST_KITCHEN'
  }
  
  export enum CuisineType {
    AMERICAN = 'AMERICAN',
    MEXICAN = 'MEXICAN',
    ITALIAN = 'ITALIAN',
    CHINESE = 'CHINESE',
    JAPANESE = 'JAPANESE',
    THAI = 'THAI',
    INDIAN = 'INDIAN',
    MEDITERRANEAN = 'MEDITERRANEAN',
    FRENCH = 'FRENCH',
    KOREAN = 'KOREAN',
    VIETNAMESE = 'VIETNAMESE',
    CARIBBEAN = 'CARIBBEAN',
    SOUL_FOOD = 'SOUL_FOOD',
    BBQ = 'BBQ',
    SEAFOOD = 'SEAFOOD',
    VEGAN = 'VEGAN',
    FUSION = 'FUSION',
    BREAKFAST = 'BREAKFAST',
    DESSERT = 'DESSERT',
    OTHER = 'OTHER'
  }
  
  export enum MealType {
    BREAKFAST = 'BREAKFAST',
    BRUNCH = 'BRUNCH',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK',
    DESSERT = 'DESSERT',
    BEVERAGE = 'BEVERAGE',
    LATE_NIGHT = 'LATE_NIGHT'
  }
  
  export enum DietaryRestriction {
    VEGETARIAN = 'VEGETARIAN',
    VEGAN = 'VEGAN',
    GLUTEN_FREE = 'GLUTEN_FREE',
    DAIRY_FREE = 'DAIRY_FREE',
    NUT_FREE = 'NUT_FREE',
    SHELLFISH_FREE = 'SHELLFISH_FREE',
    HALAL = 'HALAL',
    KOSHER = 'KOSHER',
    LOW_CARB = 'LOW_CARB',
    KETO = 'KETO',
    DIABETIC_FRIENDLY = 'DIABETIC_FRIENDLY',
    NONE = 'NONE'
  }
  
  export enum FoodPricingModel {
    PER_PERSON = 'PER_PERSON',
    PER_PLATE = 'PER_PLATE',
    PER_HOUR = 'PER_HOUR',
    FIXED_EVENT = 'FIXED_EVENT',
    BUFFET = 'BUFFET',
    TASTING_MENU = 'TASTING_MENU',
    A_LA_CARTE = 'A_LA_CARTE'
  }
  
  export enum KitchenStatus {
    OPEN = 'OPEN',
    BUSY = 'BUSY',
    CLOSING_SOON = 'CLOSING_SOON',
    CLOSED = 'CLOSED',
    PREP_ONLY = 'PREP_ONLY',
    PRIVATE_EVENT = 'PRIVATE_EVENT'
  }
  
  export enum FoodServiceRadius {
    ON_SITE_ONLY = 'ON_SITE_ONLY',
    FIVE_MILES = 'FIVE_MILES',
    TEN_MILES = 'TEN_MILES',
    TWENTY_MILES = 'TWENTY_MILES',
    CITY_WIDE = 'CITY_WIDE',
    DELIVERY_ZONE = 'DELIVERY_ZONE'
  }
  
  // ============================================================================
  // TYPE ALIASES FOR COMPATIBILITY
  // ============================================================================
  
  // These match Prisma's generated types for easy migration
  export type UserRoleType = keyof typeof UserRole
  export type CertificationTierType = keyof typeof CertificationTier
  export type PropertyTypeType = keyof typeof PropertyType
  export type HotelSizeType = keyof typeof HotelSize
  export type BookingStatusType = keyof typeof BookingStatus
  export type BookingSourceType = keyof typeof BookingSource
  export type RideStatusType = keyof typeof RideStatus
  export type RentalBookingStatusType = keyof typeof RentalBookingStatus
  export type RevenueStatusType = keyof typeof RevenueStatus
  export type TransactionTypeType = keyof typeof TransactionType
  export type TransactionStatusType = keyof typeof TransactionStatus
  export type ThreatSeverityType = keyof typeof ThreatSeverity
  export type ThreatStatusType = keyof typeof ThreatStatus
  export type AuditCategoryType = keyof typeof AuditCategory
  export type AttackTypeType = keyof typeof AttackType
  export type MetricPeriodType = keyof typeof MetricPeriod
  export type RevenuePeriodType = keyof typeof RevenuePeriod