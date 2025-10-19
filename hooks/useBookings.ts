'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

async function fetchBookings() {
  const response = await fetch('/api/rentals/user-bookings', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return response.json();
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings', 'user'],
    queryFn: fetchBookings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInvalidateBookings() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['bookings', 'user'] });
  };
}
