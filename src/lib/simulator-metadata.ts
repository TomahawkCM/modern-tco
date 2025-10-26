import fs from 'fs/promises';
import path from 'path';

const SIM_DIR = path.join(process.cwd(), 'sim');
const SENSORS_PATH = path.join(SIM_DIR, 'sensors_catalog.json');
const EXAMPLES_PATH = path.join(SIM_DIR, 'unit_tests.json');

type SensorEntry = {
  name: string;
  category: string;
  description?: string;
};

type SimulatorExamples = {
  examples: Array<{
    id: string;
    title: string;
    question: string;
    domain?: string;
    difficulty?: number;
  }>;
};

export async function getSensorsCatalog(): Promise<{ sensors: SensorEntry[]; aggregates: string[] }> {
  try {
    const raw = await fs.readFile(SENSORS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return { sensors: [], aggregates: [] };
  }
}

export async function getSimulatorExamples(): Promise<SimulatorExamples> {
  try {
    const raw = await fs.readFile(EXAMPLES_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return { examples: [] };
  }
}
