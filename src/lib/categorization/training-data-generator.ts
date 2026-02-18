/**
 * Training Data Generator for ML Categorization
 * Generates synthetic training examples from existing rules
 */

import { CATEGORY_RULES } from "./rules";

export interface TrainingExample {
  text: string;
  category: string;
  subcategory?: string;
}

/**
 * Generate variations of merchant names that match a pattern
 */
function generateVariations(
  pattern: RegExp,
  category: string,
  subcategory?: string
): TrainingExample[] {
  const examples: TrainingExample[] = [];

  // Extract keywords from the regex pattern
  const patternStr = pattern.source.toLowerCase();
  const keywords = patternStr
    .replace(/[\^$|\\()[\]{}*+?.]/g, " ")
    .split("|")
    .map((k) => k.trim())
    .filter((k) => k.length > 2);

  // Generate examples for each keyword
  for (const keyword of keywords) {
    // Base example (just the keyword)
    examples.push({
      text: keyword,
      category,
      subcategory,
    });

    // With transaction prefixes
    examples.push({
      text: `PURCHASE AT ${keyword.toUpperCase()}`,
      category,
      subcategory,
    });

    examples.push({
      text: `${keyword} #1234`,
      category,
      subcategory,
    });

    // With location
    examples.push({
      text: `${keyword} TORONTO ON`,
      category,
      subcategory,
    });

    // Online purchase format
    examples.push({
      text: `ONLINE PURCHASE ${keyword.toUpperCase()}`,
      category,
      subcategory,
    });
  }

  return examples.slice(0, 10); // Limit to 10 examples per rule
}

/**
 * Generate complete training dataset from rules
 */
export function generateTrainingData(): TrainingExample[] {
  const trainingData: TrainingExample[] = [];

  for (const rule of CATEGORY_RULES) {
    const variations = generateVariations(rule.pattern, rule.category, rule.subcategory);
    trainingData.push(...variations);
  }

  return trainingData;
}

/**
 * Split data into training and test sets
 */
export function splitTrainTest(
  data: TrainingExample[],
  testRatio = 0.2
): { train: TrainingExample[]; test: TrainingExample[] } {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  const splitIndex = Math.floor(data.length * (1 - testRatio));

  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex),
  };
}

/**
 * Get unique categories from training data
 */
export function getUniqueCategories(data: TrainingExample[]): string[] {
  const categories = new Set(data.map((d) => d.category));
  return Array.from(categories).sort();
}

/**
 * Convert category to one-hot encoding
 */
export function categoryToOneHot(category: string, allCategories: string[]): number[] {
  const oneHot = new Array(allCategories.length).fill(0);
  const index = allCategories.indexOf(category);
  if (index !== -1) {
    oneHot[index] = 1;
  }
  return oneHot;
}

/**
 * Convert one-hot encoding back to category
 */
export function oneHotToCategory(oneHot: number[], allCategories: string[]): string {
  const maxIndex = oneHot.indexOf(Math.max(...oneHot));
  return allCategories[maxIndex] || "Miscellaneous";
}
