// app/lib/ai-booking/filters/features.ts
// Feature filters for Prisma queries (instantBook, delivery, seats, transmission)

import { Prisma } from '@prisma/client';

/**
 * Apply instant book filter
 */
export function applyInstantBookFilter(
  where: Prisma.RentalCarWhereInput,
  instantBook?: boolean
): Prisma.RentalCarWhereInput {
  if (instantBook !== true) return where;

  return {
    ...where,
    instantBook: true,
  };
}

/**
 * Apply seats filter (minimum seats)
 */
export function applySeatsFilter(
  where: Prisma.RentalCarWhereInput,
  seats?: number
): Prisma.RentalCarWhereInput {
  if (!seats) return where;

  return {
    ...where,
    seats: { gte: seats },
  };
}

/**
 * Apply transmission filter
 */
export function applyTransmissionFilter(
  where: Prisma.RentalCarWhereInput,
  transmission?: string
): Prisma.RentalCarWhereInput {
  if (!transmission) return where;

  const normalized = transmission.toLowerCase();

  // Handle common variations
  if (normalized === 'auto' || normalized === 'automatic') {
    return {
      ...where,
      transmission: { contains: 'automatic', mode: 'insensitive' },
    };
  }

  if (normalized === 'manual' || normalized === 'stick' || normalized === 'standard') {
    return {
      ...where,
      transmission: { contains: 'manual', mode: 'insensitive' },
    };
  }

  return {
    ...where,
    transmission: { contains: transmission, mode: 'insensitive' },
  };
}

/**
 * Apply delivery filter (airport, hotel, home)
 */
export function applyDeliveryFilter(
  where: Prisma.RentalCarWhereInput,
  delivery?: string
): Prisma.RentalCarWhereInput {
  if (!delivery) return where;

  const normalized = delivery.toLowerCase().trim();

  if (normalized === 'airport') {
    return { ...where, airportPickup: true };
  }

  if (normalized === 'hotel') {
    return { ...where, hotelDelivery: true };
  }

  if (normalized === 'home') {
    return { ...where, homeDelivery: true };
  }

  // Generic delivery option - any of the three
  return {
    ...where,
    OR: [
      ...(where.OR || []),
      { airportPickup: true },
      { hotelDelivery: true },
      { homeDelivery: true },
    ],
  };
}

/**
 * Apply multiple delivery filters from array (for search route)
 */
export function applyMultipleDeliveryFilters(
  where: Prisma.RentalCarWhereInput,
  deliveryOptions: string[]
): Prisma.RentalCarWhereInput {
  if (!deliveryOptions || deliveryOptions.length === 0) return where;

  let result = where;
  if (deliveryOptions.includes('airport')) result = { ...result, airportPickup: true };
  if (deliveryOptions.includes('hotel')) result = { ...result, hotelDelivery: true };
  if (deliveryOptions.includes('home')) result = { ...result, homeDelivery: true };
  return result;
}

/**
 * Apply all feature filters at once
 */
export function applyFeaturesFilter(
  where: Prisma.RentalCarWhereInput,
  options: {
    instantBook?: boolean;
    seats?: number;
    transmission?: string;
    delivery?: string;
  }
): Prisma.RentalCarWhereInput {
  let result = where;
  result = applyInstantBookFilter(result, options.instantBook);
  result = applySeatsFilter(result, options.seats);
  result = applyTransmissionFilter(result, options.transmission);
  result = applyDeliveryFilter(result, options.delivery);
  return result;
}
