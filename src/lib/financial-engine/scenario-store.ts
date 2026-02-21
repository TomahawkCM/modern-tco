/**
 * Calculator Scenario Save/Load System
 *
 * Generalized version of debt-scenario-db.ts pattern.
 * CRUD operations for any calculator type via Dexie IndexedDB.
 */

import Dexie, { type Table } from "dexie";
import type { AssumptionSet } from "./types";

// ==========================================
// Types
// ==========================================

export type CalculatorType =
  | "compound-interest"
  | "mortgage"
  | "inflation"
  | "retirement"
  | "savings-goal"
  | "debt-payoff"
  | "emergency-fund";

export interface CalculatorScenario {
  id?: number;
  calculatorType: CalculatorType;
  name: string;
  input: Record<string, unknown>;
  assumptions?: Partial<AssumptionSet>;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Database
// ==========================================

class ScenarioDatabase extends Dexie {
  scenarios!: Table<CalculatorScenario>;

  constructor() {
    super("CalculatorScenarios");

    this.version(1).stores({
      scenarios: "++id, calculatorType, name, createdAt, updatedAt",
    });
  }
}

let _db: ScenarioDatabase | null = null;

function getDB(): ScenarioDatabase {
  if (typeof window === "undefined") {
    throw new Error("ScenarioDatabase is only available in the browser.");
  }
  _db ??= new ScenarioDatabase();
  return _db;
}

// ==========================================
// CRUD Operations
// ==========================================

/**
 * Save a new scenario.
 */
export async function saveScenario(
  scenario: Omit<CalculatorScenario, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const now = new Date();
  const id: number = (await getDB().scenarios.add({
    ...scenario,
    createdAt: now,
    updatedAt: now,
  })) as number;
  return id;
}

/**
 * Update an existing scenario.
 */
export async function updateScenario(
  id: number,
  updates: Partial<Omit<CalculatorScenario, "id" | "createdAt">>
): Promise<void> {
  await getDB().scenarios.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Get all scenarios for a specific calculator type.
 */
export async function getScenarios(calculatorType: CalculatorType): Promise<CalculatorScenario[]> {
  return getDB()
    .scenarios.where("calculatorType")
    .equals(calculatorType)
    .reverse()
    .sortBy("createdAt");
}

/**
 * Get all scenarios across all calculator types.
 */
export async function getAllScenarios(): Promise<CalculatorScenario[]> {
  return getDB().scenarios.orderBy("updatedAt").reverse().toArray();
}

/**
 * Get a single scenario by ID.
 */
export async function getScenarioById(id: number): Promise<CalculatorScenario | undefined> {
  return getDB().scenarios.get(id);
}

/**
 * Delete a scenario by ID.
 */
export async function deleteScenario(id: number): Promise<void> {
  await getDB().scenarios.delete(id);
}

/**
 * Delete all scenarios for a specific calculator type.
 */
export async function deleteScenariosByType(calculatorType: CalculatorType): Promise<void> {
  await getDB().scenarios.where("calculatorType").equals(calculatorType).delete();
}

/**
 * Count scenarios for a calculator type.
 */
export async function countScenarios(calculatorType: CalculatorType): Promise<number> {
  return getDB().scenarios.where("calculatorType").equals(calculatorType).count();
}
