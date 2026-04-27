// Version detection and configuration
export const APP_VERSION = {
  UK_US: 'uk_us',
  GLOBAL: 'global'
} as const;

export type AppVersionType = typeof APP_VERSION[keyof typeof APP_VERSION];

// Detect version based on build configuration or environment
export const getAppVersion = (): AppVersionType => {
  const versionEnv = import.meta.env.VITE_APP_VERSION;
  const hostname = window.location.hostname;
  
  // Check explicit environment variable first
  if (versionEnv === APP_VERSION.UK_US) return APP_VERSION.UK_US;
  if (versionEnv === APP_VERSION.GLOBAL) return APP_VERSION.GLOBAL;
  
  // Fallback to hostname detection
  if (hostname.includes('uk') || hostname.includes('us') || hostname.includes('strict')) {
    return APP_VERSION.UK_US;
  }
  
  // Default to global version
  return APP_VERSION.GLOBAL;
};

// Version-specific configurations
export const VERSION_CONFIG = {
  [APP_VERSION.UK_US]: {
    strictValidation: true,
    requireEmailVerification: true,
    requirePhoneVerification: true,
    paymentValidation: true,
    language: 'en',
    currency: 'GBP',
    timezone: 'Europe/London'
  },
  [APP_VERSION.GLOBAL]: {
    strictValidation: false,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    paymentValidation: false,
    language: 'en',
    currency: 'USD',
    timezone: 'UTC'
  }
} as const;

export const currentVersion = getAppVersion();
export const config = VERSION_CONFIG[currentVersion];
