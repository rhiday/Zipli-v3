// Simple impact calculator for demo purposes
// Returns static/mock data for a stable demo experience

export interface Donation {
  id: string;
  food_item: {
    name: string;
    weight_kg: number;
    created_at: string;
    category: string;
  };
  status: 'available' | 'requested' | 'picked_up' | 'expired';
  created_at: string;
  picked_up_at?: string;
  donor_id: string;
}

export interface ImpactMetrics {
  totalWeight: number;
  totalPortions: number;
  costSavings: number;
  co2Avoided: number;
  co2AvoidedTons: number;
  peopleHelped: number;
  mealsProvided: number;
  foodValueSaved: number;
  socialValue: number;
  environmentalScore: number;
  successRate: number;
  averageDaysToPickup: number;
  wasteReductionRate: number;
  averageWeight: number;
}

export interface TrendData {
  period: string;
  donations: number;
  weight: number;
  co2: number;
  cost: number;
}

export const impactCalculator = {
  calculateImpact: (
    donations: Donation[],
    periodDays: number = 0
  ): ImpactMetrics => {
    // For demo, return static values
    return {
      totalWeight: 46,
      totalPortions: 131,
      costSavings: 125,
      co2Avoided: 10000, // kg
      co2AvoidedTons: 10, // tons
      peopleHelped: 43,
      mealsProvided: 131,
      foodValueSaved: 280,
      socialValue: 450,
      environmentalScore: 92,
      successRate: 94,
      averageDaysToPickup: 2,
      wasteReductionRate: 87,
      averageWeight: 3.2,
    };
  },

  calculateTrends: (donations: Donation[], months: string[]): TrendData[] => {
    // Return static trend data for demo
    return [
      { period: 'Jan', donations: 3, weight: 8, co2: 2, cost: 20 },
      { period: 'Feb', donations: 5, weight: 12, co2: 3, cost: 30 },
      { period: 'Mar', donations: 4, weight: 10, co2: 2.5, cost: 25 },
      { period: 'Apr', donations: 7, weight: 18, co2: 4, cost: 45 },
      { period: 'May', donations: 6, weight: 15, co2: 3.5, cost: 37 },
      { period: 'Jun', donations: 8, weight: 21, co2: 5, cost: 52 },
    ];
  },

  getBenchmarks: (metrics: ImpactMetrics) => {
    return {
      co2Equivalent: `Equivalent to ${Math.round(metrics.co2Avoided / 100)} trees planted`,
      distanceEquivalent: `Equal to driving ${Math.round(metrics.co2Avoided / 0.2)} fewer km`,
      waterSaved: `${Math.round(metrics.totalWeight * 125)} liters of water saved`,
    };
  },
};

export const generateRealisticMockData = (count: number): Donation[] => {
  const mockData: Donation[] = [];
  const foodTypes = [
    'Bread',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Prepared meals',
  ];
  const categories = ['bakery', 'produce', 'dairy', 'prepared', 'mixed'];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const createdAt = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();
    const pickedUpDaysLater =
      Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : undefined;

    mockData.push({
      id: `mock-${i}`,
      food_item: {
        name: foodTypes[Math.floor(Math.random() * foodTypes.length)],
        weight_kg: Math.round((Math.random() * 8 + 2) * 10) / 10,
        created_at: createdAt,
        category: categories[Math.floor(Math.random() * categories.length)],
      },
      status: pickedUpDaysLater ? 'picked_up' : 'available',
      created_at: createdAt,
      picked_up_at: pickedUpDaysLater
        ? new Date(
            new Date(createdAt).getTime() +
              pickedUpDaysLater * 24 * 60 * 60 * 1000
          ).toISOString()
        : undefined,
      donor_id: 'demo-user',
    });
  }

  return mockData;
};
