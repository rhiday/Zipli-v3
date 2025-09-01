import { impactCalculator } from '@/lib/impact-calculator';
import type { DonationWithFoodItem } from '@/store';

// Types for dashboard data
export interface DashboardMetrics {
  totalWeight: number;
  portionsOffered: number;
  savedCosts: number;
  emissionReduction: number;
  co2Avoided: number;
  peopleHelped: number;
  mealsProvided: number;
  foodValueSaved: number;
  socialValue: number;
  successRate: number;
}

export interface ReceiverMetrics {
  totalPeople: number;
  activeRequests: number;
  fulfilledRequests: number;
  estimatedKg: number;
  fulfillmentRate: number;
}

export interface CityMetrics {
  totalDonations: number;
  totalRequests: number;
  activeDonors: number;
  activeReceivers: number;
  totalFoodRedistributed: number;
  partnerOrganizations: number;
  wasteReduction: number;
  co2Savings: number;
}

// Constants for calculations
const KG_PER_PERSON = 0.5;
const DISPOSAL_COST_PER_KG = 2.0;
const CO2_PER_KG = 2.5;

/**
 * Calculate donor dashboard metrics from user donations
 */
export function calculateDonorMetrics(
  donations: DonationWithFoodItem[]
): DashboardMetrics {
  // Transform donations to match impact calculator interface
  const transformedDonations = donations.map((d) => ({
    ...d,
    status: d.status as 'available' | 'claimed' | 'picked_up' | 'cancelled',
    food_item: d.food_item
      ? {
          name: d.food_item.food_type || 'Unknown',
          weight_kg: d.food_item.quantity || 0, // Use quantity as weight_kg
          created_at: d.food_item.created_at,
          category: d.food_item.category || 'general',
        }
      : {
          name: 'Unknown',
          weight_kg: 0,
          created_at: d.created_at,
          category: 'general',
        },
  }));

  const metrics = impactCalculator.calculateImpact(transformedDonations);

  return {
    totalWeight: metrics.totalWeight,
    portionsOffered: metrics.totalPortions,
    savedCosts: metrics.costSavings,
    emissionReduction: metrics.successRate, // Use success rate as emission reduction %
    co2Avoided: metrics.co2Avoided,
    peopleHelped: metrics.peopleHelped,
    mealsProvided: metrics.mealsProvided,
    foodValueSaved: metrics.foodValueSaved,
    socialValue: metrics.socialValue,
    successRate: metrics.successRate,
  };
}

/**
 * Calculate receiver dashboard metrics from user requests
 */
export function calculateReceiverMetrics(requests: any[]): ReceiverMetrics {
  const totalPeople = requests.reduce(
    (sum, req) => sum + (req.people_count || 0),
    0
  );
  const activeRequests = requests.filter((r) => r.status === 'active').length;
  const fulfilledRequests = requests.filter(
    (r) => r.status === 'fulfilled'
  ).length;
  const estimatedKg = Math.round(totalPeople * KG_PER_PERSON);

  const totalRequests = activeRequests + fulfilledRequests;
  const fulfillmentRate =
    totalRequests > 0
      ? Math.round((fulfilledRequests / totalRequests) * 100)
      : 0;

  return {
    totalPeople,
    activeRequests,
    fulfilledRequests,
    estimatedKg,
    fulfillmentRate,
  };
}

/**
 * Calculate city-wide dashboard metrics
 */
export function calculateCityMetrics(
  allDonations: DonationWithFoodItem[],
  allRequests: any[],
  profiles: any[] = []
): CityMetrics {
  const totalWeight = allDonations.reduce(
    (sum, d) => sum + (d.food_item?.quantity || 0),
    0
  );
  const totalPeople = allRequests.reduce(
    (sum, r) => sum + (r.people_count || 0),
    0
  );

  // Count unique users
  const donorIds = new Set(allDonations.map((d) => d.donor_id));
  const receiverIds = new Set(allRequests.map((r) => r.user_id));

  // Calculate environmental impact
  const co2Savings = Math.round(totalWeight * CO2_PER_KG);
  const pickedUp = allDonations.filter((d) => d.status === 'claimed');
  const wasteReduction =
    allDonations.length > 0
      ? Math.round((pickedUp.length / allDonations.length) * 100)
      : 0;

  return {
    totalDonations: allDonations.length,
    totalRequests: allRequests.length,
    activeDonors: donorIds.size,
    activeReceivers: receiverIds.size,
    totalFoodRedistributed: totalWeight,
    partnerOrganizations: donorIds.size + receiverIds.size, // Approximate
    wasteReduction,
    co2Savings,
  };
}

/**
 * Calculate recipients data from actual donations/matches
 */
export function calculateRecipientsData(
  userDonations: DonationWithFoodItem[],
  allRequests: any[] = []
) {
  // Get unique recipients who claimed this user's donations
  const recipientIds = new Set(
    userDonations
      .filter((d) => d.status === 'claimed')
      .map((d) => d.receiver_id)
      .filter(Boolean)
  );

  // Match with request data to get recipient names
  const recipients = Array.from(recipientIds).map((receiverId) => {
    const userRequests = allRequests.filter((r) => r.user_id === receiverId);
    const totalWeight = userDonations
      .filter((d) => d.receiver_id === receiverId)
      .reduce((sum, d) => sum + (d.food_item?.quantity || 0), 0);

    return {
      id: receiverId,
      name: userRequests[0]?.organization_name || 'Recipient Organization',
      info: `${Math.round(totalWeight * 10) / 10}kg · Various foods`,
      avatar: { type: 'placeholder', color: 'gray' },
    };
  });

  // If no real recipients, return default placeholders for demo
  if (recipients.length === 0) {
    return [
      {
        id: 1,
        name: 'Red Cross',
        info: 'No claims yet',
        avatar: { type: 'icon', color: 'rose', icon: '+' },
      },
      {
        id: 2,
        name: 'Local Food Bank',
        info: 'No claims yet',
        avatar: { type: 'placeholder', color: 'gray' },
      },
    ];
  }

  return recipients;
}

/**
 * Format weight for display
 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${Math.round(kg / 100) / 10}t`;
  }
  return `${Math.round(kg * 10) / 10}kg`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `${Math.round(amount)}€`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
