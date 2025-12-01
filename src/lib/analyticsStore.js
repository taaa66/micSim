/**
 * Analytics Store V1.0
 * ====================
 * Comprehensive tracking for training sessions, skills, and progress
 */
import { writable, derived, get } from 'svelte/store';
import { currentUser } from './authStore.js';

// Storage key
const ANALYTICS_KEY = 'ophthalmo_analytics_v1';

// Skill categories mapped to modules
const SKILL_MAP = {
  'capsulorhexis': { skill: 'precision', category: 'Anterior Segment' },
  'corneal-tunnel': { skill: 'depth_control', category: 'Anterior Segment' },
  'corneal-suture': { skill: 'suturing', category: 'Anterior Segment' },
  'corneal-arc': { skill: 'cutting', category: 'Anterior Segment' },
  'gas-injection': { skill: 'pressure_control', category: 'Posterior Segment' },
  'hydrodissection': { skill: 'fluid_dynamics', category: 'Anterior Segment' },
  'tissue-grasping': { skill: 'dexterity', category: 'General' },
  'needle-angle': { skill: 'angle_precision', category: 'General' },
  'micro-tremor': { skill: 'stability', category: 'Motor Control' },
  'suture-tension': { skill: 'tension_control', category: 'Suturing' },
  'reflex-floaters': { skill: 'reaction_time', category: 'Motor Control' },
  'game-tremor-shield': { skill: 'stability', category: 'Motor Control' },
  'game-vector-race': { skill: 'speed', category: 'Motor Control' },
  'game-nano-grip': { skill: 'dexterity', category: 'Motor Control' }
};

// Skill definitions for radar chart
export const SKILLS = [
  { id: 'precision', name: 'דיוק', icon: '🎯', color: '#34d399' },
  { id: 'stability', name: 'יציבות', icon: '✋', color: '#60a5fa' },
  { id: 'speed', name: 'מהירות', icon: '⚡', color: '#fbbf24' },
  { id: 'dexterity', name: 'זריזות', icon: '🤲', color: '#f472b6' },
  { id: 'depth_control', name: 'שליטה בעומק', icon: '📏', color: '#a78bfa' },
  { id: 'pressure_control', name: 'שליטה בלחץ', icon: '💨', color: '#fb7185' }
];

// Achievement definitions
export const ACHIEVEMENTS = [
  // Beginner
  { id: 'first_session', name: 'צעד ראשון', desc: 'השלמת אימון ראשון', icon: '🎯', tier: 'bronze', condition: (s) => s.totalSessions >= 1 },
  { id: 'getting_started', name: 'בדרך הנכונה', desc: 'השלמת 5 אימונים', icon: '🚀', tier: 'bronze', condition: (s) => s.totalSessions >= 5 },
  { id: 'consistent', name: 'עקבי', desc: 'אימון 3 ימים רצופים', icon: '📅', tier: 'bronze', condition: (s) => s.streak >= 3 },
  
  // Intermediate
  { id: 'dedicated', name: 'מסור', desc: 'השלמת 25 אימונים', icon: '💪', tier: 'silver', condition: (s) => s.totalSessions >= 25 },
  { id: 'precision_master', name: 'אמן הדיוק', desc: 'ציון 90+ ב-5 אימונים', icon: '🎯', tier: 'silver', condition: (s) => s.highScoreSessions >= 5 },
  { id: 'week_warrior', name: 'לוחם השבוע', desc: 'אימון 7 ימים רצופים', icon: '🔥', tier: 'silver', condition: (s) => s.streak >= 7 },
  { id: 'explorer', name: 'חוקר', desc: 'ניסית 5 מודולים שונים', icon: '🗺️', tier: 'silver', condition: (s) => s.uniqueModules >= 5 },
  
  // Advanced
  { id: 'expert', name: 'מומחה', desc: 'השלמת 100 אימונים', icon: '👨‍⚕️', tier: 'gold', condition: (s) => s.totalSessions >= 100 },
  { id: 'perfectionist', name: 'פרפקציוניסט', desc: 'ציון 95+ ב-10 אימונים', icon: '💎', tier: 'gold', condition: (s) => s.perfectSessions >= 10 },
  { id: 'month_master', name: 'שליט החודש', desc: 'אימון 30 ימים רצופים', icon: '👑', tier: 'gold', condition: (s) => s.streak >= 30 },
  { id: 'all_rounder', name: 'רב-תחומי', desc: 'ניסית את כל המודולים', icon: '🌟', tier: 'gold', condition: (s) => s.uniqueModules >= 11 },
  
  // Legendary
  { id: 'legend', name: 'אגדה', desc: 'השלמת 500 אימונים', icon: '🏆', tier: 'platinum', condition: (s) => s.totalSessions >= 500 },
  { id: 'surgeon_elite', name: 'מנתח עילית', desc: 'ממוצע 90+ ב-50 אימונים', icon: '⭐', tier: 'platinum', condition: (s) => s.totalSessions >= 50 && s.averageScore >= 90 }
];

// Load analytics from localStorage
function loadAnalytics() {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : getDefaultAnalytics();
  } catch {
    return getDefaultAnalytics();
  }
}

// Default analytics structure
function getDefaultAnalytics() {
  return {
    sessions: [],
    skills: {},
    dailyActivity: {},
    streak: 0,
    lastActiveDate: null,
    achievements: []
  };
}

// Save analytics
function saveAnalytics(data) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

// Analytics store
export const analytics = writable(loadAnalytics());

// Subscribe to save
analytics.subscribe(data => {
  saveAnalytics(data);
});

/**
 * Record a training session
 */
export function recordSession(moduleId, score, duration, details = {}) {
  const user = get(currentUser);
  if (!user) return;

  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  
  analytics.update(data => {
    // Create session record
    const session = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      moduleId,
      score: Math.round(score),
      duration: Math.round(duration),
      timestamp: now.toISOString(),
      details: {
        accuracy: details.accuracy || 0,
        speed: details.speed || 0,
        consistency: details.consistency || 0,
        ...details
      }
    };
    
    // Add to sessions (keep last 100)
    data.sessions = [session, ...data.sessions].slice(0, 100);
    
    // Update skill scores
    const skillInfo = SKILL_MAP[moduleId];
    if (skillInfo) {
      if (!data.skills[skillInfo.skill]) {
        data.skills[skillInfo.skill] = { scores: [], average: 0 };
      }
      data.skills[skillInfo.skill].scores.push(score);
      // Keep last 20 scores per skill
      data.skills[skillInfo.skill].scores = data.skills[skillInfo.skill].scores.slice(-20);
      // Calculate weighted average (recent scores weighted more)
      const scores = data.skills[skillInfo.skill].scores;
      let weightedSum = 0;
      let weightSum = 0;
      scores.forEach((s, i) => {
        const weight = i + 1; // More recent = higher weight
        weightedSum += s * weight;
        weightSum += weight;
      });
      data.skills[skillInfo.skill].average = Math.round(weightedSum / weightSum);
    }
    
    // Update daily activity
    if (!data.dailyActivity[dateKey]) {
      data.dailyActivity[dateKey] = { sessions: 0, totalScore: 0, modules: [] };
    }
    data.dailyActivity[dateKey].sessions++;
    data.dailyActivity[dateKey].totalScore += score;
    if (!data.dailyActivity[dateKey].modules.includes(moduleId)) {
      data.dailyActivity[dateKey].modules.push(moduleId);
    }
    
    // Update streak
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    
    if (data.lastActiveDate === yesterdayKey || data.lastActiveDate === dateKey) {
      if (data.lastActiveDate !== dateKey) {
        data.streak++;
      }
    } else if (data.lastActiveDate !== dateKey) {
      data.streak = 1;
    }
    data.lastActiveDate = dateKey;
    
    // Check achievements
    const stats = calculateStats(data);
    ACHIEVEMENTS.forEach(achievement => {
      if (!data.achievements.includes(achievement.id) && achievement.condition(stats)) {
        data.achievements.push(achievement.id);
        // Could trigger notification here
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
      }
    });
    
    return data;
  });
}

/**
 * Calculate comprehensive stats
 */
function calculateStats(data) {
  const sessions = data.sessions || [];
  const uniqueModules = new Set(sessions.map(s => s.moduleId)).size;
  const highScoreSessions = sessions.filter(s => s.score >= 90).length;
  const perfectSessions = sessions.filter(s => s.score >= 95).length;
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  
  return {
    totalSessions: sessions.length,
    uniqueModules,
    highScoreSessions,
    perfectSessions,
    averageScore: sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0,
    streak: data.streak || 0
  };
}

/**
 * Get skill scores for radar chart
 */
export const skillScores = derived(analytics, $data => {
  return SKILLS.map(skill => ({
    ...skill,
    score: $data.skills[skill.id]?.average || 0
  }));
});

/**
 * Get progress data for charts (last 30 days)
 */
export const progressData = derived(analytics, $data => {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayData = $data.dailyActivity[dateKey];
    
    days.push({
      date: dateKey,
      label: date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      sessions: dayData?.sessions || 0,
      averageScore: dayData ? Math.round(dayData.totalScore / dayData.sessions) : null,
      modules: dayData?.modules?.length || 0
    });
  }
  
  return days;
});

/**
 * Get recent sessions
 */
export const recentSessions = derived(analytics, $data => {
  return ($data.sessions || []).slice(0, 10).map(session => ({
    ...session,
    moduleName: getModuleName(session.moduleId),
    category: SKILL_MAP[session.moduleId]?.category || 'General',
    timeAgo: getTimeAgo(session.timestamp)
  }));
});

/**
 * Get earned achievements
 */
export const earnedAchievements = derived(analytics, $data => {
  return ACHIEVEMENTS.filter(a => ($data.achievements || []).includes(a.id));
});

/**
 * Get next achievements to unlock
 */
export const nextAchievements = derived(analytics, $data => {
  const stats = calculateStats($data);
  return ACHIEVEMENTS
    .filter(a => !($data.achievements || []).includes(a.id))
    .map(a => ({
      ...a,
      progress: getAchievementProgress(a, stats)
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
});

/**
 * Get comprehensive stats
 */
export const stats = derived(analytics, $data => calculateStats($data));

/**
 * Get insights and recommendations
 */
export const insights = derived([analytics, skillScores], ([$data, $skills]) => {
  const result = [];
  const sessions = $data.sessions || [];
  
  if (sessions.length === 0) {
    return [{ type: 'info', icon: '👋', message: 'ברוך הבא! התחל את האימון הראשון שלך' }];
  }
  
  // Find weakest skill
  const weakestSkill = [...$skills].sort((a, b) => a.score - b.score)[0];
  if (weakestSkill && weakestSkill.score < 70 && weakestSkill.score > 0) {
    result.push({
      type: 'improve',
      icon: '📈',
      message: `שפר את ה${weakestSkill.name} שלך - נסה לתרגל עוד`,
      action: weakestSkill.id
    });
  }
  
  // Streak motivation
  const streak = $data.streak || 0;
  if (streak >= 3) {
    result.push({
      type: 'streak',
      icon: '🔥',
      message: `${streak} ימים רצופים! המשך כך!`
    });
  }
  
  // Recent improvement
  if (sessions.length >= 5) {
    const recent5 = sessions.slice(0, 5);
    const older5 = sessions.slice(5, 10);
    if (older5.length > 0) {
      const recentAvg = recent5.reduce((s, x) => s + x.score, 0) / recent5.length;
      const olderAvg = older5.reduce((s, x) => s + x.score, 0) / older5.length;
      const improvement = recentAvg - olderAvg;
      
      if (improvement > 5) {
        result.push({
          type: 'success',
          icon: '📊',
          message: `התקדמות מעולה! +${Math.round(improvement)} נקודות בממוצע`
        });
      }
    }
  }
  
  // Best skill
  const bestSkill = [...$skills].sort((a, b) => b.score - a.score)[0];
  if (bestSkill && bestSkill.score >= 80) {
    result.push({
      type: 'strength',
      icon: '💪',
      message: `${bestSkill.name} הוא החוזק שלך (${bestSkill.score}%)!`
    });
  }
  
  return result.slice(0, 4);
});

// Helper: Get module display name
function getModuleName(moduleId) {
  const names = {
    'capsulorhexis': 'קפסולורקסיס',
    'corneal-tunnel': 'מנהרה קרנית',
    'corneal-suture': 'תפירה קרנית',
    'corneal-arc': 'חיתוך קשתי',
    'gas-injection': 'הזרקת גז',
    'hydrodissection': 'הידרודיסקציה',
    'tissue-grasping': 'אחיזת רקמה',
    'needle-angle': 'זווית מחט',
    'micro-tremor': 'שליטה ברעד',
    'suture-tension': 'מתיחת תפר',
    'reflex-floaters': 'רפלקס צפים',
    'game-tremor-shield': 'Tremor Shield',
    'game-vector-race': 'Vector Race',
    'game-nano-grip': 'Nano Grip'
  };
  return names[moduleId] || moduleId;
}

// Helper: Get time ago string
function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return then.toLocaleDateString('he-IL');
}

// Helper: Get achievement progress percentage
function getAchievementProgress(achievement, stats) {
  // This is a simplified progress calculation
  // You could make this more sophisticated
  if (achievement.id.includes('session')) {
    const target = parseInt(achievement.desc.match(/\d+/)?.[0] || 1);
    return Math.min(100, Math.round((stats.totalSessions / target) * 100));
  }
  if (achievement.id.includes('streak') || achievement.id.includes('week') || achievement.id.includes('month')) {
    const target = parseInt(achievement.desc.match(/\d+/)?.[0] || 3);
    return Math.min(100, Math.round((stats.streak / target) * 100));
  }
  return 0;
}
