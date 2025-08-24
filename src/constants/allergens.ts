/**
 * Comprehensive allergens and dietary restrictions list
 * Based on EU food labeling requirements and common dietary needs
 */

// Allergen keys mapped to translation keys
export const ALLERGEN_TRANSLATION_KEYS = [
  { key: 'allergens.glutenFree', fallback: 'Gluten-free' },
  { key: 'allergens.lactoseFree', fallback: 'Lactose-free' },
  { key: 'allergens.lowLactose', fallback: 'Low-lactose' },
  { key: 'allergens.eggFree', fallback: 'Egg-free' },
  { key: 'allergens.soyFree', fallback: 'Soy-free' },
  {
    key: 'allergens.doesNotContainPeanuts',
    fallback: 'Does not contain peanuts',
  },
  {
    key: 'allergens.doesNotContainOtherNuts',
    fallback: 'Does not contain other nuts',
  },
  { key: 'allergens.doesNotContainFish', fallback: 'Does not contain fish' },
  {
    key: 'allergens.doesNotContainCrustaceans',
    fallback: 'Does not contain crustaceans',
  },
  {
    key: 'allergens.doesNotContainCelery',
    fallback: 'Does not contain celery',
  },
  {
    key: 'allergens.doesNotContainMustard',
    fallback: 'Does not contain mustard',
  },
  {
    key: 'allergens.doesNotContainSesameSeeds',
    fallback: 'Does not contain sesame seeds',
  },
  {
    key: 'allergens.doesNotContainSulphurDioxide',
    fallback: 'Does not contain sulphur dioxide / sulphites >10 mg/kg or litre',
  },
  { key: 'allergens.doesNotContainLupin', fallback: 'Does not contain lupin' },
  {
    key: 'allergens.doesNotContainMolluscs',
    fallback: 'Does not contain molluscs',
  },
];

// Legacy: Static list for backwards compatibility
export const ALLERGENS_AND_DIETARY_OPTIONS = [
  'Gluten-free',
  'Lactose-free',
  'Low-lactose',
  'Egg-free',
  'Soy-free',
  'Does not contain peanuts',
  'Does not contain other nuts',
  'Does not contain fish',
  'Does not contain crustaceans',
  'Does not contain celery',
  'Does not contain mustard',
  'Does not contain sesame seeds',
  'Does not contain sulphur dioxide / sulphites >10 mg/kg or litre',
  'Does not contain lupin',
  'Does not contain molluscs',
];

export const LEGACY_ALLERGENS = [
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree nuts',
  'Peanuts',
  'Wheat',
  'Soybeans',
  'Vegan',
  'Vegetarian',
  'Gluten-free',
  'Halal',
  'Kosher',
  'Low-lactose',
];
