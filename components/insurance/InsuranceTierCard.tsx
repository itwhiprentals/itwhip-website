// components/insurance/InsuranceTierCard.tsx
'use client';

import { useState } from 'react';

interface InsuranceTierCardProps {
  tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY';
  dailyRate: number;
  liabilityCoverage: number;
  collisionCoverage: number | string;
  deductible: number;
  description: string;
  isSelected?: boolean;
  onSelect?: () => void;
  increasedDeposit?: number | null;
  isRecommended?: boolean;
}

export default function InsuranceTierCard({
  tier,
  dailyRate,
  liabilityCoverage,
  collisionCoverage,
  deductible,
  description,
  isSelected = false,
  onSelect,
  increasedDeposit,
  isRecommended = false
}: InsuranceTierCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getTierColor = () => {
    switch (tier) {
      case 'MINIMUM': return 'border-gray-300';
      case 'BASIC': return 'border-blue-400';
      case 'PREMIUM': return 'border-purple-400';
      case 'LUXURY': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const getTierBadgeColor = () => {
    switch (tier) {
      case 'MINIMUM': return 'bg-gray-100 text-gray-800';
      case 'BASIC': return 'bg-blue-100 text-blue-800';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800';
      case 'LUXURY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCoverage = (coverage: number | string) => {
    if (typeof coverage === 'string') {
      return coverage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return formatCurrency(coverage);
  };

  return (
    <div
      className={`relative bg-white rounded-lg border-2 transition-all ${
        isSelected ? 'border-blue-600 shadow-lg' : getTierColor()
      } ${onSelect ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onSelect}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor()}`}>
              {tier}
            </span>
          </div>
          {onSelect && (
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {dailyRate === 0 ? 'Included' : formatCurrency(dailyRate)}
            </span>
            {dailyRate > 0 && (
              <span className="text-gray-500 text-sm">/day</span>
            )}
          </div>
          {increasedDeposit && (
            <p className="text-sm text-orange-600 font-medium mt-1">
              + {formatCurrency(increasedDeposit)} security deposit
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {/* Key Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              {formatCurrency(liabilityCoverage)} Liability
            </span>
          </div>

          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              {formatCoverage(collisionCoverage)} Collision
            </span>
          </div>

          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              {deductible === 0 ? 'No Deductible' : `${formatCurrency(deductible)} Deductible`}
            </span>
          </div>
        </div>

        {/* Show More Details */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
            <p><strong>Coverage Type:</strong> {tier}</p>
            <p><strong>Liability Coverage:</strong> Up to {formatCurrency(liabilityCoverage)}</p>
            <p><strong>Collision Coverage:</strong> {formatCoverage(collisionCoverage)}</p>
            <p><strong>Deductible:</strong> {deductible === 0 ? 'None' : formatCurrency(deductible)}</p>
            {increasedDeposit && (
              <p className="text-orange-600">
                <strong>Required Deposit:</strong> {formatCurrency(increasedDeposit)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}