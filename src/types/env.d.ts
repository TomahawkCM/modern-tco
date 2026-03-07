// Environment variable type declarations
declare namespace NodeJS {
  interface ProcessEnv {
    // App target: "tco" | "budget-offline" | "budget-online"
    NEXT_PUBLIC_APP_TARGET?: string;

    // Backward compat: derived from APP_TARGET ("true" when budget-offline)
    NEXT_PUBLIC_OFFLINE_MODE?: string;

    // Tree-shaking flags (set by webpack DefinePlugin)
    ENABLE_CLOUD_AUTH?: string;
    ENABLE_ADMIN?: string;
    ENABLE_CLOUD_ANALYTICS?: string;
  }
}
