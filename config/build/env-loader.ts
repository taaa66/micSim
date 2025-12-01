/**
 * =============================================================================
 * ENVIRONMENT LOADER (V14.0)
 * =============================================================================
 * Maps NODE_ENV to config/environments/* files.
 * =============================================================================
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface EnvironmentConfig {
  environment: string;
  debug: boolean;
  api: {
    baseUrl: string;
    wsUrl: string;
    timeout: number;
  };
  features: {
    zeroScrollMandate: boolean;
    hardwareAcceleration: boolean;
    serviceWorker: boolean;
    performanceLogging: boolean;
    debugOverlays: boolean;
  };
  kinetic: {
    traceLineMaxMs: number;
    animationFPS: number;
    gpuAcceleration: boolean;
  };
  apex: {
    refreshInterval: number;
    mockData: boolean;
  };
  build: {
    minify: boolean;
    sourceMaps: boolean;
    hashAssets: boolean;
  };
}

const ENV_MAP: Record<string, string> = {
  development: 'dev',
  test: 'qa',
  qa: 'qa',
  production: 'prod',
  prod: 'prod'
};

/**
 * Load environment configuration
 */
export function loadEnvironmentConfig(env?: string): EnvironmentConfig {
  const nodeEnv = env || process.env.NODE_ENV || 'development';
  const envFile = ENV_MAP[nodeEnv] || 'dev';
  
  const configPath = resolve(__dirname, `../environments/${envFile}.json`);
  
  if (!existsSync(configPath)) {
    console.warn(`[EnvLoader] Config file not found: ${configPath}, using defaults`);
    return getDefaultConfig(nodeEnv);
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent) as EnvironmentConfig;
    
    console.log(`[EnvLoader] Loaded config for: ${config.environment}`);
    return config;
  } catch (error) {
    console.error(`[EnvLoader] Failed to load config:`, error);
    return getDefaultConfig(nodeEnv);
  }
}

/**
 * Get default configuration
 */
function getDefaultConfig(env: string): EnvironmentConfig {
  const isProd = env === 'production' || env === 'prod';
  
  return {
    environment: env,
    debug: !isProd,
    api: {
      baseUrl: isProd ? 'https://api.ophthalmo-sim.com/v1' : 'http://localhost:3000/api',
      wsUrl: isProd ? 'wss://api.ophthalmo-sim.com/ws' : 'ws://localhost:3000/ws',
      timeout: 15000
    },
    features: {
      zeroScrollMandate: true,
      hardwareAcceleration: true,
      serviceWorker: isProd,
      performanceLogging: !isProd,
      debugOverlays: !isProd
    },
    kinetic: {
      traceLineMaxMs: 250,
      animationFPS: 60,
      gpuAcceleration: true
    },
    apex: {
      refreshInterval: 30000,
      mockData: !isProd
    },
    build: {
      minify: isProd,
      sourceMaps: !isProd,
      hashAssets: isProd
    }
  };
}

/**
 * Generate Vite define replacements
 */
export function getViteDefines(config: EnvironmentConfig): Record<string, string> {
  return {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(config.api.baseUrl),
    'import.meta.env.VITE_WS_URL': JSON.stringify(config.api.wsUrl),
    'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(config.api.timeout),
    'import.meta.env.VITE_DEBUG': JSON.stringify(config.debug),
    'import.meta.env.VITE_ZERO_SCROLL': JSON.stringify(config.features.zeroScrollMandate),
    'import.meta.env.VITE_GPU_ACCEL': JSON.stringify(config.features.hardwareAcceleration)
  };
}

export default loadEnvironmentConfig;
