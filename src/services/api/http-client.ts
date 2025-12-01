/**
 * =============================================================================
 * HTTP CLIENT (V14.0)
 * =============================================================================
 * Centralized HTTP client with environment-aware base URL.
 * =============================================================================
 */

import type { IApiResponse } from '../../core/models';

// Environment configuration loaded at build time
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 15000;

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Create abort controller with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Core HTTP request function
 */
async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<IApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT
  } = config;

  const controller = createTimeoutController(timeout as number);
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: data.message || response.statusText
        },
        timestamp: new Date()
      };
    }

    return {
      success: true,
      data: data as T,
      timestamp: new Date()
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    
    return {
      success: false,
      error: {
        code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isAbort 
          ? `Request timed out after ${timeout}ms`
          : (error instanceof Error ? error.message : 'Unknown error')
      },
      timestamp: new Date()
    };
  }
}

/**
 * HTTP Client API
 */
export const httpClient = {
  get: <T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(endpoint, { ...config, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(endpoint, { ...config, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(endpoint, { ...config, method: 'PATCH', body }),

  delete: <T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(endpoint, { ...config, method: 'DELETE' })
};

export default httpClient;
