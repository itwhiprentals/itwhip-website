// app/fleet/claims/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Claim {
  id: string;
  type: string;
  status: string;
  estimatedCost: number;
  approvedAmount: number | null;
  incidentDate: string;
  createdAt: string;
  description: string;
  booking: {
    id: string;
    bookingCode: string;
    guestName: string | null;
    car: {
      make: string;
      model: string;
      year: number;
    };
  };
  policy: {
    tier: string;
  };
}

export default function FleetClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get hostId from session/auth (placeholder - you'll need actual auth)
  const hostId = 'current-host-id'; // Replace with actual host ID from auth

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fleet/claims?hostId=${hostId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();
      setClaims(data.claims || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'DENIED': return 'bg-red-100 text-red-800';
      case 'PAID': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchClaims}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-600 mt-2">
            View and track your insurance claims
          </p>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No claims filed</h3>
                <p className="mt-2 text-sm text-gray-500">
                  You haven't filed any insurance claims yet.
                </p>
              </div>
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {claim.type}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {claim.booking.car.year} {claim.booking.car.make} {claim.booking.car.model}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Booking: {claim.booking.bookingCode}
                      </p>
                      
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {claim.description}
                      </p>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900">
                        ${claim.approvedAmount || claim.estimatedCost}
                      </p>
                      <p className="text-xs text-gray-500">
                        {claim.approvedAmount ? 'Approved Amount' : 'Estimated Cost'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Incident Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(claim.incidentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Filed On</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Insurance Tier</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claim.policy.tier}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}