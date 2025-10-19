// app/admin/claims/page.tsx
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
  host: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    bookingCode: string;
    guestName: string | null;
  };
  policy: {
    tier: string;
    policyNumber: string | null;
    provider: {
      name: string;
    };
  };
}

export default function AdminClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, typeFilter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/fleet/claims?${params.toString()}`);
      
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
      case 'DISPUTED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ACCIDENT': return 'bg-red-50 text-red-700';
      case 'THEFT': return 'bg-purple-50 text-purple-700';
      case 'VANDALISM': return 'bg-orange-50 text-orange-700';
      case 'CLEANING': return 'bg-blue-50 text-blue-700';
      case 'MECHANICAL': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-gray-600 mt-2">Review and process insurance claims</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="DENIED">Denied</option>
                <option value="PAID">Paid</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="ACCIDENT">Accident</option>
                <option value="THEFT">Theft</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="CLEANING">Cleaning</option>
                <option value="MECHANICAL">Mechanical</option>
                <option value="WEATHER">Weather</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No claims found</p>
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/claims/${claim.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(claim.type)}`}>
                          {claim.type}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900">
                        Booking: {claim.booking.bookingCode}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Host: {claim.host.name} | Guest: {claim.booking.guestName || 'N/A'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${claim.approvedAmount || claim.estimatedCost}
                      </p>
                      <p className="text-sm text-gray-500">
                        {claim.approvedAmount ? 'Approved' : 'Estimated'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Incident Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(claim.incidentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
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
                    <div>
                      <p className="text-xs text-gray-500">Provider</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claim.policy.provider.name}
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