/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - APEX LEAGUE API SERVICE (V14.0)
 * =============================================================================
 * Handles all HTTP/WebSocket communication for Apex League features.
 * =============================================================================
 */

import { API_ENDPOINTS } from '../../core/constants';
import type { 
  IApexRanking, 
  IAllocationData, 
  IApiResponse,
  IPaginatedResponse 
} from '../../core/models';

// Environment configuration (loaded at build time)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 15000;

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<IApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: new Date()
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: {
        code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: error.message
      },
      timestamp: new Date()
    };
  }
}

// =============================================================================
// APEX RANKINGS API
// =============================================================================

/**
 * Fetch current Apex League rankings
 */
export async function fetchApexRankings(
  page = 1, 
  pageSize = 10
): Promise<IPaginatedResponse<IApexRanking>> {
  const endpoint = `${API_ENDPOINTS.APEX_RANKINGS}?page=${page}&pageSize=${pageSize}`;
  return apiFetch<IApexRanking[]>(endpoint) as Promise<IPaginatedResponse<IApexRanking>>;
}

/**
 * Fetch rankings for a specific team/group
 */
export async function fetchTeamRankings(
  teamId: string
): Promise<IApiResponse<IApexRanking[]>> {
  const endpoint = `${API_ENDPOINTS.APEX_RANKINGS}?team=${teamId}`;
  return apiFetch<IApexRanking[]>(endpoint);
}

// =============================================================================
// ALLOCATION API
// =============================================================================

/**
 * Fetch current allocation/voting data
 */
export async function fetchAllocationData(): Promise<IApiResponse<IAllocationData>> {
  return apiFetch<IAllocationData>(API_ENDPOINTS.APEX_ALLOCATION);
}

/**
 * Submit a vote for duty allocation
 */
export async function submitAllocationVote(
  odId: string
): Promise<IApiResponse<{ success: boolean; newVoteCount: number }>> {
  return apiFetch(API_ENDPOINTS.APEX_VOTE, {
    method: 'POST',
    body: JSON.stringify({ odId })
  });
}

/**
 * Finalize allocation (admin only)
 */
export async function finalizeAllocation(
  assignedOdId: string
): Promise<IApiResponse<IAllocationData>> {
  return apiFetch(`${API_ENDPOINTS.APEX_ALLOCATION}/finalize`, {
    method: 'POST',
    body: JSON.stringify({ assignedOdId })
  });
}

// =============================================================================
// WEBSOCKET CONNECTION FOR REAL-TIME UPDATES
// =============================================================================

type ApexEventCallback = (data: IApexRanking[] | IAllocationData) => void;

class ApexWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private callbacks: Map<string, ApexEventCallback[]> = new Map();

  connect(wsUrl: string = API_BASE_URL.replace('http', 'ws') + '/ws') {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[ApexWS] Connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        const handlers = this.callbacks.get(type) || [];
        handlers.forEach(cb => cb(data));
      } catch (e) {
        console.error('[ApexWS] Parse error:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[ApexWS] Disconnected');
      this.attemptReconnect(wsUrl);
    };

    this.ws.onerror = (error) => {
      console.error('[ApexWS] Error:', error);
    };
  }

  private attemptReconnect(wsUrl: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(wsUrl), delay);
    }
  }

  subscribe(event: 'rankings' | 'allocation', callback: ApexEventCallback) {
    const handlers = this.callbacks.get(event) || [];
    handlers.push(callback);
    this.callbacks.set(event, handlers);
  }

  unsubscribe(event: string, callback: ApexEventCallback) {
    const handlers = this.callbacks.get(event) || [];
    this.callbacks.set(event, handlers.filter(cb => cb !== callback));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

export const apexWebSocket = new ApexWebSocket();
