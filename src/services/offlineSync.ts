/**
 * =============================================================================
 * OFFLINE SYNC SERVICE
 * =============================================================================
 * Handles offline data storage and synchronization with Firebase
 * =============================================================================
 */

export interface PendingSync {
  id: string;
  type: 'session' | 'progress' | 'score';
  data: any;
  timestamp: Date;
  retries: number;
}

const PENDING_SYNC_KEY = 'ophthalmosim_pending_sync';
const OFFLINE_DATA_KEY = 'ophthalmosim_offline_data';

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Add listener for online/offline status changes
 */
export function onConnectivityChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Queue data for sync when online
 */
export function queueForSync(type: PendingSync['type'], data: any): void {
  const pending = getPendingSync();
  
  const newItem: PendingSync = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: new Date(),
    retries: 0
  };
  
  pending.push(newItem);
  savePendingSync(pending);
  
  // Try to sync immediately if online
  if (isOnline()) {
    processPendingSync();
  }
}

/**
 * Get pending sync items
 */
export function getPendingSync(): PendingSync[] {
  try {
    const data = localStorage.getItem(PENDING_SYNC_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (e) {
    console.error('Failed to load pending sync:', e);
    return [];
  }
}

/**
 * Save pending sync items
 */
function savePendingSync(items: PendingSync[]): void {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save pending sync:', e);
  }
}

/**
 * Process pending sync items
 */
export async function processPendingSync(): Promise<{ success: number; failed: number }> {
  if (!isOnline()) {
    return { success: 0, failed: 0 };
  }
  
  const pending = getPendingSync();
  if (pending.length === 0) {
    return { success: 0, failed: 0 };
  }
  
  let success = 0;
  let failed = 0;
  const remaining: PendingSync[] = [];
  
  for (const item of pending) {
    try {
      await syncItem(item);
      success++;
    } catch (e) {
      console.error(`Failed to sync item ${item.id}:`, e);
      
      item.retries++;
      if (item.retries < 5) {
        remaining.push(item);
      } else {
        failed++;
        console.error(`Giving up on item ${item.id} after 5 retries`);
      }
    }
  }
  
  savePendingSync(remaining);
  
  return { success, failed };
}

/**
 * Sync a single item to Firebase
 */
async function syncItem(item: PendingSync): Promise<void> {
  // Import Firebase dynamically to avoid issues when offline
  const { db, auth } = await import('../lib/firebase.js');
  const { doc, setDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
  
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  switch (item.type) {
    case 'session':
      await setDoc(
        doc(db, 'users', user.uid, 'sessions', item.id),
        {
          ...item.data,
          syncedAt: new Date()
        }
      );
      break;
      
    case 'progress':
      await updateDoc(doc(db, 'users', user.uid), {
        progress: item.data,
        lastSync: new Date()
      });
      break;
      
    case 'score':
      await updateDoc(doc(db, 'users', user.uid), {
        scores: arrayUnion(item.data),
        lastSync: new Date()
      });
      break;
      
    default:
      throw new Error(`Unknown sync type: ${item.type}`);
  }
}

/**
 * Save data locally for offline access
 */
export function saveOfflineData(key: string, data: any): void {
  try {
    const allData = getOfflineData();
    allData[key] = {
      data,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(allData));
  } catch (e) {
    console.error('Failed to save offline data:', e);
  }
}

/**
 * Get locally saved offline data
 */
export function getOfflineData(): Record<string, { data: any; savedAt: string }> {
  try {
    const data = localStorage.getItem(OFFLINE_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load offline data:', e);
    return {};
  }
}

/**
 * Get specific offline data by key
 */
export function getOfflineDataByKey<T>(key: string): T | null {
  const allData = getOfflineData();
  return allData[key]?.data ?? null;
}

/**
 * Clear all offline data
 */
export function clearOfflineData(): void {
  localStorage.removeItem(OFFLINE_DATA_KEY);
  localStorage.removeItem(PENDING_SYNC_KEY);
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
  online: boolean;
  pendingCount: number;
  lastSync: Date | null;
} {
  const pending = getPendingSync();
  const lastSyncStr = localStorage.getItem('ophthalmosim_last_sync');
  
  return {
    online: isOnline(),
    pendingCount: pending.length,
    lastSync: lastSyncStr ? new Date(lastSyncStr) : null
  };
}

/**
 * Update last sync timestamp
 */
export function updateLastSync(): void {
  localStorage.setItem('ophthalmosim_last_sync', new Date().toISOString());
}

/**
 * Initialize offline sync - call on app start
 */
export function initOfflineSync(): void {
  // Process any pending syncs when coming online
  onConnectivityChange((online) => {
    if (online) {
      console.log('Back online - processing pending syncs...');
      processPendingSync().then(({ success, failed }) => {
        if (success > 0) {
          console.log(`Synced ${success} items`);
          updateLastSync();
        }
        if (failed > 0) {
          console.warn(`Failed to sync ${failed} items`);
        }
      });
    } else {
      console.log('Gone offline - data will be synced when connection restored');
    }
  });
  
  // Try to sync on startup if online
  if (isOnline()) {
    processPendingSync();
  }
}
