import { Capacitor } from "@capacitor/core";

type Environment = 'development' | 'staging' | 'production';

interface AppConfig {
  apiBaseUrl: string;
  environment: Environment;
  isProduction: boolean;
}

const STAGING_API_URL = 'https://816ceb24-1199-437b-af9a-e39baf99ff33-00-2fffvdsrov5is.riker.replit.dev';
const PRODUCTION_API_URL = (import.meta as any).env?.VITE_PRODUCTION_API_URL || STAGING_API_URL;

function getEnvironment(): Environment {
  const env = (import.meta as any).env?.VITE_APP_ENV as string | undefined;
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  
  return 'development';
}

function getApiBaseUrl(): string {
  const env = getEnvironment();
  
  if (!Capacitor.isNativePlatform()) {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  
  switch (env) {
    case 'production':
      return PRODUCTION_API_URL;
    case 'staging':
      return STAGING_API_URL;
    default:
      return STAGING_API_URL;
  }
}

export const appConfig: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
  environment: getEnvironment(),
  isProduction: getEnvironment() === 'production',
};

export function resolveApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return path;
  }
  
  if (!Capacitor.isNativePlatform()) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${path}`;
  }
  
  return `${appConfig.apiBaseUrl}${path}`;
}
