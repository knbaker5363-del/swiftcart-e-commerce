/**
 * Weighted Random Selection Utility
 * Selects an item from an array based on weights
 */

interface WeightedItem {
  id: string;
  weight: number;
}

/**
 * Performs weighted random selection
 * @param items Array of items with weight property
 * @returns Selected item or null if empty
 */
export function weightedRandomSelection<T extends WeightedItem>(items: T[]): T | null {
  if (!items || items.length === 0) return null;
  if (items.length === 1) return items[0];

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 100), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= (item.weight || 100);
    if (random <= 0) return item;
  }

  return items[0];
}

/**
 * Calculates the probability percentage for each item
 * @param items Array of items with weight property
 * @returns Array of items with added probability field
 */
export function calculateProbabilities<T extends WeightedItem>(
  items: T[]
): (T & { probability: number })[] {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 100), 0);
  
  return items.map(item => ({
    ...item,
    probability: totalWeight > 0 ? ((item.weight || 100) / totalWeight) * 100 : 0
  }));
}
