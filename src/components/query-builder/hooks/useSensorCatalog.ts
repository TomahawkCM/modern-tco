import { useMemo, useCallback } from 'react';
import {
  UseSensorCatalog,
  SensorCatalogEntry
} from '../types/queryBuilder';
import { Sensor } from '@/lib/tanium-query-engine/types';
import {
  SENSORS_CATALOG,
  getAllFieldNames,
  getFieldMapping
} from '@/lib/tanium-query-engine/field-mappings';

// Define sensor catalog with metadata
const defaultCatalog: SensorCatalogEntry[] = [
  {
    sensor: { name: 'Computer Name', key: 'computer_name', type: 'text', category: 'System' } as Sensor,
    category: 'System',
    description: 'The name of the computer or endpoint',
    examples: ['PC-001', 'SERVER-WEB-01'],
    runtime: 'fast',
    runtimeMs: 10,
    popularity: 0.95,
    columns: ['Computer Name']
  },
  {
    sensor: { name: 'Operating System', key: 'os_platform', type: 'text', category: 'System' } as Sensor,
    category: 'System',
    description: 'The operating system platform',
    examples: ['Windows 10', 'Windows Server 2019', 'macOS', 'Linux'],
    runtime: 'fast',
    runtimeMs: 15,
    popularity: 0.90,
    columns: ['Operating System']
  },
  {
    sensor: { name: 'IP Address', key: 'ip_address', type: 'text', category: 'Network' } as Sensor,
    category: 'Network',
    description: 'The IP address of the endpoint',
    examples: ['192.168.1.100', '10.0.0.50'],
    runtime: 'fast',
    runtimeMs: 20,
    popularity: 0.85,
    columns: ['IP Address']
  },
  {
    sensor: { name: 'CPU Percent', key: 'cpu_percent', type: 'number', category: 'Performance' } as Sensor,
    category: 'Performance',
    description: 'Current CPU usage percentage',
    examples: ['25.5', '80.3'],
    runtime: 'medium',
    runtimeMs: 100,
    popularity: 0.75,
    columns: ['CPU Percent']
  },
  {
    sensor: { name: 'Memory GB', key: 'memory_gb', type: 'number', category: 'Performance' } as Sensor,
    category: 'Performance',
    description: 'Total memory in gigabytes',
    examples: ['16', '32', '8'],
    runtime: 'fast',
    runtimeMs: 25,
    popularity: 0.70,
    columns: ['Memory GB']
  },
  {
    sensor: { name: 'Disk Free GB', key: 'disk_free_gb', type: 'number', category: 'Storage' } as Sensor,
    category: 'Storage',
    description: 'Available disk space in gigabytes',
    examples: ['250.5', '45.2'],
    runtime: 'medium',
    runtimeMs: 150,
    popularity: 0.80,
    columns: ['Disk Free GB']
  },
  {
    sensor: { name: 'Last Logged In User', key: 'last_logged_in_user', type: 'text', category: 'Security' } as Sensor,
    category: 'Security',
    description: 'The username of the last logged in user',
    examples: ['john.doe', 'admin'],
    runtime: 'fast',
    runtimeMs: 30,
    popularity: 0.65,
    columns: ['Last Logged In User']
  },
  {
    sensor: { name: 'Last Reboot', key: 'last_reboot', type: 'date', category: 'System' } as Sensor,
    category: 'System',
    description: 'Date and time of last system reboot',
    examples: ['2024-01-15 10:30:00'],
    runtime: 'fast',
    runtimeMs: 35,
    popularity: 0.60,
    columns: ['Last Reboot']
  },
  {
    sensor: { name: 'Compliance Score', key: 'compliance_score', type: 'number', category: 'Security' } as Sensor,
    category: 'Security',
    description: 'Security compliance score (0-1)',
    examples: ['0.85', '0.92'],
    runtime: 'slow',
    runtimeMs: 500,
    popularity: 0.55,
    columns: ['Compliance Score']
  },
  {
    sensor: { name: 'Is Virtual', key: 'is_virtual', type: 'boolean', category: 'System' } as Sensor,
    category: 'System',
    description: 'Whether the machine is a virtual machine',
    examples: ['true', 'false'],
    runtime: 'fast',
    runtimeMs: 15,
    popularity: 0.50,
    columns: ['Is Virtual']
  },
  {
    sensor: { name: 'Installed Applications', key: 'installed_apps', type: 'text', category: 'Software' } as Sensor,
    category: 'Software',
    description: 'List of installed applications',
    examples: ['Microsoft Office', 'Google Chrome'],
    runtime: 'slow',
    runtimeMs: 800,
    popularity: 0.70,
    columns: ['Name', 'Version', 'Publisher'],
    parameters: [
      {
        name: 'filter',
        type: 'text',
        required: false,
        description: 'Filter applications by name',
        default: ''
      }
    ]
  },
  {
    sensor: { name: 'Running Processes', key: 'processes', type: 'text', category: 'Performance' } as Sensor,
    category: 'Performance',
    description: 'List of currently running processes',
    runtime: 'medium',
    runtimeMs: 200,
    popularity: 0.45,
    columns: ['Process Name', 'PID', 'CPU %', 'Memory MB'],
    parameters: [
      {
        name: 'top',
        type: 'number',
        required: false,
        description: 'Limit to top N processes by CPU',
        default: 10
      }
    ]
  },
  {
    sensor: { name: 'Network Connections', key: 'network_connections', type: 'text', category: 'Network' } as Sensor,
    category: 'Network',
    description: 'Active network connections',
    runtime: 'medium',
    runtimeMs: 250,
    popularity: 0.40,
    columns: ['Protocol', 'Local Address', 'Remote Address', 'State']
  },
  {
    sensor: { name: 'Windows Updates', key: 'windows_updates', type: 'text', category: 'Software' } as Sensor,
    category: 'Software',
    description: 'Windows update status and history',
    runtime: 'slow',
    runtimeMs: 600,
    popularity: 0.65,
    columns: ['Update Name', 'Status', 'Date'],
    parameters: [
      {
        name: 'days',
        type: 'number',
        required: false,
        description: 'Updates from last N days',
        default: 30
      }
    ]
  },
  {
    sensor: { name: 'Service Status', key: 'service_status', type: 'text', category: 'System' } as Sensor,
    category: 'System',
    description: 'Status of Windows services',
    runtime: 'medium',
    runtimeMs: 180,
    popularity: 0.35,
    columns: ['Service Name', 'Display Name', 'Status', 'Startup Type'],
    parameters: [
      {
        name: 'service',
        type: 'text',
        required: true,
        description: 'Service name to check'
      }
    ]
  },
  {
    sensor: { name: 'Registry Value', key: 'registry_value', type: 'text', category: 'System' } as Sensor,
    category: 'System',
    description: 'Read Windows registry values',
    runtime: 'fast',
    runtimeMs: 50,
    popularity: 0.30,
    columns: ['Key', 'Value Name', 'Value'],
    parameters: [
      {
        name: 'key',
        type: 'text',
        required: true,
        description: 'Registry key path'
      },
      {
        name: 'value',
        type: 'text',
        required: false,
        description: 'Value name (optional)'
      }
    ]
  },
  {
    sensor: { name: 'File Hash', key: 'file_hash', type: 'text', category: 'Security' } as Sensor,
    category: 'Security',
    description: 'Calculate file hash (MD5, SHA1, SHA256)',
    runtime: 'medium',
    runtimeMs: 300,
    popularity: 0.25,
    columns: ['File Path', 'MD5', 'SHA1', 'SHA256'],
    parameters: [
      {
        name: 'path',
        type: 'text',
        required: true,
        description: 'File path'
      },
      {
        name: 'algorithm',
        type: 'select',
        required: false,
        description: 'Hash algorithm',
        default: 'SHA256',
        options: [
          { value: 'MD5', label: 'MD5' },
          { value: 'SHA1', label: 'SHA1' },
          { value: 'SHA256', label: 'SHA256' }
        ]
      }
    ]
  }
];

export function useSensorCatalog(): UseSensorCatalog {
  // Get categories
  const categories = useMemo(() => {
    const cats = new Set(defaultCatalog.map(item => item.category));
    return Array.from(cats).sort();
  }, []);

  // Get popular sensors
  const popularSensors = useMemo(() => {
    return defaultCatalog
      .filter(item => item.popularity > 0.7)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8);
  }, []);

  // Search sensors
  const search = useCallback((query: string): SensorCatalogEntry[] => {
    if (!query || query.trim() === '') {
      return defaultCatalog;
    }

    const lowerQuery = query.toLowerCase();
    return defaultCatalog.filter(item => {
      const nameMatch = 'name' in item.sensor && item.sensor.name?.toLowerCase().includes(lowerQuery);
      const descMatch = item.description?.toLowerCase().includes(lowerQuery);
      const catMatch = item.category.toLowerCase().includes(lowerQuery);
      const keyMatch = 'key' in item.sensor && item.sensor.key?.toLowerCase().includes(lowerQuery);

      return nameMatch || descMatch || catMatch || keyMatch;
    });
  }, []);

  // Get sensors by category
  const getByCategory = useCallback((category: string): SensorCatalogEntry[] => {
    if (category === 'all' || !category) {
      return defaultCatalog;
    }
    return defaultCatalog.filter(item => item.category === category);
  }, []);

  return {
    catalog: defaultCatalog,
    search,
    getByCategory,
    categories,
    popularSensors
  };
}