/**
 * Tanium Query Engine - Field Mappings
 * Maps Tanium sensor names to database columns and types
 */

import { FieldMapping, Sensor } from './types';

/**
 * Field mappings for common Tanium sensors
 */
export const FIELD_MAPPINGS: Map<string, FieldMapping> = new Map([
  // Computer identification
  ['computer name', {
    key: 'computer_name',
    type: 'text',
    dbColumn: 'computer_name',
    description: 'Endpoint hostname',
    category: 'Core'
  }],
  ['hostname', {
    key: 'computer_name',
    type: 'text',
    dbColumn: 'computer_name',
    description: 'Endpoint hostname (alias)',
    category: 'Core'
  }],

  // Role and type
  ['computer role', {
    key: 'role',
    type: 'text',
    dbColumn: 'role',
    description: 'Computer role (Workstation, Server, etc.)',
    category: 'Core'
  }],
  ['role', {
    key: 'role',
    type: 'text',
    dbColumn: 'role',
    description: 'Computer role (alias)',
    category: 'Core'
  }],

  // Operating system
  ['operating system', {
    key: 'os_platform',
    type: 'text',
    dbColumn: 'os_platform',
    description: 'Operating system platform',
    category: 'Core'
  }],
  ['os platform', {
    key: 'os_platform',
    type: 'text',
    dbColumn: 'os_platform',
    description: 'OS platform (Windows, macOS, Linux)',
    category: 'Core'
  }],
  ['os version', {
    key: 'os_version',
    type: 'text',
    dbColumn: 'os_version',
    description: 'Operating system version',
    category: 'Core'
  }],

  // Hardware resources
  ['disk free gb', {
    key: 'disk_free_gb',
    type: 'number',
    dbColumn: 'disk_free_gb',
    description: 'Available disk space in GB',
    category: 'Performance'
  }],
  ['disk space', {
    key: 'disk_free_gb',
    type: 'number',
    dbColumn: 'disk_free_gb',
    description: 'Available disk space (alias)',
    category: 'Performance'
  }],
  ['memory gb', {
    key: 'memory_gb',
    type: 'number',
    dbColumn: 'memory_gb',
    description: 'Physical memory in GB',
    category: 'Performance'
  }],
  ['ram', {
    key: 'memory_gb',
    type: 'number',
    dbColumn: 'memory_gb',
    description: 'RAM in GB (alias)',
    category: 'Performance'
  }],
  ['cpu percent', {
    key: 'cpu_percent',
    type: 'number',
    dbColumn: 'cpu_percent',
    description: 'CPU utilization percentage',
    category: 'Performance'
  }],
  ['cpu usage', {
    key: 'cpu_percent',
    type: 'number',
    dbColumn: 'cpu_percent',
    description: 'CPU usage percentage (alias)',
    category: 'Performance'
  }],

  // Compliance and security
  ['compliance score', {
    key: 'compliance_score',
    type: 'number',
    dbColumn: 'compliance_score',
    description: 'Compliance score (0-1)',
    category: 'Governance'
  }],
  ['compliance', {
    key: 'compliance_score',
    type: 'number',
    dbColumn: 'compliance_score',
    description: 'Compliance score (alias)',
    category: 'Governance'
  }],

  // Grouping and location
  ['group', {
    key: 'group_name',
    type: 'text',
    dbColumn: 'group_name',
    description: 'Computer group membership',
    category: 'Metadata'
  }],
  ['group name', {
    key: 'group_name',
    type: 'text',
    dbColumn: 'group_name',
    description: 'Computer group name',
    category: 'Metadata'
  }],
  ['location', {
    key: 'location',
    type: 'text',
    dbColumn: 'location',
    description: 'Geographic or network location',
    category: 'Metadata'
  }],

  // Timestamps
  ['last reboot', {
    key: 'last_reboot',
    type: 'date',
    dbColumn: 'last_reboot',
    description: 'Last system reboot timestamp',
    category: 'Core'
  }],
  ['last seen', {
    key: 'last_seen',
    type: 'date',
    dbColumn: 'last_seen',
    description: 'Last time endpoint was seen',
    category: 'Core'
  }],

  // Network
  ['ip address', {
    key: 'ip_address',
    type: 'text',
    dbColumn: 'ip_address',
    description: 'Primary IP address',
    category: 'Network'
  }],
  ['mac address', {
    key: 'mac_address',
    type: 'text',
    dbColumn: 'mac_address',
    description: 'Primary MAC address',
    category: 'Network'
  }],

  // Asset information
  ['serial number', {
    key: 'serial_number',
    type: 'text',
    dbColumn: 'serial_number',
    description: 'Hardware serial number',
    category: 'Asset'
  }],
  ['manufacturer', {
    key: 'manufacturer',
    type: 'text',
    dbColumn: 'manufacturer',
    description: 'Hardware manufacturer',
    category: 'Asset'
  }],
  ['model', {
    key: 'model',
    type: 'text',
    dbColumn: 'model',
    description: 'Hardware model',
    category: 'Asset'
  }]
]);

/**
 * Group name aliases for common groups
 */
export const GROUP_ALIASES: Map<string, string> = new Map([
  ['laptops', 'Laptops'],
  ['servers', 'Data Center Servers'],
  ['data center servers', 'Data Center Servers'],
  ['finance', 'Finance Workstations'],
  ['finance workstations', 'Finance Workstations'],
  ['canary', 'Canary Cohort'],
  ['canary cohort', 'Canary Cohort'],
  ['engineering', 'Engineering Lab'],
  ['engineering lab', 'Engineering Lab'],
  ['operations', 'Operations'],
  ['ops', 'Operations'],
  ['production', 'Production Servers'],
  ['prod', 'Production Servers'],
  ['development', 'Development Workstations'],
  ['dev', 'Development Workstations'],
  ['staging', 'Staging Servers'],
  ['test', 'Test Environment']
]);

/**
 * Sensor catalog with full definitions
 */
export const SENSORS_CATALOG: Sensor[] = [
  {
    name: 'Computer Name',
    key: 'computer_name',
    category: 'Core',
    type: 'text',
    description: 'Returns the endpoint hostname'
  },
  {
    name: 'Operating System',
    key: 'os_platform',
    category: 'Core',
    type: 'text',
    description: 'Human-readable OS platform string'
  },
  {
    name: 'OS Platform',
    key: 'os_platform',
    category: 'Core',
    type: 'text',
    description: 'Normalized OS platform (Windows, macOS, Linux)'
  },
  {
    name: 'OS Version',
    key: 'os_version',
    category: 'Core',
    type: 'text',
    description: 'Version information for the current OS'
  },
  {
    name: 'CPU Percent',
    key: 'cpu_percent',
    category: 'Performance',
    type: 'number',
    description: 'Current CPU utilization percentage'
  },
  {
    name: 'Memory GB',
    key: 'memory_gb',
    category: 'Performance',
    type: 'number',
    description: 'Physical memory in gigabytes'
  },
  {
    name: 'Disk Free GB',
    key: 'disk_free_gb',
    category: 'Performance',
    type: 'number',
    description: 'Available disk capacity in gigabytes'
  },
  {
    name: 'Compliance Score',
    key: 'compliance_score',
    category: 'Governance',
    type: 'number',
    description: 'Composite score for patching and configuration compliance'
  },
  {
    name: 'Service Status',
    key: 'service_status',
    category: 'Core',
    type: 'text',
    description: 'Status of a given service on the endpoint',
    parameters: {
      serviceName: 'string'
    }
  },
  {
    name: 'Last Reboot',
    key: 'last_reboot',
    category: 'Core',
    type: 'date',
    description: 'Timestamp of the last reboot'
  },
  {
    name: 'Group',
    key: 'group_name',
    category: 'Metadata',
    type: 'text',
    description: 'Logical group membership for the endpoint'
  },
  {
    name: 'Location',
    key: 'location',
    category: 'Metadata',
    type: 'text',
    description: 'Geographic or network zone indicator'
  }
];

/**
 * Aggregate functions available
 */
export const AGGREGATE_FUNCTIONS = [
  'count()',
  'min()',
  'max()',
  'avg()',
  'sum()'
];

/**
 * Helper functions for field mapping
 */
export function getFieldMapping(fieldName: string): FieldMapping | undefined {
  return FIELD_MAPPINGS.get(fieldName.toLowerCase().trim());
}

export function resolveGroupAlias(groupName: string): string {
  return GROUP_ALIASES.get(groupName.toLowerCase().trim()) || groupName;
}

export function isKnownField(fieldName: string): boolean {
  return FIELD_MAPPINGS.has(fieldName.toLowerCase().trim());
}

export function getFieldType(fieldName: string): 'text' | 'number' | 'date' | undefined {
  const mapping = getFieldMapping(fieldName);
  return mapping?.type;
}

export function getDbColumn(fieldName: string): string | undefined {
  const mapping = getFieldMapping(fieldName);
  return mapping?.dbColumn;
}

/**
 * Get all field names for autocomplete
 */
export function getAllFieldNames(): string[] {
  return Array.from(FIELD_MAPPINGS.keys());
}

/**
 * Get sensors by category
 */
export function getSensorsByCategory(category: string): Sensor[] {
  return SENSORS_CATALOG.filter(s => s.category === category);
}

/**
 * Validate field compatibility with operator
 */
export function validateFieldOperator(fieldName: string, operator: string): boolean {
  const fieldType = getFieldType(fieldName);

  if (!fieldType) return false;

  const numericOperators = ['greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'];
  const textOperators = ['contains', 'does_not_contain', 'starts_with', 'ends_with'];
  const universalOperators = ['equals', 'not_equals'];

  if (universalOperators.includes(operator)) {
    return true;
  }

  if (fieldType === 'number' && numericOperators.includes(operator)) {
    return true;
  }

  if (fieldType === 'text' && textOperators.includes(operator)) {
    return true;
  }

  return false;
}