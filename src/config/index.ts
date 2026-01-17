/**
 * Application Configuration
 * Centralized access to environment variables
 */

interface Config {
  api: {
    baseUrl: string;
  };
  env: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const config: Config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  },
  env: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validation: Ensure required environment variables are set
if (!config.api.baseUrl) {
  console.error('❌ Missing required environment variable: VITE_API_BASE_URL');
}

// Log configuration in development (helps with debugging)
if (config.isDevelopment) {
  console.log('🔧 Application Configuration:', {
    environment: config.env,
    apiBaseUrl: config.api.baseUrl,
  });
}

export default config;
