// Environment variable type declarations for offline mode
declare namespace NodeJS {
  interface ProcessEnv {
    // Offline mode flag - when 'true', cloud features are disabled
    NEXT_PUBLIC_OFFLINE_MODE?: string;

    // Tree-shaking flags (set by webpack DefinePlugin)
    ENABLE_CLOUD_AUTH?: string;
    ENABLE_ADMIN?: string;
    ENABLE_CLOUD_ANALYTICS?: string;
  }
}
