// app/lib/esg/utils.ts

import {
    ScoreRange,
    ScoreColor,
    FuelEfficiencyRating,
    FraudRiskLevel,
    DataConfidence,
  } from "./types";
  
  // ============================================================================
  // ESG UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Format score for display (87.456 → "87")
   */
  export function formatScore(score: number): string {
    return Math.round(score).toString();
  }
  
  /**
   * Format score with label (87 → "87/100")
   */
  export function formatScoreWithMax(score: number, max: number = 100): string {
    return `${Math.round(score)}/${max}`;
  }
  
  /**
   * Format percentage (0.12 → "12%")
   */
  export function formatPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
  
  /**
   * Format mileage (8420.5 → "8,421 miles")
   */
  export function formatMileage(miles: number): string {
    return `${Math.round(miles).toLocaleString()} miles`;
  }
  
  /**
   * Format CO2 savings (124.567 → "125 kg")
   */
  export function formatCO2(kg: number): string {
    return `${Math.round(kg)} kg`;
  }
  
  /**
   * Format response time in hours (2.4 → "2.4 hours")
   */
  export function formatResponseTime(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours.toFixed(1)} hours`;
  }
  
  /**
   * Get score range category
   */
  export function getScoreRange(score: number): ScoreRange {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "fair";
    return "poor";
  }
  
  /**
   * Get score color for UI styling
   */
  export function getScoreColor(score: number): ScoreColor {
    if (score >= 85) return "green";
    if (score >= 70) return "yellow";
    if (score >= 50) return "orange";
    return "red";
  }
  
  /**
   * Get score label text
   */
  export function getScoreLabel(score: number): string {
    if (score >= 90) return "Outstanding";
    if (score >= 85) return "Excellent";
    if (score >= 75) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Above Average";
    if (score >= 50) return "Average";
    if (score >= 40) return "Below Average";
    return "Needs Improvement";
  }
  
  /**
   * Get Tailwind CSS color classes for score
   */
  export function getScoreColorClasses(score: number): {
    bg: string;
    text: string;
    border: string;
  } {
    const color = getScoreColor(score);
  
    switch (color) {
      case "green":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "yellow":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
        };
      case "orange":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
        };
      case "red":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
        };
    }
  }
  
  /**
   * Get progress bar color classes
   */
  export function getProgressBarColor(score: number): string {
    const color = getScoreColor(score);
  
    switch (color) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "orange":
        return "bg-orange-500";
      case "red":
        return "bg-red-500";
    }
  }
  
  /**
   * Get fuel efficiency label
   */
  export function getFuelEfficiencyLabel(
    rating: FuelEfficiencyRating
  ): string {
    switch (rating) {
      case FuelEfficiencyRating.EXCELLENT:
        return "Excellent";
      case FuelEfficiencyRating.GOOD:
        return "Good";
      case FuelEfficiencyRating.FAIR:
        return "Fair";
      case FuelEfficiencyRating.POOR:
        return "Poor";
      case FuelEfficiencyRating.UNKNOWN:
        return "Unknown";
    }
  }
  
  /**
   * Get fraud risk level label
   */
  export function getFraudRiskLabel(level: FraudRiskLevel): string {
    switch (level) {
      case FraudRiskLevel.LOW:
        return "Low Risk";
      case FraudRiskLevel.MEDIUM:
        return "Medium Risk";
      case FraudRiskLevel.HIGH:
        return "High Risk";
      case FraudRiskLevel.CRITICAL:
        return "Critical Risk";
    }
  }
  
  /**
   * Get fraud risk color
   */
  export function getFraudRiskColor(level: FraudRiskLevel): ScoreColor {
    switch (level) {
      case FraudRiskLevel.LOW:
        return "green";
      case FraudRiskLevel.MEDIUM:
        return "yellow";
      case FraudRiskLevel.HIGH:
        return "orange";
      case FraudRiskLevel.CRITICAL:
        return "red";
    }
  }
  
  /**
   * Get data confidence label
   */
  export function getDataConfidenceLabel(confidence: DataConfidence): string {
    switch (confidence) {
      case DataConfidence.HIGH:
        return "High Confidence";
      case DataConfidence.MEDIUM:
        return "Medium Confidence";
      case DataConfidence.LOW:
        return "Low Confidence";
    }
  }
  
  /**
   * Calculate percentile rank (0-100)
   * Used for comparing host to platform average
   */
  export function calculatePercentile(
    hostScore: number,
    allScores: number[]
  ): number {
    if (allScores.length === 0) return 50; // Default to 50th percentile
  
    const sorted = [...allScores].sort((a, b) => a - b);
    const belowCount = sorted.filter((s) => s < hostScore).length;
  
    return Math.round((belowCount / sorted.length) * 100);
  }
  
  /**
   * Get improvement recommendations based on scores
   */
  export function getImprovementRecommendations(scores: {
    safety: number;
    drivingImpact: number;
    emissions: number;
    maintenance: number;
    compliance: number;
  }): string[] {
    const recommendations: string[] = [];
  
    // Safety recommendations
    if (scores.safety < 85) {
      recommendations.push("Continue building your incident-free streak");
      recommendations.push("Review safety best practices before each trip");
    }
  
    // Driving recommendations
    if (scores.drivingImpact < 85) {
      recommendations.push("Monitor trip completion rates closely");
      recommendations.push("Reduce idle time between bookings");
    }
  
    // Environmental recommendations
    if (scores.emissions < 85) {
      recommendations.push("Consider adding electric vehicles to your fleet");
      recommendations.push("Promote eco-friendly driving practices");
    }
  
    // Maintenance recommendations
    if (scores.maintenance < 85) {
      recommendations.push("Stay on top of scheduled maintenance");
      recommendations.push("Keep detailed service records up to date");
    }
  
    // Compliance recommendations
    if (scores.compliance < 85) {
      recommendations.push("Respond to claims promptly");
      recommendations.push("Ensure all documentation is complete");
    }
  
    // If all scores are excellent
    if (recommendations.length === 0) {
      recommendations.push("Excellent work! Maintain your current standards");
      recommendations.push("Consider mentoring other hosts on the platform");
    }
  
    return recommendations;
  }
  
  /**
   * Format date for display
   */
  export function formatDate(date: Date | null): string {
    if (!date) return "Never";
  
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  
  /**
   * Format timestamp for reports
   */
  export function formatTimestamp(date: Date): string {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }
  
  /**
   * Clamp score between 0-100
   */
  export function clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate weighted average
   */
  export function calculateWeightedAverage(
    values: number[],
    weights: number[]
  ): number {
    if (values.length !== weights.length) {
      throw new Error("Values and weights arrays must have same length");
    }
  
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const weightedSum = values.reduce(
      (sum, val, idx) => sum + val * weights[idx],
      0
    );
  
    return weightedSum / totalWeight;
  }
  
  /**
   * Get badge icon emoji
   */
  export function getBadgeIcon(badgeCode: string): string {
    const icons: Record<string, string> = {
      SAFETY_CHAMPION: "🛡️",
      ECO_WARRIOR: "🌱",
      PERFECT_COMPLIANCE: "⭐",
      MAINTENANCE_PRO: "🔧",
      GOLD_HOST: "🏆",
      VETERAN_HOST: "👑",
      STREAK_MASTER: "🔥",
      ZERO_CLAIMS: "💎",
    };
  
    return icons[badgeCode] || "🏅";
  }
  
  /**
   * Get badge rarity color
   */
  export function getBadgeRarityColor(rarity: string): string {
    switch (rarity) {
      case "COMMON":
        return "text-gray-600";
      case "RARE":
        return "text-blue-600";
      case "EPIC":
        return "text-purple-600";
      case "LEGENDARY":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  }
  
  /**
   * Check if date is within last N days
   */
  export function isWithinLastDays(date: Date | null, days: number): boolean {
    if (!date) return false;
  
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
    return diffDays <= days;
  }
  
  /**
   * Generate score trend indicator (↑↓→)
   */
  export function getScoreTrend(
    currentScore: number,
    previousScore: number
  ): { direction: "up" | "down" | "stable"; icon: string } {
    const diff = currentScore - previousScore;
  
    if (diff > 2) {
      return { direction: "up", icon: "↑" };
    } else if (diff < -2) {
      return { direction: "down", icon: "↓" };
    } else {
      return { direction: "stable", icon: "→" };
    }
  }