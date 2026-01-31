// app/lib/ai-booking/risk-bridge.ts
// Bridge to the existing fraud detection system
// Wraps fraud-detection.ts for AI booking context

import { BookingSession, VehicleSummary, BookingAction } from './types';

// =============================================================================
// RISK ASSESSMENT
// =============================================================================

export interface RiskResult {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  action: BookingAction | null;
  message: string | null;
}

/** Assess booking risk based on session data and user context */
export async function assessBookingRisk(params: {
  session: BookingSession;
  vehicle: VehicleSummary;
  userId: string | null;
  isVerified: boolean;
  numberOfDays: number;
  totalAmount: number;
}): Promise<RiskResult> {
  const { vehicle, userId, isVerified, numberOfDays, totalAmount } = params;

  // Simple scoring based on existing verification rules
  let score = 0;
  const flags: string[] = [];

  // New/anonymous user
  if (!userId) {
    score += 30;
    flags.push('anonymous_user');
  }

  // Not verified
  if (!isVerified) {
    score += 20;
    flags.push('unverified');
  }

  // High-value booking
  if (totalAmount > 2000) {
    score += 20;
    flags.push('high_value');
  }
  if (totalAmount > 5000) {
    score += 20;
    flags.push('very_high_value');
  }

  // Luxury/exotic vehicle
  if (vehicle.dailyRate >= 500) {
    score += 25;
    flags.push('exotic_vehicle');
  } else if (vehicle.dailyRate >= 150) {
    score += 10;
    flags.push('luxury_vehicle');
  }

  // Long rental
  if (numberOfDays >= 7) {
    score += 10;
    flags.push('long_rental');
  }

  score = Math.min(score, 100);

  // Determine action based on score
  if (score >= 61) {
    return {
      score,
      level: 'high',
      action: 'HIGH_RISK_REVIEW',
      message: 'For premium vehicles, we need to verify your identity before proceeding. This helps keep our fleet safe for everyone.',
    };
  }

  if (score >= 31 && !isVerified) {
    return {
      score,
      level: 'medium',
      action: 'NEEDS_VERIFICATION',
      message: 'Quick verification needed before booking. Just takes a minute!',
    };
  }

  return {
    score,
    level: 'low',
    action: null,
    message: null,
  };
}
