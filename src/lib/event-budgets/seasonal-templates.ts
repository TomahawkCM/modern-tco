/**
 * Seasonal Budget Templates
 *
 * Pre-defined event budget templates that are suggested based on the current
 * time of year. Templates are code-defined (no DB), and creating from a template
 * produces an EventBudget via the event budget engine.
 */

import type { EventBudget } from '@/types/budget';
import { createEventBudget } from './event-budget-engine';

export interface SeasonalTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Months when this template is relevant (1-12) */
  relevantMonths: number[];
  /** Default duration in days */
  defaultDurationDays: number;
  categories: Array<{ categoryName: string; defaultBudget: number }>;
}

export const SEASONAL_TEMPLATES: SeasonalTemplate[] = [
  {
    id: 'holiday_season',
    name: 'Holiday Season',
    description: 'Plan for holiday gifts, decorations, travel, and entertaining',
    icon: 'gift',
    color: '#dc2626',
    relevantMonths: [10, 11, 12],
    defaultDurationDays: 60,
    categories: [
      { categoryName: 'Gifts', defaultBudget: 500 },
      { categoryName: 'Decorations', defaultBudget: 150 },
      { categoryName: 'Travel', defaultBudget: 800 },
      { categoryName: 'Food & Entertainment', defaultBudget: 400 },
      { categoryName: 'Holiday Entertainment', defaultBudget: 200 },
    ],
  },
  {
    id: 'tax_season',
    name: 'Tax Season',
    description: 'Budget for tax preparation, software, and professional fees',
    icon: 'calculator',
    color: '#2563eb',
    relevantMonths: [1, 2, 3, 4],
    defaultDurationDays: 120,
    categories: [
      { categoryName: 'Tax Preparation', defaultBudget: 300 },
      { categoryName: 'Professional Fees', defaultBudget: 500 },
      { categoryName: 'Tax Software', defaultBudget: 50 },
    ],
  },
  {
    id: 'summer_travel',
    name: 'Summer Travel',
    description: 'Plan your summer vacation budget',
    icon: 'sun',
    color: '#f59e0b',
    relevantMonths: [4, 5, 6, 7, 8],
    defaultDurationDays: 90,
    categories: [
      { categoryName: 'Flights', defaultBudget: 1200 },
      { categoryName: 'Hotels', defaultBudget: 1500 },
      { categoryName: 'Activities', defaultBudget: 500 },
      { categoryName: 'Dining', defaultBudget: 600 },
      { categoryName: 'Transport', defaultBudget: 300 },
    ],
  },
  {
    id: 'back_to_school',
    name: 'Back to School',
    description: 'Supplies, clothing, and tech for the new school year',
    icon: 'backpack',
    color: '#7c3aed',
    relevantMonths: [7, 8, 9],
    defaultDurationDays: 60,
    categories: [
      { categoryName: 'Supplies', defaultBudget: 200 },
      { categoryName: 'Clothes', defaultBudget: 400 },
      { categoryName: 'Tech', defaultBudget: 600 },
      { categoryName: 'Extracurriculars', defaultBudget: 300 },
    ],
  },
  {
    id: 'home_improvement',
    name: 'Home Improvement',
    description: 'Spring renovation and home improvement projects',
    icon: 'hammer',
    color: '#059669',
    relevantMonths: [3, 4, 5, 6],
    defaultDurationDays: 90,
    categories: [
      { categoryName: 'Materials', defaultBudget: 2000 },
      { categoryName: 'Contractors', defaultBudget: 5000 },
      { categoryName: 'Permits', defaultBudget: 200 },
      { categoryName: 'Furniture', defaultBudget: 1500 },
    ],
  },
  {
    id: 'wedding_event',
    name: 'Wedding / Major Event',
    description: 'Plan a wedding or large celebration',
    icon: 'heart',
    color: '#ec4899',
    relevantMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Always relevant
    defaultDurationDays: 180,
    categories: [
      { categoryName: 'Venue', defaultBudget: 5000 },
      { categoryName: 'Catering', defaultBudget: 3000 },
      { categoryName: 'Attire', defaultBudget: 1500 },
      { categoryName: 'Photography', defaultBudget: 2000 },
      { categoryName: 'Miscellaneous', defaultBudget: 1000 },
    ],
  },
];

/**
 * Get templates relevant to the current (or specified) month.
 */
export function getRelevantTemplates(currentMonth?: number): SeasonalTemplate[] {
  const month = currentMonth ?? new Date().getMonth() + 1;
  return SEASONAL_TEMPLATES.filter((t) => t.relevantMonths.includes(month));
}

/**
 * Create an event budget from a template.
 *
 * @param templateId Template ID
 * @param overrides Optional overrides for the event budget fields
 * @returns The created EventBudget
 */
export async function createFromTemplate(
  templateId: string,
  overrides?: Partial<Pick<EventBudget, 'name' | 'description' | 'startDate' | 'endDate' | 'totalBudget' | 'currency'>>
): Promise<EventBudget> {
  const template = SEASONAL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const now = new Date();
  const startDate = overrides?.startDate ?? now;
  const endDate =
    overrides?.endDate ??
    new Date(now.getTime() + template.defaultDurationDays * 24 * 60 * 60 * 1000);

  const totalBudget =
    overrides?.totalBudget ??
    template.categories.reduce((sum, c) => sum + c.defaultBudget, 0);

  const eventBudget = await createEventBudget(
    {
      name: overrides?.name ?? template.name,
      description: overrides?.description ?? template.description,
      status: 'planning',
      totalBudget,
      currency: overrides?.currency ?? 'USD',
      startDate,
      endDate,
      icon: template.icon,
      color: template.color,
      templateId: template.id,
    },
    template.categories.map((c) => ({
      categoryName: c.categoryName,
      budgeted: c.defaultBudget,
    }))
  );

  return eventBudget;
}
