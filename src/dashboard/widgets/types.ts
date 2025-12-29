/**
 * Widget System Type Definitions
 *
 * Defines the schema for dashboard widgets, configurations, and grid layouts
 */

/**
 * Grid size for widget dimensions (spans)
 * - small: 1 column span (phone: full width, tablet/desktop: narrow)
 * - medium: 2 column spans (phone: full width, tablet/desktop: medium)
 * - large: 3+ column spans (phone: full width, tablet/desktop: wide)
 */
export type GridSize = 'small' | 'medium' | 'large';

/**
 * Widget types supported by the dashboard
 */
export type WidgetType =
  | 'spending-by-category'
  | 'recent-transactions'
  | 'budget-progress'
  | 'account-balances'
  | 'income-vs-expenses'
  | 'monthly-trends'
  | 'upcoming-bills';

/**
 * Widget configuration instance
 * Represents a specific widget placement on the dashboard
 */
export interface WidgetConfig {
  /** Unique ID for this widget instance */
  id: string;

  /** Type of widget (links to WidgetDefinition) */
  type: WidgetType;

  /** Display order (0-based index) */
  order: number;

  /** Grid size/span */
  size: GridSize;

  /** Whether widget is visible */
  visible: boolean;

  /** Custom settings for this widget instance */
  settings?: Record<string, unknown>;
}

/**
 * Widget definition (registry entry)
 * Defines a widget type's metadata and default configuration
 */
export interface WidgetDefinition {
  /** Widget type identifier */
  type: WidgetType;

  /** Display name (translation key) */
  title: string;

  /** Description (translation key) */
  description: string;

  /** Icon name (lucide-react) */
  icon: string;

  /** Default grid size */
  defaultSize: GridSize;

  /** Minimum required grid size */
  minSize: GridSize;

  /** Maximum allowed grid size */
  maxSize: GridSize;

  /** Whether widget requires data to be useful */
  requiresData: boolean;

  /** Tags for categorization/filtering */
  tags: string[];
}

/**
 * Dashboard layout configuration
 * Complete set of widgets for a user's dashboard
 */
export interface DashboardConfig {
  /** Array of widget configurations */
  widgets: WidgetConfig[];

  /** Last modified timestamp */
  updatedAt: number;

  /** Config version for migration compatibility */
  version: number;
}

/**
 * Preset configuration name
 */
export type PresetName =
  | 'phone-default'
  | 'tablet-default'
  | 'desktop-default'
  | 'seniors-simplified'
  | 'power-user';

/**
 * Device-specific grid configuration
 */
export interface GridConfig {
  /** Number of columns for this device class */
  columns: number;

  /** Gap between grid items (Tailwind class) */
  gap: string;

  /** Whether to show widget borders */
  showBorders: boolean;
}
