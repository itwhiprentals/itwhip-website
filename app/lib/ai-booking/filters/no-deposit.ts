// app/lib/ai-booking/filters/no-deposit.ts
// Hybrid no-deposit filter for Prisma queries
// Handles both per-vehicle and host-level deposit settings

import { Prisma } from '@prisma/client';

/**
 * Apply no-deposit filter to Prisma where clause
 *
 * Handles the hybrid deposit system:
 * 1. Individual vehicle mode: check vehicle's noDeposit flag
 * 2. Host-level mode: check host's requireDeposit setting
 * 3. Null/unset mode: fall back to host setting
 */
export function applyNoDepositFilter(
  where: Prisma.RentalCarWhereInput,
  noDeposit?: boolean
): Prisma.RentalCarWhereInput {
  if (noDeposit !== true) return where;

  // Preserve existing OR conditions if any
  const existingOR = where.OR || [];

  return {
    ...where,
    OR: [
      ...existingOR,
      // Per-vehicle deposit setting (vehicleDepositMode = 'individual')
      { vehicleDepositMode: 'individual', noDeposit: true },
      // Host/global mode - check host's requireDeposit setting
      { vehicleDepositMode: { in: ['global', 'host'] }, host: { requireDeposit: false } },
    ],
  };
}
