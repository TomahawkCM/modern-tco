/**
 * Seed Simulator Inventory Database
 * Populates sim/inventory.sqlite with 100+ realistic enterprise computers
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, '../sim/inventory.sqlite');

interface Machine {
  computer_name: string;
  role: string;
  os_platform: string;
  os_version: string;
  group_name: string;
  location: string;
  disk_free_gb: number;
  memory_gb: number;
  cpu_percent: number;
  compliance_score: number;
  last_reboot: string;
  last_seen: string;
}

// Helper functions
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

// Enterprise data templates
const osTemplates = {
  windowsWorkstation: [
    { os: 'Windows 10', versions: ['21H2', '22H2', '23H2'], count: 40 },
    { os: 'Windows 11', versions: ['21H2', '22H2', '23H2'], count: 30 }
  ],
  windowsServer: [
    { os: 'Windows Server 2016', versions: ['Standard', 'Datacenter'], count: 8 },
    { os: 'Windows Server 2019', versions: ['Standard', 'Datacenter'], count: 15 },
    { os: 'Windows Server 2022', versions: ['Standard', 'Datacenter'], count: 12 }
  ],
  linux: [
    { os: 'Red Hat Enterprise Linux', versions: ['8.8', '9.2'], count: 10 },
    { os: 'Ubuntu Server', versions: ['20.04 LTS', '22.04 LTS'], count: 8 },
    { os: 'CentOS', versions: ['7.9', '8.5'], count: 5 }
  ],
  mac: [
    { os: 'macOS', versions: ['Monterey 12.7', 'Ventura 13.5', 'Sonoma 14.2'], count: 12 }
  ]
};

const roles = {
  workstation: ['Developer Workstation', 'Office Workstation', 'Sales Laptop', 'Executive Laptop'],
  server: ['Web Server', 'Database Server', 'Application Server', 'File Server', 'Domain Controller'],
  infrastructure: ['DNS Server', 'DHCP Server', 'Print Server', 'Backup Server']
};

const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'IT', 'Operations', 'Executive'];
const locations = ['New York HQ', 'San Francisco Office', 'Austin Office', 'Chicago Office', 'Remote', 'London Office'];

// Generate machines
function generateMachines(): Machine[] {
  const machines: Machine[] = [];
  let machineCounter = 1;

  // Windows Workstations (70 machines)
  osTemplates.windowsWorkstation.forEach(template => {
    for (let i = 0; i < template.count; i++) {
      const dept = randomChoice(departments);
      const version = randomChoice(template.versions);
      const isOnline = Math.random() > 0.15; // 85% online
      const lastSeenDays = isOnline ? randomInt(0, 1) : randomInt(2, 30);

      machines.push({
        computer_name: `WKS-${dept.substring(0, 3).toUpperCase()}-${String(machineCounter++).padStart(3, '0')}`,
        role: randomChoice(roles.workstation),
        os_platform: template.os,
        os_version: version,
        group_name: `${dept} Workstations`,
        location: randomChoice(locations),
        disk_free_gb: randomFloat(50, 500),
        memory_gb: randomChoice([8, 16, 32]),
        cpu_percent: isOnline ? randomFloat(5, 85) : 0,
        compliance_score: randomFloat(65, 100),
        last_reboot: daysAgo(randomInt(1, 60)),
        last_seen: isOnline ? hoursAgo(randomInt(0, 24)) : daysAgo(lastSeenDays)
      });
    }
  });

  // Windows Servers (35 machines)
  osTemplates.windowsServer.forEach(template => {
    for (let i = 0; i < template.count; i++) {
      const role = randomChoice([...roles.server, ...roles.infrastructure]);
      const version = randomChoice(template.versions);
      const isOnline = Math.random() > 0.05; // 95% online (servers more reliable)

      machines.push({
        computer_name: `SRV-${role.split(' ')[0].substring(0, 3).toUpperCase()}-${String(machineCounter++).padStart(3, '0')}`,
        role,
        os_platform: template.os,
        os_version: version,
        group_name: 'Production Servers',
        location: randomChoice(['New York HQ', 'San Francisco Office', 'AWS us-east-1', 'Azure East US']),
        disk_free_gb: randomFloat(100, 2000),
        memory_gb: randomChoice([16, 32, 64, 128]),
        cpu_percent: isOnline ? randomFloat(10, 95) : 0,
        compliance_score: randomFloat(85, 100),
        last_reboot: daysAgo(randomInt(1, 120)),
        last_seen: isOnline ? hoursAgo(randomInt(0, 6)) : daysAgo(randomInt(2, 7))
      });
    }
  });

  // Linux Servers (23 machines)
  osTemplates.linux.forEach(template => {
    for (let i = 0; i < template.count; i++) {
      const role = randomChoice(roles.server);
      const version = randomChoice(template.versions);
      const isOnline = Math.random() > 0.03; // 97% online (Linux very reliable)

      machines.push({
        computer_name: `LNX-${role.split(' ')[0].substring(0, 3).toUpperCase()}-${String(machineCounter++).padStart(3, '0')}`,
        role,
        os_platform: template.os,
        os_version: version,
        group_name: 'Linux Infrastructure',
        location: randomChoice(['AWS us-west-2', 'AWS eu-west-1', 'On-Premise Datacenter']),
        disk_free_gb: randomFloat(50, 1000),
        memory_gb: randomChoice([8, 16, 32, 64]),
        cpu_percent: isOnline ? randomFloat(15, 90) : 0,
        compliance_score: randomFloat(80, 100),
        last_reboot: daysAgo(randomInt(30, 365)),
        last_seen: isOnline ? hoursAgo(randomInt(0, 2)) : daysAgo(randomInt(1, 3))
      });
    }
  });

  // macOS Workstations (12 machines)
  osTemplates.mac.forEach(template => {
    for (let i = 0; i < template.count; i++) {
      const dept = randomChoice(['Engineering', 'Marketing', 'Executive']);
      const version = randomChoice(template.versions);
      const isOnline = Math.random() > 0.20; // 80% online (laptops less reliable)

      machines.push({
        computer_name: `MAC-${dept.substring(0, 3).toUpperCase()}-${String(machineCounter++).padStart(3, '0')}`,
        role: randomChoice(['Developer Workstation', 'Designer Workstation', 'Executive Laptop']),
        os_platform: template.os,
        os_version: version,
        group_name: `${dept} Macs`,
        location: randomChoice([...locations, 'Remote']),
        disk_free_gb: randomFloat(100, 800),
        memory_gb: randomChoice([16, 32, 64]),
        cpu_percent: isOnline ? randomFloat(10, 70) : 0,
        compliance_score: randomFloat(70, 95),
        last_reboot: daysAgo(randomInt(1, 45)),
        last_seen: isOnline ? hoursAgo(randomInt(0, 48)) : daysAgo(randomInt(3, 21))
      });
    }
  });

  return machines;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🔄 Opening simulator database...');
    const db = new Database(DB_PATH);

    // Get current count
    const currentCount = db.prepare('SELECT COUNT(*) as count FROM machines').get() as { count: number };
    console.log(`📊 Current machine count: ${currentCount.count}`);

    if (currentCount.count >= 100) {
      console.log('✅ Database already has 100+ machines. Skipping seed.');
      console.log('   To re-seed, run: sqlite3 sim/inventory.sqlite "DELETE FROM machines WHERE id > 11"');
      db.close();
      return;
    }

    console.log('🌱 Generating 140 enterprise machines...');
    const machines = generateMachines();

    // Insert machines
    const insert = db.prepare(`
      INSERT INTO machines (
        computer_name, role, os_platform, os_version, group_name, location,
        disk_free_gb, memory_gb, cpu_percent, compliance_score, last_reboot, last_seen
      ) VALUES (
        @computer_name, @role, @os_platform, @os_version, @group_name, @location,
        @disk_free_gb, @memory_gb, @cpu_percent, @compliance_score, @last_reboot, @last_seen
      )
    `);

    const insertMany = db.transaction((machines: Machine[]) => {
      for (const machine of machines) {
        insert.run(machine);
      }
    });

    console.log('💾 Inserting machines into database...');
    insertMany(machines);

    // Show summary
    const summary = db.prepare(`
      SELECT os_platform, COUNT(*) as count
      FROM machines
      GROUP BY os_platform
      ORDER BY count DESC
    `).all() as Array<{ os_platform: string; count: number }>;

    console.log('\n✅ Seeding complete!');
    console.log('\n📊 Machine Summary:');
    summary.forEach(row => {
      console.log(`   ${row.os_platform.padEnd(30)} ${row.count} machines`);
    });

    const total = db.prepare('SELECT COUNT(*) as count FROM machines').get() as { count: number };
    console.log(`\n   ${'TOTAL'.padEnd(30)} ${total.count} machines`);

    db.close();
    console.log('\n🎉 Simulator inventory ready for realistic queries!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
