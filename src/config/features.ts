/**
 * Feature Flags Configuration
 * Controls which features are enabled in standalone vs online modes
 */

export type AppMode = "standalone" | "online";

/**
 * Current app mode - change this to 'online' when deploying cloud version
 * In standalone mode, all data stays on device. In online mode, cloud sync is enabled.
 */
export const APP_MODE = "standalone" as AppMode;

/**
 * Feature flags for the budget app
 * Standalone features are always available, online features require cloud connectivity
 */
export const FEATURES = {
  // ========================
  // Standalone Features
  // ========================

  /** Multi-profile support - different users can have separate profiles */
  multiProfiles: true,

  /** PIN authentication for profile protection */
  pinAuthentication: true,

  /** Private/shared budgets - control which profiles can see which budgets */
  privatePublicBudgets: true,

  /** Activity logging - track who made what changes */
  activityLogging: true,

  /** Local export/import functionality */
  localExport: true,

  // ========================
  // Online Features (Stubs)
  // ========================

  /** AI features - OpenAI-powered analysis (requires API key) */
  aiFeatures: APP_MODE === "online",

  /** Chatbot - AI-powered budget assistant */
  chatbot: APP_MODE === "online",

  /** Cloud sync - sync data across devices via cloud */
  cloudSync: APP_MODE === "online",

  /** Family invites - invite family members to share budgets */
  familyInvites: APP_MODE === "online",

  /** Cloud backup - automatic backup to cloud storage */
  cloudBackup: APP_MODE === "online",

  /** Real-time collaboration - see changes from family members in real-time */
  realTimeCollab: APP_MODE === "online",
} as const;

/**
 * Type for feature flag keys
 */
export type FeatureName = keyof typeof FEATURES;

/**
 * Check if a specific feature is enabled
 * @param feature The feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(feature: FeatureName): boolean {
  return FEATURES[feature];
}

/**
 * Check if app is running in online mode
 * @returns boolean indicating if online mode is active
 */
export function isOnlineMode(): boolean {
  return APP_MODE === "online";
}

/**
 * Check if app is running in standalone mode
 * @returns boolean indicating if standalone mode is active
 */
export function isStandaloneMode(): boolean {
  return APP_MODE === "standalone";
}

/**
 * Get all enabled features
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): FeatureName[] {
  return (Object.keys(FEATURES) as FeatureName[]).filter((feature) => FEATURES[feature]);
}

/**
 * Get all disabled features (useful for showing "coming soon" UI)
 * @returns Array of disabled feature names
 */
export function getDisabledFeatures(): FeatureName[] {
  return (Object.keys(FEATURES) as FeatureName[]).filter((feature) => !FEATURES[feature]);
}

/**
 * Feature descriptions for UI display
 */
export const FEATURE_DESCRIPTIONS: Record<
  FeatureName,
  {
    title: string;
    description: string;
    icon: string;
  }
> = {
  multiProfiles: {
    title: "Multi-Profile Support",
    description: "Create separate profiles for different family members",
    icon: "users",
  },
  pinAuthentication: {
    title: "PIN Protection",
    description: "Secure profiles with a 4-6 digit PIN code",
    icon: "lock",
  },
  privatePublicBudgets: {
    title: "Private & Shared Budgets",
    description: "Control which budgets are visible to each profile",
    icon: "eye",
  },
  activityLogging: {
    title: "Activity Log",
    description: "Track who made changes and when",
    icon: "history",
  },
  localExport: {
    title: "Local Export",
    description: "Export your data for backup or transfer",
    icon: "download",
  },
  aiFeatures: {
    title: "AI Features",
    description: "AI-powered analysis for smart import and insights",
    icon: "sparkles",
  },
  chatbot: {
    title: "AI Chatbot",
    description: "Personal budget assistant powered by AI",
    icon: "message-circle",
  },
  cloudSync: {
    title: "Cloud Sync",
    description: "Sync your data across all your devices automatically",
    icon: "cloud",
  },
  familyInvites: {
    title: "Family Invites",
    description: "Invite family members to collaborate on shared budgets",
    icon: "user-plus",
  },
  cloudBackup: {
    title: "Cloud Backup",
    description: "Automatic backups to keep your data safe",
    icon: "cloud-upload",
  },
  realTimeCollab: {
    title: "Real-Time Collaboration",
    description: "See changes from family members instantly",
    icon: "refresh-cw",
  },
};

// Log feature flags on module load (development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("[Features] App Mode:", APP_MODE);
  console.log("[Features] Enabled:", getEnabledFeatures());
  console.log("[Features] Disabled:", getDisabledFeatures());
}
