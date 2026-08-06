// Core Abstraction Engine for Footprint
// Every real-world emission-producing activity is represented as one uniform concept: EmissionSource

export type EmissionCategory = 'TRANSPORT' | 'ENERGY' | 'FOOD' | 'WASTE';

export interface EmissionFactor {
  id: string;
  category: EmissionCategory;
  activity_type: string;
  activity_label: string;
  factor_value: number; // kg CO2e per unit
  factor_unit: string;  // km, kWh, kg, etc.
  source_reference?: string;
  effective_date?: string;
}

export interface EmissionSource {
  id: string;
  user_id: string;
  category: EmissionCategory;
  activity_type: string;
  activity_label?: string;
  quantity: number;
  unit: string;
  co2e_kg: number;
  logged_at: string;
}

export interface CarbonReport {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  total_emissions_kg: number;
  pdf_path?: string;
  generated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

// Starter fallback factors matching SQL schema
export const DEFAULT_EMISSION_FACTORS: EmissionFactor[] = [
  // Transport (per km)
  { id: 'f-1', category: 'TRANSPORT', activity_type: 'petrol_car', activity_label: 'Petrol Car', factor_value: 0.192, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  { id: 'f-2', category: 'TRANSPORT', activity_type: 'diesel_car', activity_label: 'Diesel Car', factor_value: 0.171, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  { id: 'f-3', category: 'TRANSPORT', activity_type: 'electric_car', activity_label: 'Electric Car', factor_value: 0.053, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  { id: 'f-4', category: 'TRANSPORT', activity_type: 'motorbike', activity_label: 'Motorbike', factor_value: 0.103, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  { id: 'f-5', category: 'TRANSPORT', activity_type: 'bus', activity_label: 'Bus', factor_value: 0.089, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  { id: 'f-6', category: 'TRANSPORT', activity_type: 'train', activity_label: 'Train', factor_value: 0.041, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  { id: 'f-7', category: 'TRANSPORT', activity_type: 'domestic_flight', activity_label: 'Domestic Flight', factor_value: 0.246, factor_unit: 'km', source_reference: 'DEFRA 2023' },
  
  // Energy (per kWh unless LPG)
  { id: 'f-8', category: 'ENERGY', activity_type: 'grid_electricity', activity_label: 'Grid Electricity', factor_value: 0.233, factor_unit: 'kWh', source_reference: 'National Grid / IEA' },
  { id: 'f-9', category: 'ENERGY', activity_type: 'natural_gas', activity_label: 'Natural Gas', factor_value: 0.184, factor_unit: 'kWh', source_reference: 'DEFRA 2023' },
  { id: 'f-10', category: 'ENERGY', activity_type: 'lpg', activity_label: 'LPG', factor_value: 2.983, factor_unit: 'kg', source_reference: 'DEFRA 2023' },
  
  // Food (per kg)
  { id: 'f-11', category: 'FOOD', activity_type: 'beef', activity_label: 'Beef', factor_value: 27.0, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-12', category: 'FOOD', activity_type: 'lamb', activity_label: 'Lamb', factor_value: 21.4, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-13', category: 'FOOD', activity_type: 'pork', activity_label: 'Pork', factor_value: 7.6, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-14', category: 'FOOD', activity_type: 'chicken', activity_label: 'Chicken', factor_value: 6.1, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-15', category: 'FOOD', activity_type: 'fish_seafood', activity_label: 'Fish & Seafood', factor_value: 5.4, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-16', category: 'FOOD', activity_type: 'dairy', activity_label: 'Dairy (Milk, Cheese, Butter)', factor_value: 3.2, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-17', category: 'FOOD', activity_type: 'vegetables_fruit', activity_label: 'Vegetables & Fruit', factor_value: 0.4, factor_unit: 'kg', source_reference: 'Our World in Data' },
  { id: 'f-18', category: 'FOOD', activity_type: 'grains_cereals', activity_label: 'Grains & Cereals', factor_value: 1.4, factor_unit: 'kg', source_reference: 'Our World in Data' },
  
  // Waste (per kg)
  { id: 'f-19', category: 'WASTE', activity_type: 'landfill', activity_label: 'Landfill Waste', factor_value: 0.58, factor_unit: 'kg', source_reference: 'EPA WARM' },
  { id: 'f-20', category: 'WASTE', activity_type: 'recycled', activity_label: 'Recycled Waste', factor_value: 0.02, factor_unit: 'kg', source_reference: 'EPA WARM' },
  { id: 'f-21', category: 'WASTE', activity_type: 'composted', activity_label: 'Composted Waste', factor_value: 0.01, factor_unit: 'kg', source_reference: 'EPA WARM' }
];

/**
 * MANDATORY ABSTRACTION REQUIREMENT 1:
 * All calculation logic lives in one shared function.
 * Looks up matching factor in factorList (or defaults) and multiplies quantity.
 * Returns calculated CO2e in kg.
 */
export function calculateEmissions(
  category: string,
  activityType: string,
  quantity: number,
  factors: EmissionFactor[] = DEFAULT_EMISSION_FACTORS
): { co2e_kg: number; unit: string; activity_label: string } {
  const match = factors.find(
    (f) => f.category === category.toUpperCase() && f.activity_type === activityType
  ) || factors.find((f) => f.activity_type === activityType);

  if (!match) {
    // Graceful fallback multiplication if new activity type added without explicit factor
    return {
      co2e_kg: Number((quantity * 0.1).toFixed(2)),
      unit: 'unit',
      activity_label: activityType.replace(/_/g, ' ')
    };
  }

  const co2e_kg = Number((quantity * match.factor_value).toFixed(2));
  return {
    co2e_kg,
    unit: match.factor_unit,
    activity_label: match.activity_label
  };
}

/**
 * Returns plain-language recommendations tailored to highest emission category
 */
export function getRecommendationForCategory(category?: EmissionCategory | string): {
  title: string;
  tip: string;
  impact: string;
} {
  switch (category?.toUpperCase()) {
    case 'TRANSPORT':
      return {
        title: 'Optimize Transportation Footprint',
        tip: 'Consider replacing 2 short car trips weekly with public transport or cycling, or transition toward an electric vehicle.',
        impact: 'Saves up to 450 kg CO2e annually'
      };
    case 'ENERGY':
      return {
        title: 'Reduce Household Energy Demand',
        tip: 'Lower thermostat setting by 1°C, switch to LED bulbs, or select a green electricity tariff provider.',
        impact: 'Saves up to 320 kg CO2e annually'
      };
    case 'FOOD':
      return {
        title: 'Shift Towards Plant-Rich Meals',
        tip: 'Replacing beef or lamb with poultry or plant-based proteins 3 days a week significantly lowers your dietary footprint.',
        impact: 'Saves up to 520 kg CO2e annually'
      };
    case 'WASTE':
      return {
        title: 'Divert Landfill & Increase Composting',
        tip: 'Compost organic food scraps and maximize household recycling to minimize landfill methane emissions.',
        impact: 'Saves up to 180 kg CO2e annually'
      };
    default:
      return {
        title: 'Balanced Climate Action',
        tip: 'Your emissions are evenly distributed across categories. Logging daily activities helps pinpoint key reduction opportunities.',
        impact: 'Continuous progress'
      };
  }
}

export function getCategoryColor(category: string): string {
  switch (category?.toUpperCase()) {
    case 'TRANSPORT':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'ENERGY':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'FOOD':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'WASTE':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category?.toUpperCase()) {
    case 'TRANSPORT':
      return 'Car';
    case 'ENERGY':
      return 'Zap';
    case 'FOOD':
      return 'Utensils';
    case 'WASTE':
      return 'Trash2';
    default:
      return 'Activity';
  }
}

export const generateSuggestion = getRecommendationForCategory;

