// Impact calculator
// Computes metrics based on real donation data

export interface Donation {
  id: string;
  food_item: {
    name: string;
    weight_kg: number;
    created_at: string;
    category: string;
  };
  status: 'available' | 'claimed' | 'picked_up' | 'cancelled';
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
    // Coefficients (can be tuned or made configurable later)
    const KG_PER_MEAL = 0.5; // 0.5 kg per meal (matches receiver dashboard estimate)
    const CO2_PER_KG = 2.5; // kg CO2e avoided per kg of food rescued (approx.)
    const DISPOSAL_COST_PER_KG_EUR = 2.0; // € saved per kg not disposed
    const FOOD_VALUE_PER_KG_EUR = 3.5; // € value of food per kg
    const SOCIAL_VALUE_PER_MEAL_EUR = 1.5; // € social value per meal

    const totalWeight = donations.reduce(
      (sum, d) => sum + (d.food_item?.weight_kg || 0),
      0
    );

    const pickedUp = donations.filter((d) => d.status === 'claimed');
    const successRate = donations.length
      ? Math.round((pickedUp.length / donations.length) * 100)
      : 0;

    const averageWeight = donations.length
      ? parseFloat((totalWeight / donations.length).toFixed(1))
      : 0;

    const averageDaysToPickup = pickedUp.length
      ? (() => {
          const totalDays = pickedUp.reduce((sum, d) => {
            const created = new Date(d.created_at).getTime();
            const picked = d.picked_up_at
              ? new Date(d.picked_up_at).getTime()
              : created;
            const days = Math.max(
              0,
              (picked - created) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0);
          return Math.round((totalDays / pickedUp.length) * 10) / 10;
        })()
      : 0;

    const totalPortions = Math.round(totalWeight / KG_PER_MEAL);
    const mealsProvided = totalPortions;
    const peopleHelped = mealsProvided; // Assume 1 portion ≈ 1 meal/person

    const co2Avoided = Math.round(totalWeight * CO2_PER_KG);
    const co2AvoidedTons = Math.round((co2Avoided / 1000) * 10) / 10; // 1 decimal ton

    const costSavings = Math.round(totalWeight * DISPOSAL_COST_PER_KG_EUR);
    const foodValueSaved = Math.round(totalWeight * FOOD_VALUE_PER_KG_EUR);
    const socialValue = Math.round(mealsProvided * SOCIAL_VALUE_PER_MEAL_EUR);

    // Simple environmental score combining success and CO2 per kg rescued
    const environmentalScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(successRate * 0.6 + Math.min(40, co2AvoidedTons))
      )
    );

    // For now, approximate waste reduction as success rate within period
    const wasteReductionRate = successRate;

    return {
      totalWeight: Math.round(totalWeight * 10) / 10,
      totalPortions,
      costSavings,
      co2Avoided,
      co2AvoidedTons,
      peopleHelped,
      mealsProvided,
      foodValueSaved,
      socialValue,
      environmentalScore,
      successRate,
      averageDaysToPickup,
      wasteReductionRate,
      averageWeight,
    };
  },

  calculateTrends: (donations: Donation[], months: string[]): TrendData[] => {
    const CO2_PER_KG = 2.5;
    const DISPOSAL_COST_PER_KG_EUR = 2.0;

    // Build map from month short label (e.g., "Jan") to aggregates
    const monthAgg: Record<string, { donations: number; weight: number }> = {};
    donations.forEach((d) => {
      const dt = new Date(d.created_at);
      const label = dt.toLocaleString('en-US', { month: 'short' });
      if (!monthAgg[label]) monthAgg[label] = { donations: 0, weight: 0 };
      monthAgg[label].donations += 1;
      monthAgg[label].weight += d.food_item?.weight_kg || 0;
    });

    const result = months.map((m) => {
      const agg = monthAgg[m] || { donations: 0, weight: 0 };
      const weightRounded = Math.round(agg.weight * 10) / 10;
      return {
        period: m,
        donations: agg.donations,
        weight: weightRounded,
        co2: Math.round(weightRounded * CO2_PER_KG * 10) / 10,
        cost: Math.round(weightRounded * DISPOSAL_COST_PER_KG_EUR),
      };
    });

    return result;
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
      status: pickedUpDaysLater ? 'claimed' : 'available',
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
