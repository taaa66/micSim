/**
 * OKAP Question Bank - Part 2: Pharmacology, Classifications & Emergency
 */

// =============================================================================
// P1: GLAUCOMA DRUG MoA (Production vs Outflow)
// =============================================================================
export interface DrugMoAQuestion {
  id: string;
  drugClass: string;
  drugClassHe: string;
  mechanism: 'decrease_production' | 'increase_outflow' | 'both';
}

export const DRUG_MOA_QUESTIONS: DrugMoAQuestion[] = [
  { id: 'dm1', drugClass: 'Beta-Blockers (Timolol)', drugClassHe: 'חוסמי בטא (טימולול)', mechanism: 'decrease_production' },
  { id: 'dm2', drugClass: 'Prostaglandin Analogs (Latanoprost)', drugClassHe: 'אנלוגים לפרוסטגלנדין (לטנופרוסט)', mechanism: 'increase_outflow' },
  { id: 'dm3', drugClass: 'Alpha-2 Agonists (Brimonidine)', drugClassHe: 'אגוניסטים אלפא-2 (ברימונידין)', mechanism: 'both' },
  { id: 'dm4', drugClass: 'Carbonic Anhydrase Inhibitors', drugClassHe: 'מעכבי קרבוניק אנהידראז', mechanism: 'decrease_production' },
  { id: 'dm5', drugClass: 'Cholinergic Agents (Pilocarpine)', drugClassHe: 'סוכנים כולינרגיים (פילוקרפין)', mechanism: 'increase_outflow' },
  { id: 'dm6', drugClass: 'Rho Kinase Inhibitors', drugClassHe: 'מעכבי רו קינאז', mechanism: 'increase_outflow' },
  { id: 'dm7', drugClass: 'Epinephrine', drugClassHe: 'אפינפרין', mechanism: 'both' },
  { id: 'dm8', drugClass: 'Oral Acetazolamide', drugClassHe: 'אצטזולמיד פומי', mechanism: 'decrease_production' }
];

// =============================================================================
// P2: SIGNATURE SIDE EFFECTS
// =============================================================================
export interface SideEffectQuestion {
  id: string;
  sideEffect: string;
  sideEffectHe: string;
  drugFamily: string;
  drugFamilyHe: string;
}

export const SIDE_EFFECT_QUESTIONS: SideEffectQuestion[] = [
  { id: 'se1', sideEffect: 'Eyelash growth (hypertrichosis)', sideEffectHe: 'צמיחת ריסים (היפרטריכוזיס)', drugFamily: 'Prostaglandin Analogs', drugFamilyHe: 'אנלוגים לפרוסטגלנדין' },
  { id: 'se2', sideEffect: 'Periorbital fat atrophy', sideEffectHe: 'אטרופיה של שומן פריאורביטלי', drugFamily: 'Prostaglandin Analogs', drugFamilyHe: 'אנלוגים לפרוסטגלנדין' },
  { id: 'se3', sideEffect: 'Iris color change', sideEffectHe: 'שינוי צבע קשתית', drugFamily: 'Prostaglandin Analogs', drugFamilyHe: 'אנלוגים לפרוסטגלנדין' },
  { id: 'se4', sideEffect: 'Metallic taste', sideEffectHe: 'טעם מתכתי', drugFamily: 'Carbonic Anhydrase Inhibitors', drugFamilyHe: 'מעכבי קרבוניק אנהידראז' },
  { id: 'se5', sideEffect: 'Paresthesias (tingling)', sideEffectHe: 'פרסתזיות (נימול)', drugFamily: 'Carbonic Anhydrase Inhibitors', drugFamilyHe: 'מעכבי קרבוניק אנהידראז' },
  { id: 'se6', sideEffect: 'Bradycardia', sideEffectHe: 'ברדיקרדיה', drugFamily: 'Beta-Blockers', drugFamilyHe: 'חוסמי בטא' },
  { id: 'se7', sideEffect: 'Bronchospasm', sideEffectHe: 'ברונכוספזם', drugFamily: 'Beta-Blockers', drugFamilyHe: 'חוסמי בטא' },
  { id: 'se8', sideEffect: 'Allergic follicular conjunctivitis', sideEffectHe: 'דלקת לחמית פוליקולרית אלרגית', drugFamily: 'Alpha-2 Agonists', drugFamilyHe: 'אגוניסטים אלפא-2' },
  { id: 'se9', sideEffect: 'CNS depression in infants', sideEffectHe: 'דיכוי CNS בתינוקות', drugFamily: 'Alpha-2 Agonists', drugFamilyHe: 'אגוניסטים אלפא-2' },
  { id: 'se10', sideEffect: 'Miosis and brow ache', sideEffectHe: 'מיוזיס וכאב גבה', drugFamily: 'Cholinergic Agents', drugFamilyHe: 'סוכנים כולינרגיים' }
];

// =============================================================================
// P3: CONTRAINDICATION CASES
// =============================================================================
export interface ContraindicationCase {
  id: string;
  patientProfile: string;
  patientProfileHe: string;
  options: string[];
  contraindicated: string;
  reason: string;
}

export const CONTRAINDICATION_CASES: ContraindicationCase[] = [
  { id: 'ci1', patientProfile: 'COPD, History of Bradycardia', patientProfileHe: 'COPD, היסטוריה של ברדיקרדיה', options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Dorzolamide'], contraindicated: 'Timolol', reason: 'Beta-blockers contraindicated in COPD and bradycardia' },
  { id: 'ci2', patientProfile: 'Sulfa allergy', patientProfileHe: 'אלרגיה לסולפה', options: ['Timolol', 'Latanoprost', 'Dorzolamide', 'Pilocarpine'], contraindicated: 'Dorzolamide', reason: 'CAIs are sulfonamide derivatives' },
  { id: 'ci3', patientProfile: '6-month-old infant', patientProfileHe: 'תינוק בן 6 חודשים', options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Dorzolamide'], contraindicated: 'Brimonidine', reason: 'Alpha-2 agonists cause CNS depression in infants' },
  { id: 'ci4', patientProfile: 'Asthma, well-controlled', patientProfileHe: 'אסתמה מאוזנת', options: ['Betaxolol', 'Timolol', 'Latanoprost', 'Brimonidine'], contraindicated: 'Timolol', reason: 'Non-selective beta-blockers contraindicated in asthma' },
  { id: 'ci5', patientProfile: 'Uveitis, active inflammation', patientProfileHe: 'אובאיטיס, דלקת פעילה', options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Dorzolamide'], contraindicated: 'Latanoprost', reason: 'PGAs may exacerbate uveitis' },
  { id: 'ci6', patientProfile: 'Aphakic patient', patientProfileHe: 'מטופל אפאקי', options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Pilocarpine'], contraindicated: 'Latanoprost', reason: 'Risk of CME in aphakia' }
];

// =============================================================================
// P4: PUPIL EFFECTS (Miosis vs Mydriasis)
// =============================================================================
export interface PupilEffectQuestion {
  id: string;
  treatment: string;
  treatmentHe: string;
  effect: 'miosis' | 'mydriasis';
  mechanism: string;
}

export const PUPIL_EFFECT_QUESTIONS: PupilEffectQuestion[] = [
  { id: 'pe1', treatment: 'Pilocarpine', treatmentHe: 'פילוקרפין', effect: 'miosis', mechanism: 'Parasympathomimetic' },
  { id: 'pe2', treatment: 'Tropicamide', treatmentHe: 'טרופיקמיד', effect: 'mydriasis', mechanism: 'Parasympatholytic' },
  { id: 'pe3', treatment: 'Phenylephrine', treatmentHe: 'פנילאפרין', effect: 'mydriasis', mechanism: 'Sympathomimetic' },
  { id: 'pe4', treatment: 'Brimonidine', treatmentHe: 'ברימונידין', effect: 'miosis', mechanism: 'Alpha-2 agonist (weak)' },
  { id: 'pe5', treatment: 'Atropine', treatmentHe: 'אטרופין', effect: 'mydriasis', mechanism: 'Parasympatholytic' },
  { id: 'pe6', treatment: 'Carbachol', treatmentHe: 'קרבכול', effect: 'miosis', mechanism: 'Parasympathomimetic' },
  { id: 'pe7', treatment: 'Cyclopentolate', treatmentHe: 'ציקלופנטולט', effect: 'mydriasis', mechanism: 'Parasympatholytic' },
  { id: 'pe8', treatment: 'Echothiophate', treatmentHe: 'אכותיופט', effect: 'miosis', mechanism: 'Cholinesterase inhibitor' }
];

// =============================================================================
// C1: ISNT RULE SEQUENCING
// =============================================================================
export const ISNT_CORRECT_ORDER = ['I', 'S', 'N', 'T'];
export const ISNT_EXPLANATION = 'Inferior > Superior > Nasal > Temporal (thickest to thinnest neuroretinal rim)';

// =============================================================================
// C3: GONIOSCOPY GRADING (Shaffer vs Scheie)
// =============================================================================
export interface GonioscopyGrade {
  id: string;
  grade: string;
  shafferMeaning: string;
  scheieMeaning: string;
}

export const GONIOSCOPY_GRADES: GonioscopyGrade[] = [
  { id: 'g1', grade: '0', shafferMeaning: 'Closed', scheieMeaning: 'Wide open (all structures visible)' },
  { id: 'g2', grade: 'I', shafferMeaning: '10° (very narrow)', scheieMeaning: 'Scleral spur not visible' },
  { id: 'g3', grade: 'II', shafferMeaning: '20° (narrow)', scheieMeaning: 'Ciliary body not visible' },
  { id: 'g4', grade: 'III', shafferMeaning: '20-35° (open)', scheieMeaning: 'Posterior TM not visible' },
  { id: 'g5', grade: 'IV/4', shafferMeaning: '35-45° (wide open)', scheieMeaning: 'Closed (no structures visible)' }
];

// =============================================================================
// C4: DIABETIC RETINOPATHY CLASSIFICATION
// =============================================================================
export interface DRClassificationCase {
  id: string;
  findings: string;
  findingsHe: string;
  severity: 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
  rule?: string;
}

export const DR_CLASSIFICATION_CASES: DRClassificationCase[] = [
  { id: 'dr1', findings: 'Microaneurysms only', findingsHe: 'מיקרואנוריזמות בלבד', severity: 'Mild NPDR' },
  { id: 'dr2', findings: 'Microaneurysms + dot/blot hemorrhages + hard exudates', findingsHe: 'מיקרואנוריזמות + דימומים נקודתיים + אקסודטים קשים', severity: 'Moderate NPDR' },
  { id: 'dr3', findings: '>20 hemorrhages in each quadrant', findingsHe: 'יותר מ-20 דימומים בכל רבע', severity: 'Severe NPDR', rule: '4-2-1 Rule (1 of 3)' },
  { id: 'dr4', findings: 'Venous beading in 2+ quadrants', findingsHe: 'חרוזי ורידים ב-2+ רבעים', severity: 'Severe NPDR', rule: '4-2-1 Rule (1 of 3)' },
  { id: 'dr5', findings: 'IRMA in 1+ quadrant', findingsHe: 'IRMA ברבע אחד או יותר', severity: 'Severe NPDR', rule: '4-2-1 Rule (1 of 3)' },
  { id: 'dr6', findings: 'Neovascularization of disc (NVD)', findingsHe: 'ניאווסקולריזציה של הדיסק (NVD)', severity: 'PDR' },
  { id: 'dr7', findings: 'Neovascularization elsewhere (NVE)', findingsHe: 'ניאווסקולריזציה במקום אחר (NVE)', severity: 'PDR' },
  { id: 'dr8', findings: 'Vitreous hemorrhage', findingsHe: 'דימום זגוגית', severity: 'PDR' }
];

// =============================================================================
// N5: VISUAL FIELD DEFECT PATTERNS
// =============================================================================
export interface VFDefectPattern {
  id: string;
  pattern: string;
  patternHe: string;
  diagnosis: string;
  diagnosisHe: string;
  lesionLocation: string;
}

export const VF_DEFECT_PATTERNS: VFDefectPattern[] = [
  { id: 'vf1', pattern: 'Bitemporal hemianopia', patternHe: 'המיאנופיה ביטמפורלית', diagnosis: 'Chiasmal lesion (pituitary)', diagnosisHe: 'נגע כיאזמטי (יותרת המוח)', lesionLocation: 'Optic chiasm' },
  { id: 'vf2', pattern: 'Homonymous hemianopia', patternHe: 'המיאנופיה הומונימית', diagnosis: 'Retrochiasmal lesion', diagnosisHe: 'נגע רטרוכיאזמטי', lesionLocation: 'Optic tract/radiations/cortex' },
  { id: 'vf3', pattern: 'Arcuate scotoma', patternHe: 'סקוטומה ארקואטית', diagnosis: 'Glaucoma', diagnosisHe: 'גלאוקומה', lesionLocation: 'Optic nerve' },
  { id: 'vf4', pattern: 'Central scotoma', patternHe: 'סקוטומה מרכזית', diagnosis: 'Optic neuritis / Macular disease', diagnosisHe: 'דלקת עצב ראייה / מחלת מקולה', lesionLocation: 'Optic nerve/Macula' },
  { id: 'vf5', pattern: 'Altitudinal defect', patternHe: 'פגם אלטיטודינלי', diagnosis: 'AION / Branch retinal artery occlusion', diagnosisHe: 'AION / חסימת ענף עורק רשתית', lesionLocation: 'Optic nerve/Retina' },
  { id: 'vf6', pattern: 'Pie-in-the-sky defect', patternHe: 'פגם "עוגה בשמיים"', diagnosis: 'Temporal lobe lesion', diagnosisHe: 'נגע באונה הטמפורלית', lesionLocation: "Meyer's loop" },
  { id: 'vf7', pattern: 'Pie-on-the-floor defect', patternHe: 'פגם "עוגה על הרצפה"', diagnosis: 'Parietal lobe lesion', diagnosisHe: 'נגע באונה הפריאטלית', lesionLocation: 'Parietal radiations' },
  { id: 'vf8', pattern: 'Junctional scotoma', patternHe: 'סקוטומה ג\'אנקשנלית', diagnosis: 'Anterior chiasm lesion', diagnosisHe: 'נגע כיאזמה קדמי', lesionLocation: 'Junction of ON and chiasm' }
];

export default {
  DRUG_MOA_QUESTIONS,
  SIDE_EFFECT_QUESTIONS,
  CONTRAINDICATION_CASES,
  PUPIL_EFFECT_QUESTIONS,
  ISNT_CORRECT_ORDER,
  GONIOSCOPY_GRADES,
  DR_CLASSIFICATION_CASES,
  VF_DEFECT_PATTERNS
};
