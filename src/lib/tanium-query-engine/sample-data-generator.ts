/**
 * Sample Data Generator for Tanium Query Engine
 * Generates realistic, varied machine data for testing
 */

import type { MachineData } from './types';

const OS_PLATFORMS = [
  { name: 'Windows 11', version: ['22H2', '23H1', '23H2'], weight: 30 },
  { name: 'Windows 10', version: ['21H2', '22H1', '22H2'], weight: 25 },
  { name: 'Windows Server 2022', version: ['2022'], weight: 8 },
  { name: 'Windows Server 2019', version: ['2019'], weight: 8 },
  { name: 'Windows Server 2016', version: ['2016'], weight: 4 },
  { name: 'macOS', version: ['13.6', '14.0', '14.1', '14.2', '14.3', '14.4'], weight: 15 },
  { name: 'Linux', version: ['RHEL 8', 'RHEL 9', 'Ubuntu 22.04', 'Ubuntu 20.04'], weight: 10 }
];

const LOCATIONS = [
  { name: 'NA-US', weight: 40 },
  { name: 'NA-CA', weight: 10 },
  { name: 'EU-DE', weight: 15 },
  { name: 'EU-UK', weight: 12 },
  { name: 'APAC-JP', weight: 10 },
  { name: 'APAC-AU', weight: 8 },
  { name: 'SA-BR', weight: 5 }
];

const GROUPS = [
  { name: 'Laptops', role: 'Workstation', weight: 25 },
  { name: 'Engineering Lab', role: 'Workstation', weight: 15 },
  { name: 'Finance Workstations', role: 'Workstation', weight: 12 },
  { name: 'Operations', role: 'Workstation', weight: 10 },
  { name: 'Sales', role: 'Workstation', weight: 8 },
  { name: 'Marketing', role: 'Workstation', weight: 8 },
  { name: 'HR Systems', role: 'Workstation', weight: 5 },
  { name: 'Executive Suite', role: 'Workstation', weight: 3 },
  { name: 'Data Center Servers', role: 'Server', weight: 8 },
  { name: 'Edge Servers', role: 'Server', weight: 3 },
  { name: 'Development Servers', role: 'Server', weight: 2 },
  { name: 'Canary Cohort', role: 'Workstation', weight: 1 }
];

// Helper to pick weighted random item
function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }

  return items[items.length - 1];
}

// Helper to generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Helper to generate date in past N days
function randomPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
}

/**
 * Generate a single realistic machine
 */
function generateMachine(index: number): MachineData {
  const group = weightedRandom(GROUPS);
  const os = weightedRandom(OS_PLATFORMS);
  const location = weightedRandom(LOCATIONS);
  const isServer = group.role === 'Server';

  // Generate computer name based on type
  let computerName: string;
  if (isServer) {
    const serverTypes = ['API', 'SQL', 'WEB', 'APP', 'FILE', 'DNS', 'DC', 'MAIL', 'LNX'];
    const serverType = serverTypes[Math.floor(Math.random() * serverTypes.length)];
    computerName = `SRV-${serverType}-${String(index).padStart(2, '0')}`;
  } else {
    const prefixes = ['LAPTOP', 'DESKTOP', 'WKS', 'MAC', 'ENG', 'FIN', 'OPS', 'EXEC'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    computerName = `${prefix}-${String(index).padStart(3, '0')}`;
  }

  // Generate realistic specs based on role
  let memory_gb: number;
  let disk_free_gb: number;
  let cpu_percent: number;

  if (isServer) {
    memory_gb = [32, 64, 128, 256][Math.floor(Math.random() * 4)];
    disk_free_gb = randomInRange(100, 800);
    cpu_percent = randomInRange(15, 75);
  } else {
    memory_gb = [8, 16, 32][Math.floor(Math.random() * 3)];
    disk_free_gb = randomInRange(20, 300);
    cpu_percent = randomInRange(5, 90);
  }

  // Compliance score - higher for newer systems and servers
  let complianceBase = 0.70;
  if (os.name.includes('2022') || os.name.includes('11') || os.name === 'macOS') {
    complianceBase = 0.85;
  }
  if (isServer) complianceBase += 0.05;
  const compliance_score = Math.min(0.99, Math.max(0.50, complianceBase + randomInRange(-0.15, 0.15)));

  return {
    computer_name: computerName,
    role: group.role,
    os_platform: os.name,
    os_version: os.version[Math.floor(Math.random() * os.version.length)],
    group_name: group.name,
    location: location.name,
    disk_free_gb: Math.round(disk_free_gb * 10) / 10,
    memory_gb,
    cpu_percent: Math.round(cpu_percent * 10) / 10,
    compliance_score: Math.round(compliance_score * 100) / 100,
    last_reboot: randomPastDate(30),
    last_seen: randomPastDate(7)
  };
}

/**
 * Generate sample dataset with specified number of machines
 */
export function generateSampleData(count: number = 150): MachineData[] {
  const machines: MachineData[] = [];

  for (let i = 1; i <= count; i++) {
    machines.push(generateMachine(i));
  }

  return machines;
}

/**
 * Generate sample data with specific scenarios for testing
 */
export function generateSampleDataWithScenarios(): MachineData[] {
  const baseData = generateSampleData(140); // 140 random machines

  // Add 10 specific scenario machines for testing edge cases
  const scenarioMachines: MachineData[] = [
    {
      computer_name: 'CRITICAL-HIGH-CPU',
      role: 'Server',
      os_platform: 'Windows Server 2019',
      os_version: '2019',
      group_name: 'Data Center Servers',
      location: 'NA-US',
      disk_free_gb: 45.2,
      memory_gb: 64.0,
      cpu_percent: 98.7,
      compliance_score: 0.72,
      last_reboot: randomPastDate(45),
      last_seen: randomPastDate(1)
    },
    {
      computer_name: 'LOW-DISK-ALERT',
      role: 'Workstation',
      os_platform: 'Windows 10',
      os_version: '21H2',
      group_name: 'Finance Workstations',
      location: 'EU-UK',
      disk_free_gb: 2.1,
      memory_gb: 8.0,
      cpu_percent: 34.2,
      compliance_score: 0.58,
      last_reboot: randomPastDate(60),
      last_seen: randomPastDate(2)
    },
    {
      computer_name: 'OFFLINE-MACHINE',
      role: 'Workstation',
      os_platform: 'Windows 11',
      os_version: '22H2',
      group_name: 'Laptops',
      location: 'NA-US',
      disk_free_gb: 125.4,
      memory_gb: 16.0,
      cpu_percent: 12.3,
      compliance_score: 0.81,
      last_reboot: randomPastDate(90),
      last_seen: randomPastDate(30)
    },
    {
      computer_name: 'PERFECT-COMPLIANCE',
      role: 'Server',
      os_platform: 'Windows Server 2022',
      os_version: '2022',
      group_name: 'Data Center Servers',
      location: 'NA-US',
      disk_free_gb: 450.8,
      memory_gb: 128.0,
      cpu_percent: 25.1,
      compliance_score: 0.99,
      last_reboot: randomPastDate(3),
      last_seen: randomPastDate(1)
    },
    {
      computer_name: 'LOW-COMPLIANCE-WKS',
      role: 'Workstation',
      os_platform: 'Windows 10',
      os_version: '21H2',
      group_name: 'Sales',
      location: 'APAC-JP',
      disk_free_gb: 78.3,
      memory_gb: 8.0,
      cpu_percent: 45.6,
      compliance_score: 0.52,
      last_reboot: randomPastDate(75),
      last_seen: randomPastDate(5)
    },
    {
      computer_name: 'HIGH-MEMORY-SERVER',
      role: 'Server',
      os_platform: 'Linux',
      os_version: 'RHEL 9',
      group_name: 'Data Center Servers',
      location: 'EU-DE',
      disk_free_gb: 680.5,
      memory_gb: 256.0,
      cpu_percent: 42.8,
      compliance_score: 0.94,
      last_reboot: randomPastDate(10),
      last_seen: randomPastDate(1)
    },
    {
      computer_name: 'EDGE-CANARY-001',
      role: 'Workstation',
      os_platform: 'Windows 11',
      os_version: '23H2',
      group_name: 'Canary Cohort',
      location: 'NA-US',
      disk_free_gb: 210.7,
      memory_gb: 32.0,
      cpu_percent: 8.2,
      compliance_score: 0.98,
      last_reboot: randomPastDate(1),
      last_seen: randomPastDate(1)
    },
    {
      computer_name: 'LEGACY-SERVER-01',
      role: 'Server',
      os_platform: 'Windows Server 2016',
      os_version: '2016',
      group_name: 'Edge Servers',
      location: 'SA-BR',
      disk_free_gb: 125.6,
      memory_gb: 32.0,
      cpu_percent: 67.4,
      compliance_score: 0.61,
      last_reboot: randomPastDate(120),
      last_seen: randomPastDate(7)
    },
    {
      computer_name: 'MAC-EXEC-VIP',
      role: 'Workstation',
      os_platform: 'macOS',
      os_version: '14.4',
      group_name: 'Executive Suite',
      location: 'NA-US',
      disk_free_gb: 450.2,
      memory_gb: 32.0,
      cpu_percent: 15.3,
      compliance_score: 0.96,
      last_reboot: randomPastDate(5),
      last_seen: randomPastDate(1)
    },
    {
      computer_name: 'DEV-BUILD-SERVER',
      role: 'Server',
      os_platform: 'Linux',
      os_version: 'Ubuntu 22.04',
      group_name: 'Development Servers',
      location: 'NA-CA',
      disk_free_gb: 850.4,
      memory_gb: 128.0,
      cpu_percent: 82.1,
      compliance_score: 0.87,
      last_reboot: randomPastDate(7),
      last_seen: randomPastDate(1)
    }
  ];

  return [...baseData, ...scenarioMachines];
}
