/**
 * =============================================================================
 * DATA EXPORT SERVICE
 * =============================================================================
 * GDPR-compliant data export functionality
 * Allows users to download all their personal data
 * =============================================================================
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { audit } from './auditLog';

// =============================================================================
// TYPES
// =============================================================================

export interface ExportedData {
  exportDate: string;
  exportVersion: string;
  user: UserExportData;
  simulations: SimulationExportData[];
  okapResults: OkapExportData[];
  preferences: PreferenceExportData | null;
  analytics: AnalyticsExportData;
}

interface UserExportData {
  uid: string;
  idNumber: string;
  fullName: string;
  specialty: string;
  createdAt: string;
  stats: {
    totalSessions: number;
    totalScore: number;
    averageScore: number;
    highestScore: number;
    practice_count: number;
    modulesCompleted: string[];
    lastActive: string | null;
  };
}

interface SimulationExportData {
  id: string;
  simulationId: string;
  score: number;
  accuracy: number;
  duration: number;
  timestamp: string;
  metrics: Record<string, number>;
}

interface OkapExportData {
  id: string;
  gameId: string;
  score: number;
  accuracy: number;
  correct: number;
  total: number;
  timestamp: string;
}

interface PreferenceExportData {
  datePreferences: Record<string, string>;
  dayPreferences: Record<string, string>;
  shiftTypePreferences: Record<string, string>;
  notes: string;
}

interface AnalyticsExportData {
  totalTimeSpent: number;
  sessionsPerModule: Record<string, number>;
  scoreProgression: { date: string; score: number }[];
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export all user data as JSON
 */
export async function exportUserData(): Promise<ExportedData | null> {
  const user = auth?.currentUser;
  if (!user || !db) {
    console.error('User not authenticated or Firebase not available');
    return null;
  }

  try {
    // Log the export request
    await audit.adminAction('data_export_requested', { userId: user.uid });

    // 1. Get user profile
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() as UserExportData : null;

    if (!userData) {
      throw new Error('User profile not found');
    }

    // 2. Get simulation results
    const simulations: SimulationExportData[] = [];
    try {
      const simQuery = query(
        collection(db, 'simulations'),
        where('userId', '==', user.uid)
      );
      const simSnapshot = await getDocs(simQuery);
      simSnapshot.forEach(doc => {
        const data = doc.data();
        simulations.push({
          id: doc.id,
          simulationId: data.simulationId,
          score: data.score,
          accuracy: data.accuracy || 0,
          duration: data.duration,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
          metrics: data.metrics || {}
        });
      });
    } catch {
      console.warn('Could not fetch simulation results');
    }

    // 3. Get OKAP results
    const okapResults: OkapExportData[] = [];
    try {
      const okapQuery = query(
        collection(db, 'okap_results'),
        where('userId', '==', user.uid)
      );
      const okapSnapshot = await getDocs(okapQuery);
      okapSnapshot.forEach(doc => {
        const data = doc.data();
        okapResults.push({
          id: doc.id,
          gameId: data.gameId,
          score: data.score,
          accuracy: data.accuracy || 0,
          correct: data.correct || 0,
          total: data.total || 0,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
        });
      });
    } catch {
      console.warn('Could not fetch OKAP results');
    }

    // 4. Get preferences
    let preferences: PreferenceExportData | null = null;
    try {
      const prefQuery = query(
        collection(db, 'preferences'),
        where('userId', '==', user.uid)
      );
      const prefSnapshot = await getDocs(prefQuery);
      if (!prefSnapshot.empty) {
        const data = prefSnapshot.docs[0].data();
        preferences = {
          datePreferences: data.datePreferences || {},
          dayPreferences: data.dayPreferences || {},
          shiftTypePreferences: data.shiftTypePreferences || {},
          notes: data.notes || ''
        };
      }
    } catch {
      console.warn('Could not fetch preferences');
    }

    // 5. Calculate analytics summary
    const analytics: AnalyticsExportData = {
      totalTimeSpent: simulations.reduce((sum, s) => sum + s.duration, 0),
      sessionsPerModule: {},
      scoreProgression: []
    };

    // Count sessions per module
    simulations.forEach(sim => {
      analytics.sessionsPerModule[sim.simulationId] = 
        (analytics.sessionsPerModule[sim.simulationId] || 0) + 1;
    });

    // Build score progression
    const allResults = [
      ...simulations.map(s => ({ date: s.timestamp, score: s.score })),
      ...okapResults.map(o => ({ date: o.timestamp, score: o.score }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    analytics.scoreProgression = allResults.slice(-50); // Last 50 entries

    // Build export object
    const exportData: ExportedData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: userData,
      simulations,
      okapResults,
      preferences,
      analytics
    };

    // Log successful export
    await audit.adminAction('data_export_completed', { 
      userId: user.uid,
      simulationCount: simulations.length,
      okapCount: okapResults.length
    });

    return exportData;
  } catch (error) {
    console.error('Data export failed:', error);
    await audit.error('data_export', 'Export failed', { error: String(error) });
    throw error;
  }
}

/**
 * Download exported data as JSON file
 */
export async function downloadUserData(): Promise<void> {
  const data = await exportUserData();
  if (!data) {
    throw new Error('Failed to export data');
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ophthalmosim-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV (simplified format)
 */
export async function downloadUserDataCSV(): Promise<void> {
  const data = await exportUserData();
  if (!data) {
    throw new Error('Failed to export data');
  }

  // Create CSV content
  const lines: string[] = [];
  
  // Header
  lines.push('OphthalmoSim+ Data Export');
  lines.push(`Export Date: ${data.exportDate}`);
  lines.push('');
  
  // User info
  lines.push('USER PROFILE');
  lines.push(`Name,${data.user.fullName}`);
  lines.push(`Specialty,${data.user.specialty}`);
  lines.push(`Created,${data.user.createdAt}`);
  lines.push(`Total Sessions,${data.user.stats.totalSessions}`);
  lines.push(`Average Score,${data.user.stats.averageScore}`);
  lines.push(`Highest Score,${data.user.stats.highestScore}`);
  lines.push('');
  
  // Simulations
  lines.push('SIMULATION RESULTS');
  lines.push('Date,Module,Score,Accuracy,Duration');
  data.simulations.forEach(sim => {
    lines.push(`${sim.timestamp},${sim.simulationId},${sim.score},${sim.accuracy},${sim.duration}`);
  });
  lines.push('');
  
  // OKAP Results
  lines.push('OKAP GAME RESULTS');
  lines.push('Date,Game,Score,Accuracy,Correct,Total');
  data.okapResults.forEach(okap => {
    lines.push(`${okap.timestamp},${okap.gameId},${okap.score},${okap.accuracy},${okap.correct},${okap.total}`);
  });

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ophthalmosim-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  exportUserData,
  downloadUserData,
  downloadUserDataCSV
};
