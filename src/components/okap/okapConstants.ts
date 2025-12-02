/**
 * =============================================================================
 * OKAP RAPID-FIRE KNOWLEDGE GAMES - CONSTANTS & DATA
 * =============================================================================
 * Version: 1.0.0
 * 
 * 20 Knowledge Games for OKAP Exam Preparation
 * Organized into 5 Modules:
 * - Optics (O1-O5)
 * - Neuro-Ophthalmology (N1-N5)
 * - Glaucoma & Pharmacology (P1-P4)
 * - Classifications & Rules (C1-C4)
 * - Visual Acuity & Emergency (E1-E2)
 * =============================================================================
 */

// =============================================================================
// GAME TIMING CONFIGURATION
// =============================================================================
export const OKAP_TIMING = {
  QUESTION_TIME_MS: 15000,      // 15 seconds per question
  FEEDBACK_DELAY_MS: 800,       // Feedback display duration
  TRANSITION_MS: 300,           // Animation transitions
  COUNTDOWN_START: 3,           // 3-2-1 countdown
  BONUS_TIME_THRESHOLD_MS: 5000 // Bonus points if answered within 5s
} as const;

// =============================================================================
// SCORING CONFIGURATION
// =============================================================================
export const OKAP_SCORING = {
  CORRECT_BASE: 100,
  SPEED_BONUS_MAX: 50,          // Max bonus for fast answers
  STREAK_MULTIPLIER: 0.1,       // 10% bonus per streak
  MAX_STREAK_BONUS: 2.0,        // Max 2x multiplier
  WRONG_PENALTY: 0,             // No negative scoring
  PERFECT_GAME_BONUS: 500       // Bonus for 100% accuracy
} as const;

// =============================================================================
// GRADE THRESHOLDS
// =============================================================================
export const OKAP_GRADES = {
  S: { min: 95, color: '#E5E4E2', label: 'S - Platinum' },
  A: { min: 85, color: '#fbbf24', label: 'A - Gold' },
  B: { min: 70, color: '#34d399', label: 'B - Silver' },
  C: { min: 50, color: '#60a5fa', label: 'C - Bronze' },
  D: { min: 0, color: '#f87171', label: 'D - Needs Practice' }
} as const;

// =============================================================================
// GAME MECHANIC TYPES
// =============================================================================
export type GameMechanic = 
  | 'equation_completion'      // O1: Fill in missing variable
  | 'conceptual_sort'          // O2: Sort into categories
  | 'calculation_direction'    // O3: Calculate + identify direction
  | 'pairing_matching'         // O4, P2: Match pairs
  | 'quick_calculation'        // O5: Simple calculation
  | 'drag_drop_triad'          // N1: Select 3 symptoms
  | 'anatomical_mapping'       // N2: Interactive visual pathway
  | 'true_false'               // N3: Rapid T/F
  | 'multi_choice'             // N4: Multiple choice
  | 'image_classification'     // N5, C2: Classify images
  | 'two_column_sort'          // P1: Sort into 2 columns
  | 'case_exclusion'           // P3: Identify contraindicated
  | 'classification'           // P4: Classify by effect
  | 'sequencing'               // C1, E2: Order items
  | 'opposite_pairing'         // C3: Match opposites
  | 'case_classification'      // C4: Classify case
  | 'triple_equivalent';       // E1: Match 3 equivalents

// =============================================================================
// MODULE DEFINITIONS
// =============================================================================
export interface OKAPModule {
  id: string;
  name: string;
  nameHe: string;
  icon: string;
  color: string;
  gradient: string;
  gameCount: number;
  description: string;
  descriptionHe: string;
}

export const OKAP_MODULES: Record<string, OKAPModule> = {
  OPTICS: {
    id: 'optics',
    name: 'Optics & Calculations',
    nameHe: 'אופטיקה וחישובים',
    icon: '🔬',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    gameCount: 5,
    description: 'Vergence, Vertex Distance, Prentice Rule, SE, Magnification',
    descriptionHe: 'נוסחאות ורג\'נס, מרחק ורטקס, כלל פרנטיס, שקילות ספרית, הגדלה'
  },
  NEURO: {
    id: 'neuro',
    name: 'Neuro-Ophthalmology',
    nameHe: 'נוירו-אופתלמולוגיה',
    icon: '🧠',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    gameCount: 5,
    description: 'Horner\'s, Visual Pathway, CN III, EOMs, VF Defects',
    descriptionHe: 'הורנר, מסלול ראייה, עצב III, שרירי עין, פגמי שדה ראייה'
  },
  PHARMA: {
    id: 'pharma',
    name: 'Glaucoma & Pharmacology',
    nameHe: 'גלאוקומה ופרמקולוגיה',
    icon: '💊',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    gameCount: 4,
    description: 'Drug MoA, Side Effects, Contraindications, Pupil Effects',
    descriptionHe: 'מנגנוני פעולה, תופעות לוואי, התוויות נגד, השפעה על אישון'
  },
  CLASSIFICATIONS: {
    id: 'classifications',
    name: 'Classifications & Rules',
    nameHe: 'סיווגים וכללים',
    icon: '📜',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    gameCount: 4,
    description: 'ISNT Rule, Gonioscopy Grades, DR Classification',
    descriptionHe: 'כלל ISNT, דירוגי גוניוסקופיה, סיווג רטינופתיה סוכרתית'
  },
  EMERGENCY: {
    id: 'emergency',
    name: 'VA & Emergency',
    nameHe: 'חדות ראייה וחירום',
    icon: '🚨',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    gameCount: 2,
    description: 'VA Conversions, Chemical Burn Protocol',
    descriptionHe: 'המרות חדות ראייה, פרוטוקול כוויה כימית'
  }
};

// =============================================================================
// GAME DEFINITIONS
// =============================================================================
export interface OKAPGame {
  id: string;
  moduleId: string;
  name: string;
  nameHe: string;
  code: string;
  mechanic: GameMechanic;
  okapFact: string;
  description: string;
  descriptionHe: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  questionCount: number;
  icon: string;
}

export const OKAP_GAMES: OKAPGame[] = [
  // ==========================================================================
  // MODULE 1: OPTICS (O1-O5)
  // ==========================================================================
  {
    id: 'O1',
    moduleId: 'optics',
    name: 'Vergence Shift Machine',
    nameHe: 'מכונת ההסחה הוורג\'נטית',
    code: 'OPT-VRG',
    mechanic: 'equation_completion',
    okapFact: 'Vergence Formula: U + D = V',
    description: 'Complete the vergence equation with the missing variable',
    descriptionHe: 'השלם את משוואת הוורג\'נס עם המשתנה החסר',
    difficulty: 'Medium',
    questionCount: 10,
    icon: '🔄'
  },
  {
    id: 'O2',
    moduleId: 'optics',
    name: 'Vertex Distance Race',
    nameHe: 'מרוץ ה-Vertex Distance',
    code: 'OPT-VTX',
    mechanic: 'conceptual_sort',
    okapFact: 'Effective Power changes with vertex distance',
    description: 'Sort lens movements by their effect on power',
    descriptionHe: 'מיין תנועות עדשה לפי השפעתן על העוצמה',
    difficulty: 'Hard',
    questionCount: 8,
    icon: '📏'
  },
  {
    id: 'O3',
    moduleId: 'optics',
    name: "Prentice's Rule Roulette",
    nameHe: 'הרולטה של פרנטיס',
    code: 'OPT-PRT',
    mechanic: 'calculation_direction',
    okapFact: 'Prentice Rule: P = F × D',
    description: 'Calculate prism and identify base direction',
    descriptionHe: 'חשב פריזמה וזהה כיוון בסיס',
    difficulty: 'Hard',
    questionCount: 10,
    icon: '🎯'
  },
  {
    id: 'O4',
    moduleId: 'optics',
    name: 'Spherical Equivalent',
    nameHe: 'שקילות ספרית',
    code: 'OPT-SEQ',
    mechanic: 'pairing_matching',
    okapFact: 'SE = sphere + ½ cylinder',
    description: 'Match prescriptions to their spherical equivalent',
    descriptionHe: 'התאם מרשמים לשקילות הספרית שלהם',
    difficulty: 'Medium',
    questionCount: 10,
    icon: '👓'
  },
  {
    id: 'O5',
    moduleId: 'optics',
    name: 'Spectacle Zoom',
    nameHe: 'זום המשקפיים',
    code: 'OPT-ZOM',
    mechanic: 'quick_calculation',
    okapFact: 'Magnification: ~2% per diopter',
    description: 'Calculate spectacle magnification percentage',
    descriptionHe: 'חשב אחוז הגדלה של משקפיים',
    difficulty: 'Easy',
    questionCount: 10,
    icon: '🔍'
  },

  // ==========================================================================
  // MODULE 2: NEURO-OPHTHALMOLOGY (N1-N5)
  // ==========================================================================
  {
    id: 'N1',
    moduleId: 'neuro',
    name: 'Triad Identification',
    nameHe: 'זיהוי הטריאדה',
    code: 'NRO-TRD',
    mechanic: 'drag_drop_triad',
    okapFact: "Horner's Triad: Ptosis, Miosis, Anhidrosis",
    description: 'Drag 3 symptoms to identify the syndrome',
    descriptionHe: 'גרור 3 סימפטומים לזיהוי התסמונת',
    difficulty: 'Medium',
    questionCount: 8,
    icon: '🎭'
  },
  {
    id: 'N2',
    moduleId: 'neuro',
    name: 'Visual Pathway Puzzle',
    nameHe: 'פאזל נתיב הראייה',
    code: 'NRO-VPP',
    mechanic: 'anatomical_mapping',
    okapFact: 'Retrochiasmal lesions & RAPD correlation',
    description: 'Place lesion and determine RAPD presence',
    descriptionHe: 'מקם נגע וקבע נוכחות RAPD',
    difficulty: 'Expert',
    questionCount: 8,
    icon: '🗺️'
  },
  {
    id: 'N3',
    moduleId: 'neuro',
    name: 'The CN III Norm',
    nameHe: 'הנורמה של CN III',
    code: 'NRO-CN3',
    mechanic: 'true_false',
    okapFact: 'CN III: Motor vs Parasympathetic functions',
    description: 'Rapid true/false on CN III palsy implications',
    descriptionHe: 'נכון/לא נכון מהיר על שיתוק עצב III',
    difficulty: 'Medium',
    questionCount: 12,
    icon: '👁️'
  },
  {
    id: 'N4',
    moduleId: 'neuro',
    name: 'Who Moves Whom?',
    nameHe: 'מי מזיז את מי?',
    code: 'NRO-EOM',
    mechanic: 'multi_choice',
    okapFact: 'EOM Innervation: LR6 SO4 R3',
    description: 'Identify EOM primary actions in different positions',
    descriptionHe: 'זהה פעולות עיקריות של שרירי עין',
    difficulty: 'Hard',
    questionCount: 10,
    icon: '↔️'
  },
  {
    id: 'N5',
    moduleId: 'neuro',
    name: 'VF Defect Diagnosis',
    nameHe: 'אבחון פגמי שדה ראייה',
    code: 'NRO-VFD',
    mechanic: 'image_classification',
    okapFact: 'Classic VF patterns: Bitemporal, Arcuate, etc.',
    description: 'Match VF defect pattern to diagnosis',
    descriptionHe: 'התאם דפוס פגם שדה ראייה לאבחנה',
    difficulty: 'Hard',
    questionCount: 10,
    icon: '📊'
  },

  // ==========================================================================
  // MODULE 3: GLAUCOMA & PHARMACOLOGY (P1-P4)
  // ==========================================================================
  {
    id: 'P1',
    moduleId: 'pharma',
    name: 'MoA: Who Against Whom?',
    nameHe: 'מי נגד מי? – מנגנון הפעולה',
    code: 'PHA-MOA',
    mechanic: 'two_column_sort',
    okapFact: 'Glaucoma drugs: Production vs Outflow',
    description: 'Sort drug classes by mechanism',
    descriptionHe: 'מיין קבוצות תרופות לפי מנגנון',
    difficulty: 'Medium',
    questionCount: 10,
    icon: '💧'
  },
  {
    id: 'P2',
    moduleId: 'pharma',
    name: 'Signature Symptom',
    nameHe: 'הסימפטום הייחודי',
    code: 'PHA-SIG',
    mechanic: 'pairing_matching',
    okapFact: 'Unique side effects per drug class',
    description: 'Match rare side effects to drug families',
    descriptionHe: 'התאם תופעות לוואי נדירות למשפחות תרופות',
    difficulty: 'Hard',
    questionCount: 10,
    icon: '⚠️'
  },
  {
    id: 'P3',
    moduleId: 'pharma',
    name: 'Systemic Risk Equation',
    nameHe: 'משוואת הסיכון הסיסטמי',
    code: 'PHA-CTI',
    mechanic: 'case_exclusion',
    okapFact: 'Systemic contraindications (BBs & Asthma)',
    description: 'Identify absolutely contraindicated drug',
    descriptionHe: 'זהה תרופה עם התווית נגד מוחלטת',
    difficulty: 'Expert',
    questionCount: 8,
    icon: '🚫'
  },
  {
    id: 'P4',
    moduleId: 'pharma',
    name: 'Miosis or Mydriasis?',
    nameHe: 'מיוזיס או מידריאזיס?',
    code: 'PHA-PUP',
    mechanic: 'classification',
    okapFact: 'Pupil effects & autonomic alignment',
    description: 'Classify treatments by pupil effect',
    descriptionHe: 'סווג טיפולים לפי השפעה על אישון',
    difficulty: 'Medium',
    questionCount: 10,
    icon: '⚫'
  },

  // ==========================================================================
  // MODULE 4: CLASSIFICATIONS & RULES (C1-C4)
  // ==========================================================================
  {
    id: 'C1',
    moduleId: 'classifications',
    name: 'The ISNT Series',
    nameHe: 'סדרת ה-ISNT',
    code: 'CLS-ISN',
    mechanic: 'sequencing',
    okapFact: 'ISNT Rule: I > S > N > T',
    description: 'Sequence the neuroretinal rim thickness',
    descriptionHe: 'סדר את עובי השפה הנוירורטינלית',
    difficulty: 'Easy',
    questionCount: 6,
    icon: '📐'
  },
  {
    id: 'C2',
    moduleId: 'classifications',
    name: 'T-thinnest Exception',
    nameHe: 'החריג הקליני של T-thinnest',
    code: 'CLS-TTH',
    mechanic: 'image_classification',
    okapFact: 'ISNT variations and clinical preference',
    description: 'Select the most relevant rule for disc profile',
    descriptionHe: 'בחר את הכלל הרלוונטי ביותר לפרופיל הדיסק',
    difficulty: 'Expert',
    questionCount: 6,
    icon: '🔎'
  },
  {
    id: 'C3',
    moduleId: 'classifications',
    name: 'Gonioscopy Contradiction',
    nameHe: 'הניגוד הגוניוסקופי',
    code: 'CLS-GON',
    mechanic: 'opposite_pairing',
    okapFact: 'Shaffer vs Scheie: 4=Open vs IV=Closed',
    description: 'Match grades to angle descriptions',
    descriptionHe: 'התאם דירוגים לתיאורי זווית',
    difficulty: 'Hard',
    questionCount: 8,
    icon: '🔀'
  },
  {
    id: 'C4',
    moduleId: 'classifications',
    name: 'DR Classification',
    nameHe: 'סיווג רטינופתיה סוכרתית',
    code: 'CLS-DRC',
    mechanic: 'case_classification',
    okapFact: 'NPDR Severity: Mild/Moderate/Severe',
    description: 'Match clinical findings to DR severity',
    descriptionHe: 'התאם ממצאים קליניים לחומרת DR',
    difficulty: 'Medium',
    questionCount: 10,
    icon: '🩺'
  },

  // ==========================================================================
  // MODULE 5: VA & EMERGENCY (E1-E2)
  // ==========================================================================
  {
    id: 'E1',
    moduleId: 'emergency',
    name: 'Olympic VA Converter',
    nameHe: 'ממיר חדות הראייה האולימפית',
    code: 'EMR-VAC',
    mechanic: 'triple_equivalent',
    okapFact: 'LogMAR/Fractional/Decimal conversions',
    description: 'Match VA value to all 3 equivalents',
    descriptionHe: 'התאם ערך חדות ראייה ל-3 שקילויות',
    difficulty: 'Medium',
    questionCount: 10,
    icon: '📈'
  },
  {
    id: 'E2',
    moduleId: 'emergency',
    name: 'Chemical Burn Protocol',
    nameHe: 'פרוטוקול כוויה כימית',
    code: 'EMR-CHM',
    mechanic: 'sequencing',
    okapFact: 'Emergency wash protocol order',
    description: 'Sequence the emergency steps correctly',
    descriptionHe: 'סדר את שלבי החירום בסדר הנכון',
    difficulty: 'Easy',
    questionCount: 6,
    icon: '🧪'
  }
];

// =============================================================================
// VISUAL ACUITY CONVERSION TABLE (For E1)
// =============================================================================
export interface VAConversion {
  us20: string;      // US 20ft notation
  metric6: string;   // Metric 6m notation
  decimal: number;   // Decimal notation
  logMAR: number;    // LogMAR value
}

export const VA_CONVERSION_TABLE: VAConversion[] = [
  { us20: '20/10', metric6: '6/3', decimal: 2.00, logMAR: -0.30 },
  { us20: '20/16', metric6: '6/5', decimal: 1.25, logMAR: -0.10 },
  { us20: '20/20', metric6: '6/6', decimal: 1.00, logMAR: 0.00 },
  { us20: '20/25', metric6: '6/7.5', decimal: 0.80, logMAR: 0.10 },
  { us20: '20/30', metric6: '6/9', decimal: 0.67, logMAR: 0.18 },
  { us20: '20/40', metric6: '6/12', decimal: 0.50, logMAR: 0.30 },
  { us20: '20/50', metric6: '6/15', decimal: 0.40, logMAR: 0.40 },
  { us20: '20/60', metric6: '6/18', decimal: 0.33, logMAR: 0.48 },
  { us20: '20/80', metric6: '6/24', decimal: 0.25, logMAR: 0.60 },
  { us20: '20/100', metric6: '6/30', decimal: 0.20, logMAR: 0.70 },
  { us20: '20/200', metric6: '6/60', decimal: 0.10, logMAR: 1.00 },
  { us20: '20/400', metric6: '6/120', decimal: 0.05, logMAR: 1.30 }
];

// =============================================================================
// CHEMICAL BURN PROTOCOL STEPS (For E2)
// =============================================================================
export const CHEMICAL_BURN_STEPS = [
  { id: 1, step: 'Anesthetize', stepHe: 'הרדמה מקומית', order: 1 },
  { id: 2, step: '30-min Irrigation', stepHe: 'שטיפה 30 דקות', order: 2 },
  { id: 3, step: 'Eyelid Eversion', stepHe: 'היפוך עפעפיים', order: 3 },
  { id: 4, step: 'pH Check', stepHe: 'בדיקת pH', order: 4 },
  { id: 5, step: 'Urgent Referral', stepHe: 'הפניה דחופה', order: 5 }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getGamesByModule(moduleId: string): OKAPGame[] {
  return OKAP_GAMES.filter(game => game.moduleId === moduleId);
}

export function getGameById(gameId: string): OKAPGame | undefined {
  return OKAP_GAMES.find(game => game.id === gameId);
}

export function getModuleById(moduleId: string): OKAPModule | undefined {
  return Object.values(OKAP_MODULES).find(m => m.id === moduleId);
}

export function calculateGrade(percentage: number): keyof typeof OKAP_GRADES {
  if (percentage >= OKAP_GRADES.S.min) return 'S';
  if (percentage >= OKAP_GRADES.A.min) return 'A';
  if (percentage >= OKAP_GRADES.B.min) return 'B';
  if (percentage >= OKAP_GRADES.C.min) return 'C';
  return 'D';
}

export function calculateScore(
  correct: number, 
  total: number, 
  avgTimeMs: number, 
  streak: number
): number {
  const baseScore = correct * OKAP_SCORING.CORRECT_BASE;
  
  // Speed bonus (faster = more points)
  const speedFactor = Math.max(0, 1 - (avgTimeMs / OKAP_TIMING.QUESTION_TIME_MS));
  const speedBonus = Math.round(speedFactor * OKAP_SCORING.SPEED_BONUS_MAX * correct);
  
  // Streak bonus
  const streakMultiplier = Math.min(
    1 + (streak * OKAP_SCORING.STREAK_MULTIPLIER),
    OKAP_SCORING.MAX_STREAK_BONUS
  );
  
  // Perfect game bonus
  const perfectBonus = correct === total ? OKAP_SCORING.PERFECT_GAME_BONUS : 0;
  
  return Math.round((baseScore + speedBonus) * streakMultiplier + perfectBonus);
}
