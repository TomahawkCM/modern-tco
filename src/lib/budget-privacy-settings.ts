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
  enableAIFeatures: boolean; // Master switch for AI features (OpenAI)
  enableOCR: boolean;

  // Chatbot Privacy Controls
  enableChatbot: boolean; // Master switch for chatbot feature
  chatbotDataAccess: 'read-only' | 'full-access'; // Permission level for chatbot
  chatbotConversationRetention: 7 | 30 | 'forever'; // Conversation retention period (days)

  // Analytics & Error Tracking
  enableAnalytics: boolean; // Master switch for PostHog analytics
  enableErrorTracking: boolean; // Master switch for Sentry error tracking

  // Data Security
  enableEncryption: boolean; // Encrypt sensitive data at rest

  // Data Management
  allowDataExport: boolean;
  allowDataDeletion: boolean;

  // Last updated timestamp
  updatedAt: number;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  enableSmartDuplicateDetection: true, // Enabled by default
  enableAnomalyDetection: true, // Enabled by default
  enablePredictiveSpending: true, // Enabled by default
  enableNaturalLanguageImport: true, // Enabled by default
  enableAIFeatures: true, // Master switch - AI features enabled by default
  enableOCR: true, // OCR is client-side only, safe by default
  enableChatbot: false, // Chatbot opt-in required (GDPR compliance)
  chatbotDataAccess: 'read-only', // Safe default - chatbot can only read data
  chatbotConversationRetention: 7, // 7 days default (minimum retention)
  enableAnalytics: true, // Analytics enabled by default (privacy-safe, no PII)
  enableErrorTracking: true, // Error tracking enabled by default (helps improve app)
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

    // Dispatch custom event to notify components of settings change
    window.dispatchEvent(new Event('chatbot-settings-changed'));
  } catch (error) {
    console.error('[PrivacySettings] Failed to save settings:', error);
  }
}

/**
 * Check if smart duplicate detection is enabled
 */
export function isSmartDuplicateDetectionEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableAIFeatures && settings.enableSmartDuplicateDetection;
}

/**
 * Check if AI features are enabled
 */
export function isAIFeaturesEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableAIFeatures;
}

/**
 * @deprecated Use isAIFeaturesEnabled() instead
 * Backward compatibility alias
 */
export function isClaudeAPIEnabled(): boolean {
  return isAIFeaturesEnabled();
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableEncryption;
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableAnalytics;
}

/**
 * Check if error tracking is enabled
 */
export function isErrorTrackingEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableErrorTracking;
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

/**
 * Check if chatbot is enabled
 */
export function isChatbotEnabled(): boolean {
  const settings = getPrivacySettings();
  return settings.enableChatbot && settings.enableAIFeatures; // Requires both chatbot AND AI features enabled
}

/**
 * Get chatbot data access level
 */
export function getChatbotDataAccess(): 'read-only' | 'full-access' {
  const settings = getPrivacySettings();
  return settings.chatbotDataAccess;
}

/**
 * Get chatbot conversation retention period
 */
export function getChatbotConversationRetention(): 7 | 30 | 'forever' {
  const settings = getPrivacySettings();
  return settings.chatbotConversationRetention;
}

