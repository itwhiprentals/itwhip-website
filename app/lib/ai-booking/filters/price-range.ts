// app/lib/ai-booking/filters/price-range.ts
// Price range filter for Prisma queries

import { Prisma } from '@prisma/client';

/**
 * Apply price range filter to Prisma where clause
 */
export function applyPriceFilter(
  where: Prisma.RentalCarWhereInput,
  priceMin?: number,
  priceMax?: number
): Prisma.RentalCarWhereInput {
  if (!priceMin && !priceMax) return where;

  const priceConditions: Prisma.RentalCarWhereInput = {};

  if (priceMin) {
    priceConditions.dailyRate = {
      ...(priceConditions.dailyRate as object),
      gte: priceMin,
    };
  }

  if (priceMax) {
    priceConditions.dailyRate = {
      ...(priceConditions.dailyRate as object),
      lte: priceMax,
    };
  }

  return {
    ...where,
    ...priceConditions,
  };
}
