/**
 * Budget App Privacy Settings
 * Stores user preferences for AI features and data processing
 * Uses localStorage for client-side persistence
 */

const STORAGE_KEY = 'budget-app-privacy-settings';

export interface PrivacySettings {
  // AI Features
  enableSmartDuplicateDetection: boolean;
  enableAnomalyDetection: boolean;
  enablePredictiveSpending: boolean;
  enableNaturalLanguageImport: boolean;
  
  // Data Processing
  enableClaudeAPI: boolean; // Master switch for Claude API features
  enableOCR: boolean;
  
  // Data Security
  enableEncryption: boolean; // Encrypt sensitive data at rest
  
  // Data Management
  allowDataExport: boolean;
  allowDataDeletion: boolean;
  
  // Last updated timestamp
  updatedAt: number;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  enableSmartDuplicateDetection: false, // Opt-in by default
  enableAnomalyDetection: false,
  enablePredictiveSpending: false,
  enableNaturalLanguageImport: false,
  enableClaudeAPI: false, // Master switch - must be enabled for any Claude features
  enableOCR: true, // OCR is client-side only, safe by default
  enableEncryption: false, // Encryption opt-in (requires key generation)
  allowDataExport: true,
  allowDataDeletion: true,
  updatedAt: Date.now(),
};

/**
 * Get privacy settings from localStorage
 */
export function getPrivacySettings(): PrivacySettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('[PrivacySettings] Failed to load settings:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save privacy settings to localStorage
 */
export function savePrivacySettings(settings: Partial<PrivacySettings>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getPrivacySettings();
    const updated = {
      ...current,
      ...settings,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[PrivacySettings] Failed to save settings:', error);
  }
}

/**
 * Check if smart duplicate detection is enabled
 */
export function isSmartDuplicateDetectionEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableClaudeAPI && settings.enableSmartDuplicateDetection;
}

/**
 * Check if any Claude API feature is enabled
 */
export function isClaudeAPIEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableClaudeAPI;
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableEncryption;
}

/**
 * Reset privacy settings to defaults
 */
export function resetPrivacySettings(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  } catch (error) {
    console.error('[PrivacySettings] Failed to reset settings:', error);
  }
}

