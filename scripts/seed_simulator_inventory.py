#!/usr/bin/env python3
"""
Seed Simulator Inventory Database
Populates sim/inventory.sqlite with 100+ realistic enterprise computers
"""

import sqlite3
import random
from datetime import datetime, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../sim/inventory.sqlite')

def days_ago(days):
    """Generate ISO date from days ago"""
    return (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

def hours_ago(hours):
    """Generate ISO datetime from hours ago"""
    return (datetime.now() - timedelta(hours=hours)).isoformat()

def generate_machines():
    """Generate 140 realistic enterprise machines"""
    machines = []
    machine_counter = 1

    # OS Templates
    os_templates = {
        'windows_workstation': [
            {'os': 'Windows 10', 'versions': ['21H2', '22H2', '23H2'], 'count': 40},
            {'os': 'Windows 11', 'versions': ['21H2', '22H2', '23H2'], 'count': 30}
        ],
        'windows_server': [
            {'os': 'Windows Server 2016', 'versions': ['Standard', 'Datacenter'], 'count': 8},
            {'os': 'Windows Server 2019', 'versions': ['Standard', 'Datacenter'], 'count': 15},
            {'os': 'Windows Server 2022', 'versions': ['Standard', 'Datacenter'], 'count': 12}
        ],
        'linux': [
            {'os': 'Red Hat Enterprise Linux', 'versions': ['8.8', '9.2'], 'count': 10},
            {'os': 'Ubuntu Server', 'versions': ['20.04 LTS', '22.04 LTS'], 'count': 8},
            {'os': 'CentOS', 'versions': ['7.9', '8.5'], 'count': 5}
        ],
        'mac': [
            {'os': 'macOS', 'versions': ['Monterey 12.7', 'Ventura 13.5', 'Sonoma 14.2'], 'count': 12}
        ]
    }

    roles = {
        'workstation': ['Developer Workstation', 'Office Workstation', 'Sales Laptop', 'Executive Laptop'],
        'server': ['Web Server', 'Database Server', 'Application Server', 'File Server', 'Domain Controller'],
        'infrastructure': ['DNS Server', 'DHCP Server', 'Print Server', 'Backup Server']
    }

    departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'IT', 'Operations', 'Executive']
    locations = ['New York HQ', 'San Francisco Office', 'Austin Office', 'Chicago Office', 'Remote', 'London Office']

    # Windows Workstations (70 machines)
    for template in os_templates['windows_workstation']:
        for i in range(template['count']):
            dept = random.choice(departments)
            version = random.choice(template['versions'])
            is_online = random.random() > 0.15  # 85% online
            last_seen_days = random.randint(0, 1) if is_online else random.randint(2, 30)

            machines.append({
                'computer_name': f"WKS-{dept[:3].upper()}-{str(machine_counter).zfill(3)}",
                'role': random.choice(roles['workstation']),
                'os_platform': template['os'],
                'os_version': version,
                'group_name': f"{dept} Workstations",
                'location': random.choice(locations),
                'disk_free_gb': round(random.uniform(50, 500), 2),
                'memory_gb': random.choice([8, 16, 32]),
                'cpu_percent': round(random.uniform(5, 85), 2) if is_online else 0,
                'compliance_score': round(random.uniform(65, 100), 2),
                'last_reboot': days_ago(random.randint(1, 60)),
                'last_seen': hours_ago(random.randint(0, 24)) if is_online else days_ago(last_seen_days)
            })
            machine_counter += 1

    # Windows Servers (35 machines)
    for template in os_templates['windows_server']:
        for i in range(template['count']):
            role = random.choice(roles['server'] + roles['infrastructure'])
            version = random.choice(template['versions'])
            is_online = random.random() > 0.05  # 95% online

            machines.append({
                'computer_name': f"SRV-{role.split()[0][:3].upper()}-{str(machine_counter).zfill(3)}",
                'role': role,
                'os_platform': template['os'],
                'os_version': version,
                'group_name': 'Production Servers',
                'location': random.choice(['New York HQ', 'San Francisco Office', 'AWS us-east-1', 'Azure East US']),
                'disk_free_gb': round(random.uniform(100, 2000), 2),
                'memory_gb': random.choice([16, 32, 64, 128]),
                'cpu_percent': round(random.uniform(10, 95), 2) if is_online else 0,
                'compliance_score': round(random.uniform(85, 100), 2),
                'last_reboot': days_ago(random.randint(1, 120)),
                'last_seen': hours_ago(random.randint(0, 6)) if is_online else days_ago(random.randint(2, 7))
            })
            machine_counter += 1

    # Linux Servers (23 machines)
    for template in os_templates['linux']:
        for i in range(template['count']):
            role = random.choice(roles['server'])
            version = random.choice(template['versions'])
            is_online = random.random() > 0.03  # 97% online

            machines.append({
                'computer_name': f"LNX-{role.split()[0][:3].upper()}-{str(machine_counter).zfill(3)}",
                'role': role,
                'os_platform': template['os'],
                'os_version': version,
                'group_name': 'Linux Infrastructure',
                'location': random.choice(['AWS us-west-2', 'AWS eu-west-1', 'On-Premise Datacenter']),
                'disk_free_gb': round(random.uniform(50, 1000), 2),
                'memory_gb': random.choice([8, 16, 32, 64]),
                'cpu_percent': round(random.uniform(15, 90), 2) if is_online else 0,
                'compliance_score': round(random.uniform(80, 100), 2),
                'last_reboot': days_ago(random.randint(30, 365)),
                'last_seen': hours_ago(random.randint(0, 2)) if is_online else days_ago(random.randint(1, 3))
            })
            machine_counter += 1

    # macOS Workstations (12 machines)
    for template in os_templates['mac']:
        for i in range(template['count']):
            dept = random.choice(['Engineering', 'Marketing', 'Executive'])
            version = random.choice(template['versions'])
            is_online = random.random() > 0.20  # 80% online

            machines.append({
                'computer_name': f"MAC-{dept[:3].upper()}-{str(machine_counter).zfill(3)}",
                'role': random.choice(['Developer Workstation', 'Designer Workstation', 'Executive Laptop']),
                'os_platform': template['os'],
                'os_version': version,
                'group_name': f"{dept} Macs",
                'location': random.choice(locations + ['Remote']),
                'disk_free_gb': round(random.uniform(100, 800), 2),
                'memory_gb': random.choice([16, 32, 64]),
                'cpu_percent': round(random.uniform(10, 70), 2) if is_online else 0,
                'compliance_score': round(random.uniform(70, 95), 2),
                'last_reboot': days_ago(random.randint(1, 45)),
                'last_seen': hours_ago(random.randint(0, 48)) if is_online else days_ago(random.randint(3, 21))
            })
            machine_counter += 1

    return machines

def seed_database():
    """Main seeding function"""
    try:
        print('🔄 Opening simulator database...')
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get current count
        cursor.execute('SELECT COUNT(*) FROM machines')
        current_count = cursor.fetchone()[0]
        print(f'📊 Current machine count: {current_count}')

        if current_count >= 100:
            print('✅ Database already has 100+ machines. Skipping seed.')
            print('   To re-seed, run: sqlite3 sim/inventory.sqlite "DELETE FROM machines WHERE id > 11"')
            conn.close()
            return

        print('🌱 Generating 140 enterprise machines...')
        machines = generate_machines()

        print('💾 Inserting machines into database...')
        cursor.executemany('''
            INSERT INTO machines (
                computer_name, role, os_platform, os_version, group_name, location,
                disk_free_gb, memory_gb, cpu_percent, compliance_score, last_reboot, last_seen
            ) VALUES (
                :computer_name, :role, :os_platform, :os_version, :group_name, :location,
                :disk_free_gb, :memory_gb, :cpu_percent, :compliance_score, :last_reboot, :last_seen
            )
        ''', machines)

        conn.commit()

        # Show summary
        cursor.execute('''
            SELECT os_platform, COUNT(*) as count
            FROM machines
            GROUP BY os_platform
            ORDER BY count DESC
        ''')
        summary = cursor.fetchall()

        print('\n✅ Seeding complete!')
        print('\n📊 Machine Summary:')
        for row in summary:
            print(f'   {row[0]:<30} {row[1]} machines')

        cursor.execute('SELECT COUNT(*) FROM machines')
        total = cursor.fetchone()[0]
        print(f'\n   {"TOTAL":<30} {total} machines')

        conn.close()
        print('\n🎉 Simulator inventory ready for realistic queries!')

    except Exception as e:
        print(f'❌ Error seeding database: {e}')
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    seed_database()
