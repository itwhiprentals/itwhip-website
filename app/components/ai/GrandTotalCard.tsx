'use client'

import { useState } from 'react'
import { IoReceipt, IoWallet, IoCard, IoTicket } from 'react-icons/io5'
import type { GrandTotal, GuestBalances, SavedCard } from '@/app/lib/ai-booking/types'

interface GrandTotalCardProps {
  grandTotal: GrandTotal
  numberOfDays: number
  dailyRate: number
  onPay: () => void
  onBack?: () => void
  isLoading?: boolean
  // Credits/bonus/wallet
  guestBalances?: GuestBalances | null
  appliedCredits?: number
  appliedBonus?: number
  appliedDepositWallet?: number
  onApplyCredits?: (amount: number) => void
  onApplyBonus?: (amount: number) => void
  onApplyDepositWallet?: (amount: number) => void
  // Promo
  promoCode?: string | null
  promoDiscount?: number
  onApplyPromo?: (code: string) => void
  // Saved cards
  savedCards?: SavedCard[]
  selectedPaymentMethod?: string | null
  onSelectPaymentMethod?: (pmId: string | null) => void
  // Explore
  onExplore?: () => void
  // Price change warning
  priceChanged?: { oldRate: number; newRate: number } | null
}

export default function GrandTotalCard({
  grandTotal,
  numberOfDays,
  dailyRate,
  onPay,
  onBack,
  isLoading,
  guestBalances,
  appliedCredits = 0,
  appliedBonus = 0,
  appliedDepositWallet = 0,
  onApplyCredits,
  onApplyBonus,
  onApplyDepositWallet,
  promoCode,
  promoDiscount = 0,
  onApplyPromo,
  savedCards,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onExplore,
  priceChanged,
}: GrandTotalCardProps) {
  const [promoInput, setPromoInput] = useState('')

  const hasAnyBalance =
    guestBalances &&
    (guestBalances.credits > 0 ||
      guestBalances.bonus > 0 ||
      guestBalances.depositWallet > 0)

  // Stripe requires a minimum $1.00 charge — cap discounts so the total
  // never drops below $1.00 (matching the existing booking page logic in
  // calculateAppliedBalances).
  const STRIPE_MIN_CHARGE = 1.0

  function handleToggleCredits() {
    if (!onApplyCredits || !guestBalances) return
    if (appliedCredits > 0) {
      onApplyCredits(0)
    } else {
      // Max credits: available balance, but cannot reduce total below $1
      const otherDiscounts = appliedBonus + promoDiscount + appliedDepositWallet
      const maxBeforeFloor = grandTotal.subtotalBeforeDiscounts - otherDiscounts - STRIPE_MIN_CHARGE
      const max = Math.min(
        guestBalances.credits,
        Math.max(0, maxBeforeFloor)
      )
      onApplyCredits(Math.round(max * 100) / 100)
    }
  }

  function handleToggleBonus() {
    if (!onApplyBonus || !guestBalances) return
    if (appliedBonus > 0) {
      onApplyBonus(0)
    } else {
      const maxByPercent =
        grandTotal.subtotalBeforeDiscounts *
        guestBalances.maxBonusPercent
      // Cannot reduce total below $1
      const otherDiscounts = appliedCredits + promoDiscount + appliedDepositWallet
      const maxBeforeFloor = grandTotal.subtotalBeforeDiscounts - otherDiscounts - STRIPE_MIN_CHARGE
      const max = Math.min(
        guestBalances.bonus,
        maxByPercent,
        Math.max(0, maxBeforeFloor)
      )
      onApplyBonus(Math.round(max * 100) / 100)
    }
  }

  function handleToggleDepositWallet() {
    if (!onApplyDepositWallet || !guestBalances) return
    if (appliedDepositWallet > 0) {
      onApplyDepositWallet(0)
    } else {
      // Cannot reduce total below $1
      const otherDiscounts = appliedCredits + appliedBonus + promoDiscount
      const maxBeforeFloor = grandTotal.subtotalBeforeDiscounts - otherDiscounts - STRIPE_MIN_CHARGE
      const max = Math.min(
        guestBalances.depositWallet,
        grandTotal.deposit,
        Math.max(0, maxBeforeFloor)
      )
      onApplyDepositWallet(Math.round(max * 100) / 100)
    }
  }

  function handleApplyPromo() {
    if (!onApplyPromo || !promoInput.trim()) return
    onApplyPromo(promoInput.trim())
    setPromoInput('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
        <IoReceipt size={16} className="text-primary" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Order Summary
        </h4>
      </div>

      {/* Price change warning */}
      {priceChanged && (
        <div className="mx-3 mt-3 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded text-xs text-amber-700 dark:text-amber-300">
          Price updated: was ${priceChanged.oldRate.toFixed(2)}/day, now $
          {priceChanged.newRate.toFixed(2)}/day. Your total reflects the new
          rate.
        </div>
      )}

      <div className="p-3 space-y-1.5">
        {/* Rental */}
        <Row
          label={`Rental: $${dailyRate.toFixed(2)} x ${numberOfDays} days`}
          amount={grandTotal.rental}
        />

        {/* Service Fee */}
        <Row label="Service fee (15%)" amount={grandTotal.serviceFee} />

        {/* Insurance */}
        {grandTotal.insurance > 0 && (
          <Row label="Insurance" amount={grandTotal.insurance} />
        )}

        {/* Delivery */}
        {grandTotal.delivery > 0 && (
          <Row label="Delivery" amount={grandTotal.delivery} />
        )}

        {/* Add-ons */}
        {grandTotal.addOns.map((addOn) => (
          <Row key={addOn.id} label={addOn.label} amount={addOn.amount} />
        ))}

        {/* Tax */}
        <Row label={`Tax (${grandTotal.taxRate})`} amount={grandTotal.tax} />

        {/* Divider before deposit */}
        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

        {/* Deposit */}
        <Row
          label="Security deposit (refundable)"
          amount={grandTotal.deposit}
          muted
        />

        {/* Applied discount rows */}
        {grandTotal.appliedCredits > 0 && (
          <Row
            label="Credits applied"
            amount={-grandTotal.appliedCredits}
            discount
          />
        )}
        {grandTotal.appliedBonus > 0 && (
          <Row
            label="Bonus applied"
            amount={-grandTotal.appliedBonus}
            discount
          />
        )}
        {grandTotal.promoDiscount > 0 && (
          <Row
            label={`Promo${promoCode ? ` (${promoCode})` : ''}`}
            amount={-grandTotal.promoDiscount}
            discount
          />
        )}
        {grandTotal.appliedDepositWallet > 0 && (
          <Row
            label="Deposit wallet applied"
            amount={-grandTotal.appliedDepositWallet}
            discount
          />
        )}

        {/* Your Benefits section */}
        {hasAnyBalance && (
          <>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            <div className="pt-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Benefits
              </p>
              <div className="space-y-2">
                {guestBalances!.credits > 0 && (
                  <BenefitToggle
                    icon={<IoWallet size={13} className="text-green-600 dark:text-green-400" />}
                    label="Credits"
                    available={guestBalances!.credits}
                    applied={appliedCredits}
                    checked={appliedCredits > 0}
                    onChange={handleToggleCredits}
                  />
                )}
                {guestBalances!.bonus > 0 && (
                  <BenefitToggle
                    icon={<IoTicket size={13} className="text-green-600 dark:text-green-400" />}
                    label={`Bonus (max ${Math.round(guestBalances!.maxBonusPercent * 100)}%)`}
                    available={guestBalances!.bonus}
                    applied={appliedBonus}
                    checked={appliedBonus > 0}
                    onChange={handleToggleBonus}
                  />
                )}
                {guestBalances!.depositWallet > 0 && (
                  <BenefitToggle
                    icon={<IoWallet size={13} className="text-green-600 dark:text-green-400" />}
                    label="Deposit wallet"
                    available={guestBalances!.depositWallet}
                    applied={appliedDepositWallet}
                    checked={appliedDepositWallet > 0}
                    onChange={handleToggleDepositWallet}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Promo code input */}
        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
        <div className="pt-1">
          {promoCode && promoDiscount > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <IoTicket size={12} />
              <span>
                Promo <span className="font-medium">{promoCode}</span> applied
                (-${promoDiscount.toFixed(2)})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                placeholder="Promo code"
                className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleApplyPromo}
                disabled={!promoInput.trim()}
                className="px-2.5 py-1 text-xs font-medium text-primary border border-primary rounded hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Grand Total
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              ${Math.max(grandTotal.total, STRIPE_MIN_CHARGE).toFixed(2)}
            </span>
          </div>
          {grandTotal.totalDiscount > 0 &&
            grandTotal.total <= STRIPE_MIN_CHARGE && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Minimum charge of $1.00 applies
              </p>
            )}
        </div>
      </div>

      {/* Saved cards section */}
      {savedCards && savedCards.length > 0 && (
        <div className="px-3 pb-2">
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Payment Method
            </p>
            <div className="space-y-1">
              {savedCards.map((card) => (
                <label
                  key={card.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={selectedPaymentMethod === card.id}
                    onChange={() => onSelectPaymentMethod?.(card.id)}
                    className="w-3 h-3 text-primary accent-primary"
                  />
                  <IoCard
                    size={14}
                    className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="capitalize">{card.brand}</span>{' '}
                    ****{card.last4}{' '}
                    <span className="text-gray-400">
                      ({String(card.expMonth).padStart(2, '0')}/
                      {String(card.expYear).slice(-2)})
                    </span>
                  </span>
                </label>
              ))}
              <label className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="radio"
                  name="payment-method"
                  checked={selectedPaymentMethod === null}
                  onChange={() => onSelectPaymentMethod?.(null)}
                  className="w-3 h-3 text-primary accent-primary"
                />
                <IoCard
                  size={14}
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Use a new card
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button
          onClick={onPay}
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Preparing payment...' : 'Pay Now'}
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Go Back
          </button>
        )}
        {onExplore && (
          <button
            onClick={onExplore}
            className="w-full text-[11px] text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Want to explore other cars?
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Helper components ────────────────────────────────────────────── */

function Row({
  label,
  amount,
  muted,
  discount,
}: {
  label: string
  amount: number
  muted?: boolean
  discount?: boolean
}) {
  const isNegative = amount < 0
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs ${
          discount
            ? 'text-green-600 dark:text-green-400'
            : muted
              ? 'text-gray-400 dark:text-gray-500 italic'
              : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs font-medium ${
          discount
            ? 'text-green-600 dark:text-green-400'
            : muted
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-900 dark:text-white'
        }`}
      >
        {isNegative ? '-' : ''}${Math.abs(amount).toFixed(2)}
      </span>
    </div>
  )
}

function BenefitToggle({
  icon,
  label,
  available,
  applied,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  available: number
  applied: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-primary accent-primary cursor-pointer"
      />
      {icon}
      <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
        {label}
        <span className="text-gray-400 dark:text-gray-500 ml-1">
          (${available.toFixed(2)})
        </span>
      </span>
      {applied > 0 && (
        <span className="text-xs font-medium text-green-600 dark:text-green-400">
          -${applied.toFixed(2)}
        </span>
      )}
    </label>
  )
}
