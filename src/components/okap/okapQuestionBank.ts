/**
 * OKAP Question Bank - Part 1: Optics & Neuro Questions
 */

// =============================================================================
// O1: VERGENCE QUESTIONS (U + D = V)
// =============================================================================
export interface VergenceQuestion {
  id: string;
  u?: number;  // Object vergence (diopters)
  d?: number;  // Lens power (diopters)
  v?: number;  // Image vergence (diopters)
  missing: 'u' | 'd' | 'v';
  answer: number;
}

export const VERGENCE_QUESTIONS: VergenceQuestion[] = [
  { id: 'v1', u: -2, d: 5, missing: 'v', answer: 3 },
  { id: 'v2', u: -4, d: 6, missing: 'v', answer: 2 },
  { id: 'v3', u: -1, v: 4, missing: 'd', answer: 5 },
  { id: 'v4', d: 10, v: 5, missing: 'u', answer: -5 },
  { id: 'v5', u: -3, d: 8, missing: 'v', answer: 5 },
  { id: 'v6', u: -5, v: 0, missing: 'd', answer: 5 },
  { id: 'v7', d: 4, v: 2, missing: 'u', answer: -2 },
  { id: 'v8', u: -2.5, d: 4, missing: 'v', answer: 1.5 },
  { id: 'v9', u: -6, v: -2, missing: 'd', answer: 4 },
  { id: 'v10', d: 12, v: 8, missing: 'u', answer: -4 }
];

// =============================================================================
// O2: VERTEX DISTANCE QUESTIONS
// =============================================================================
export interface VertexQuestion {
  id: string;
  scenario: string;
  scenarioHe: string;
  lensType: '+' | '-';
  movement: 'forward' | 'backward';
  effect: 'strengthens' | 'weakens';
}

export const VERTEX_QUESTIONS: VertexQuestion[] = [
  { id: 'vx1', scenario: 'Moving +10D lens forward', scenarioHe: 'הזזת עדשת +10D קדימה', lensType: '+', movement: 'forward', effect: 'strengthens' },
  { id: 'vx2', scenario: 'Moving -8D lens forward', scenarioHe: 'הזזת עדשת -8D קדימה', lensType: '-', movement: 'forward', effect: 'weakens' },
  { id: 'vx3', scenario: 'Moving +6D lens backward', scenarioHe: 'הזזת עדשת +6D אחורה', lensType: '+', movement: 'backward', effect: 'weakens' },
  { id: 'vx4', scenario: 'Moving -12D lens backward', scenarioHe: 'הזזת עדשת -12D אחורה', lensType: '-', movement: 'backward', effect: 'strengthens' },
  { id: 'vx5', scenario: 'Moving +15D lens forward', scenarioHe: 'הזזת עדשת +15D קדימה', lensType: '+', movement: 'forward', effect: 'strengthens' },
  { id: 'vx6', scenario: 'Moving -5D lens forward', scenarioHe: 'הזזת עדשת -5D קדימה', lensType: '-', movement: 'forward', effect: 'weakens' },
  { id: 'vx7', scenario: 'Moving +4D lens backward', scenarioHe: 'הזזת עדשת +4D אחורה', lensType: '+', movement: 'backward', effect: 'weakens' },
  { id: 'vx8', scenario: 'Moving -10D lens backward', scenarioHe: 'הזזת עדשת -10D אחורה', lensType: '-', movement: 'backward', effect: 'strengthens' }
];

// =============================================================================
// O3: PRENTICE RULE QUESTIONS (P = F × D)
// =============================================================================
export interface PrenticeQuestion {
  id: string;
  power: number;        // Lens power in diopters
  decentration: number; // Decentration in cm
  direction: 'nasal' | 'temporal' | 'up' | 'down';
  prism: number;        // Calculated prism
  baseDirection: 'BI' | 'BO' | 'BU' | 'BD';
}

export const PRENTICE_QUESTIONS: PrenticeQuestion[] = [
  { id: 'p1', power: 4, decentration: 0.5, direction: 'nasal', prism: 2, baseDirection: 'BI' },
  { id: 'p2', power: -6, decentration: 0.3, direction: 'temporal', prism: 1.8, baseDirection: 'BI' },
  { id: 'p3', power: 5, decentration: 0.4, direction: 'up', prism: 2, baseDirection: 'BU' },
  { id: 'p4', power: -3, decentration: 0.5, direction: 'down', prism: 1.5, baseDirection: 'BU' },
  { id: 'p5', power: 8, decentration: 0.25, direction: 'nasal', prism: 2, baseDirection: 'BI' },
  { id: 'p6', power: -4, decentration: 0.5, direction: 'nasal', prism: 2, baseDirection: 'BO' },
  { id: 'p7', power: 6, decentration: 0.3, direction: 'temporal', prism: 1.8, baseDirection: 'BO' },
  { id: 'p8', power: -5, decentration: 0.4, direction: 'up', prism: 2, baseDirection: 'BD' },
  { id: 'p9', power: 10, decentration: 0.2, direction: 'down', prism: 2, baseDirection: 'BD' },
  { id: 'p10', power: -8, decentration: 0.25, direction: 'temporal', prism: 2, baseDirection: 'BI' }
];

// =============================================================================
// O4: SPHERICAL EQUIVALENT QUESTIONS (SE = sph + ½cyl)
// =============================================================================
export interface SEQuestion {
  id: string;
  sphere: number;
  cylinder: number;
  axis: number;
  se: number;
}

export const SE_QUESTIONS: SEQuestion[] = [
  { id: 'se1', sphere: -1.00, cylinder: -2.00, axis: 90, se: -2.00 },
  { id: 'se2', sphere: +2.00, cylinder: -1.00, axis: 180, se: +1.50 },
  { id: 'se3', sphere: -3.00, cylinder: -1.50, axis: 45, se: -3.75 },
  { id: 'se4', sphere: +4.00, cylinder: -2.00, axis: 90, se: +3.00 },
  { id: 'se5', sphere: -2.50, cylinder: -0.50, axis: 180, se: -2.75 },
  { id: 'se6', sphere: +1.00, cylinder: -3.00, axis: 135, se: -0.50 },
  { id: 'se7', sphere: -4.00, cylinder: -1.00, axis: 90, se: -4.50 },
  { id: 'se8', sphere: +3.00, cylinder: -4.00, axis: 180, se: +1.00 },
  { id: 'se9', sphere: -1.50, cylinder: -2.50, axis: 45, se: -2.75 },
  { id: 'se10', sphere: +2.50, cylinder: -1.50, axis: 90, se: +1.75 }
];

// =============================================================================
// O5: SPECTACLE MAGNIFICATION QUESTIONS (~2% per diopter)
// =============================================================================
export interface MagnificationQuestion {
  id: string;
  power: number;
  magnification: number;  // Percentage (positive = magnification, negative = minification)
}

export const MAGNIFICATION_QUESTIONS: MagnificationQuestion[] = [
  { id: 'm1', power: +5, magnification: 10 },
  { id: 'm2', power: -4, magnification: -8 },
  { id: 'm3', power: +10, magnification: 20 },
  { id: 'm4', power: -6, magnification: -12 },
  { id: 'm5', power: +3, magnification: 6 },
  { id: 'm6', power: -8, magnification: -16 },
  { id: 'm7', power: +7, magnification: 14 },
  { id: 'm8', power: -2, magnification: -4 },
  { id: 'm9', power: +12, magnification: 24 },
  { id: 'm10', power: -10, magnification: -20 }
];

// =============================================================================
// N1: TRIAD IDENTIFICATION
// =============================================================================
export interface TriadQuestion {
  id: string;
  syndrome: string;
  syndromeHe: string;
  correctSymptoms: string[];
  allSymptoms: string[];
}

export const TRIAD_QUESTIONS: TriadQuestion[] = [
  {
    id: 't1',
    syndrome: "Horner's Syndrome",
    syndromeHe: 'תסמונת הורנר',
    correctSymptoms: ['Ptosis', 'Miosis', 'Anhidrosis'],
    allSymptoms: ['Ptosis', 'Miosis', 'Anhidrosis', 'Mydriasis', 'Proptosis', 'Diplopia']
  },
  {
    id: 't2',
    syndrome: 'Cavernous Sinus Syndrome',
    syndromeHe: 'תסמונת הסינוס הקברנוזי',
    correctSymptoms: ['Ophthalmoplegia', 'Proptosis', 'Chemosis'],
    allSymptoms: ['Ophthalmoplegia', 'Proptosis', 'Chemosis', 'Miosis', 'Ptosis', 'Nystagmus']
  },
  {
    id: 't3',
    syndrome: 'Orbital Apex Syndrome',
    syndromeHe: 'תסמונת קודקוד הארובית',
    correctSymptoms: ['Optic neuropathy', 'Ophthalmoplegia', 'V1 sensory loss'],
    allSymptoms: ['Optic neuropathy', 'Ophthalmoplegia', 'V1 sensory loss', 'Proptosis', 'Miosis', 'Ptosis']
  },
  {
    id: 't4',
    syndrome: 'Parinaud Syndrome',
    syndromeHe: 'תסמונת פרינו',
    correctSymptoms: ['Upgaze palsy', 'Light-near dissociation', 'Convergence-retraction nystagmus'],
    allSymptoms: ['Upgaze palsy', 'Light-near dissociation', 'Convergence-retraction nystagmus', 'Ptosis', 'Miosis', 'Diplopia']
  }
];

// =============================================================================
// N3: CN III TRUE/FALSE QUESTIONS
// =============================================================================
export interface TrueFalseQuestion {
  id: string;
  statement: string;
  statementHe: string;
  answer: boolean;
  explanation: string;
}

export const CN3_QUESTIONS: TrueFalseQuestion[] = [
  { id: 'cn1', statement: 'Pupil-sparing CN III palsy is always a surgical emergency', statementHe: 'שיתוק CN III עם שימור אישון הוא תמיד מצב חירום כירורגי', answer: false, explanation: 'Pupil-sparing suggests microvascular etiology, not aneurysm' },
  { id: 'cn2', statement: 'Complete CN III palsy causes ptosis', statementHe: 'שיתוק CN III מלא גורם לפטוזיס', answer: true, explanation: 'CN III innervates the levator palpebrae superioris' },
  { id: 'cn3', statement: 'Pupil involvement in CN III palsy suggests compression', statementHe: 'מעורבות אישון בשיתוק CN III מרמזת על לחץ', answer: true, explanation: 'Parasympathetic fibers run superficially and are compressed first' },
  { id: 'cn4', statement: 'CN III palsy causes the eye to look up and in', statementHe: 'שיתוק CN III גורם לעין להסתכל למעלה ופנימה', answer: false, explanation: 'Eye looks down and out due to unopposed LR and SO' },
  { id: 'cn5', statement: 'Diabetic CN III palsy typically spares the pupil', statementHe: 'שיתוק CN III סוכרתי בדרך כלל משמר את האישון', answer: true, explanation: 'Microvascular ischemia affects central fibers, sparing peripheral parasympathetics' },
  { id: 'cn6', statement: 'CN III innervates the lateral rectus muscle', statementHe: 'CN III מעצבב את השריר הישר הצידי', answer: false, explanation: 'LR is innervated by CN VI (LR6)' }
];

// =============================================================================
// N4: EOM QUESTIONS (LR6 SO4 R3)
// =============================================================================
export interface EOMQuestion {
  id: string;
  question: string;
  questionHe: string;
  options: string[];
  answer: string;
}

export const EOM_QUESTIONS: EOMQuestion[] = [
  { id: 'eom1', question: 'Which muscle elevates an adducted eye?', questionHe: 'איזה שריר מרים עין באדוקציה?', options: ['IO', 'SR', 'IR', 'SO'], answer: 'IO' },
  { id: 'eom2', question: 'Which muscle depresses an adducted eye?', questionHe: 'איזה שריר מוריד עין באדוקציה?', options: ['IO', 'SR', 'IR', 'SO'], answer: 'SO' },
  { id: 'eom3', question: 'Which muscle abducts the eye?', questionHe: 'איזה שריר מבצע אבדוקציה?', options: ['MR', 'LR', 'SR', 'IR'], answer: 'LR' },
  { id: 'eom4', question: 'Which cranial nerve innervates the superior oblique?', questionHe: 'איזה עצב קרניאלי מעצבב את האלכסוני העליון?', options: ['CN III', 'CN IV', 'CN VI', 'CN VII'], answer: 'CN IV' },
  { id: 'eom5', question: 'Which muscle elevates an abducted eye?', questionHe: 'איזה שריר מרים עין באבדוקציה?', options: ['IO', 'SR', 'IR', 'SO'], answer: 'SR' },
  { id: 'eom6', question: 'Which muscle depresses an abducted eye?', questionHe: 'איזה שריר מוריד עין באבדוקציה?', options: ['IO', 'SR', 'IR', 'SO'], answer: 'IR' }
];

export default {
  VERGENCE_QUESTIONS,
  VERTEX_QUESTIONS,
  PRENTICE_QUESTIONS,
  SE_QUESTIONS,
  MAGNIFICATION_QUESTIONS,
  TRIAD_QUESTIONS,
  CN3_QUESTIONS,
  EOM_QUESTIONS
};
