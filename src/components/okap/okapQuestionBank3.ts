/**
 * =============================================================================
 * OKAP QUESTION BANK - PART 3: OPTICS ADVANCED
 * =============================================================================
 * Questions for O2-O5: Vertex Distance, Prentice Rule, SE, Magnification
 * =============================================================================
 */

// =============================================================================
// O2: VERTEX DISTANCE QUESTIONS
// =============================================================================
export interface VertexDistanceQuestion {
  id: string;
  scenario: string;
  lensType: 'plus' | 'minus';
  movement: 'closer' | 'farther';
  correctEffect: 'increase' | 'decrease';
  explanation: string;
}

export const VERTEX_DISTANCE_QUESTIONS: VertexDistanceQuestion[] = [
  {
    id: 'VTX-001',
    scenario: 'A +10.00 D lens is moved closer to the eye',
    lensType: 'plus',
    movement: 'closer',
    correctEffect: 'decrease',
    explanation: 'Plus lenses moved closer to the eye have decreased effective power'
  },
  {
    id: 'VTX-002',
    scenario: 'A +10.00 D lens is moved farther from the eye',
    lensType: 'plus',
    movement: 'farther',
    correctEffect: 'increase',
    explanation: 'Plus lenses moved farther from the eye have increased effective power'
  },
  {
    id: 'VTX-003',
    scenario: 'A -10.00 D lens is moved closer to the eye',
    lensType: 'minus',
    movement: 'closer',
    correctEffect: 'increase',
    explanation: 'Minus lenses moved closer to the eye have increased (more minus) effective power'
  },
  {
    id: 'VTX-004',
    scenario: 'A -10.00 D lens is moved farther from the eye',
    lensType: 'minus',
    movement: 'farther',
    correctEffect: 'decrease',
    explanation: 'Minus lenses moved farther from the eye have decreased (less minus) effective power'
  },
  {
    id: 'VTX-005',
    scenario: 'Converting spectacle Rx +12.00 D to contact lens (vertex 12mm)',
    lensType: 'plus',
    movement: 'closer',
    correctEffect: 'decrease',
    explanation: 'Contact lens power will be less plus than spectacle power'
  },
  {
    id: 'VTX-006',
    scenario: 'Converting spectacle Rx -15.00 D to contact lens (vertex 12mm)',
    lensType: 'minus',
    movement: 'closer',
    correctEffect: 'increase',
    explanation: 'Contact lens power will be more minus than spectacle power'
  },
  {
    id: 'VTX-007',
    scenario: 'Patient with +8.00 D glasses pushes frames up nose (closer)',
    lensType: 'plus',
    movement: 'closer',
    correctEffect: 'decrease',
    explanation: 'Effective power decreases, patient may notice blur'
  },
  {
    id: 'VTX-008',
    scenario: 'Patient with -12.00 D glasses - frames slide down (farther)',
    lensType: 'minus',
    movement: 'farther',
    correctEffect: 'decrease',
    explanation: 'Effective power decreases (less minus), patient may notice blur'
  }
];

// =============================================================================
// O3: PRENTICE RULE QUESTIONS
// =============================================================================
export interface PrenticeRuleQuestion {
  id: string;
  power: number; // Diopters
  decentration: number; // cm
  correctPrism: number; // prism diopters
  baseDirection: 'up' | 'down' | 'in' | 'out';
  scenario: string;
}

export const PRENTICE_RULE_QUESTIONS: PrenticeRuleQuestion[] = [
  {
    id: 'PRT-001',
    power: 4,
    decentration: 0.5,
    correctPrism: 2,
    baseDirection: 'down',
    scenario: 'Plus lens decentered up - base direction?'
  },
  {
    id: 'PRT-002',
    power: -6,
    decentration: 0.5,
    correctPrism: 3,
    baseDirection: 'up',
    scenario: 'Minus lens decentered up - base direction?'
  },
  {
    id: 'PRT-003',
    power: 5,
    decentration: 0.4,
    correctPrism: 2,
    baseDirection: 'out',
    scenario: 'Plus lens decentered nasally - base direction?'
  },
  {
    id: 'PRT-004',
    power: -8,
    decentration: 0.25,
    correctPrism: 2,
    baseDirection: 'in',
    scenario: 'Minus lens decentered temporally - base direction?'
  },
  {
    id: 'PRT-005',
    power: 3,
    decentration: 1.0,
    correctPrism: 3,
    baseDirection: 'down',
    scenario: 'Calculate prism: +3.00 D lens, 10mm decentration up'
  },
  {
    id: 'PRT-006',
    power: -4,
    decentration: 0.75,
    correctPrism: 3,
    baseDirection: 'down',
    scenario: 'Calculate prism: -4.00 D lens, 7.5mm decentration down'
  },
  {
    id: 'PRT-007',
    power: 6,
    decentration: 0.5,
    correctPrism: 3,
    baseDirection: 'in',
    scenario: 'Plus lens decentered temporally OD - base direction?'
  },
  {
    id: 'PRT-008',
    power: -5,
    decentration: 0.6,
    correctPrism: 3,
    baseDirection: 'out',
    scenario: 'Minus lens decentered nasally - base direction?'
  },
  {
    id: 'PRT-009',
    power: 2,
    decentration: 1.5,
    correctPrism: 3,
    baseDirection: 'up',
    scenario: 'Calculate prism: +2.00 D lens, 15mm decentration down'
  },
  {
    id: 'PRT-010',
    power: -10,
    decentration: 0.3,
    correctPrism: 3,
    baseDirection: 'down',
    scenario: 'Calculate prism: -10.00 D lens, 3mm decentration up'
  }
];

// =============================================================================
// O4: SPHERICAL EQUIVALENT QUESTIONS
// =============================================================================
export interface SphericalEquivalentQuestion {
  id: string;
  sphere: number;
  cylinder: number;
  axis: number;
  correctSE: number;
  prescription: string;
}

export const SPHERICAL_EQUIVALENT_QUESTIONS: SphericalEquivalentQuestion[] = [
  {
    id: 'SE-001',
    sphere: -2.00,
    cylinder: -1.00,
    axis: 180,
    correctSE: -2.50,
    prescription: '-2.00 -1.00 x 180'
  },
  {
    id: 'SE-002',
    sphere: +3.00,
    cylinder: -2.00,
    axis: 90,
    correctSE: +2.00,
    prescription: '+3.00 -2.00 x 90'
  },
  {
    id: 'SE-003',
    sphere: -4.50,
    cylinder: -1.50,
    axis: 45,
    correctSE: -5.25,
    prescription: '-4.50 -1.50 x 45'
  },
  {
    id: 'SE-004',
    sphere: +1.00,
    cylinder: -4.00,
    axis: 180,
    correctSE: -1.00,
    prescription: '+1.00 -4.00 x 180'
  },
  {
    id: 'SE-005',
    sphere: -6.00,
    cylinder: -2.00,
    axis: 90,
    correctSE: -7.00,
    prescription: '-6.00 -2.00 x 90'
  },
  {
    id: 'SE-006',
    sphere: +5.00,
    cylinder: -1.00,
    axis: 135,
    correctSE: +4.50,
    prescription: '+5.00 -1.00 x 135'
  },
  {
    id: 'SE-007',
    sphere: 0.00,
    cylinder: -3.00,
    axis: 180,
    correctSE: -1.50,
    prescription: 'Plano -3.00 x 180'
  },
  {
    id: 'SE-008',
    sphere: -1.25,
    cylinder: -0.75,
    axis: 90,
    correctSE: -1.625,
    prescription: '-1.25 -0.75 x 90'
  },
  {
    id: 'SE-009',
    sphere: +2.50,
    cylinder: -3.00,
    axis: 45,
    correctSE: +1.00,
    prescription: '+2.50 -3.00 x 45'
  },
  {
    id: 'SE-010',
    sphere: -8.00,
    cylinder: -1.00,
    axis: 180,
    correctSE: -8.50,
    prescription: '-8.00 -1.00 x 180'
  }
];

// =============================================================================
// O5: SPECTACLE MAGNIFICATION QUESTIONS
// =============================================================================
export interface MagnificationQuestion {
  id: string;
  power: number;
  correctMagnification: number; // percentage
  scenario: string;
}

export const MAGNIFICATION_QUESTIONS: MagnificationQuestion[] = [
  {
    id: 'MAG-001',
    power: +5,
    correctMagnification: 10,
    scenario: 'Approximate magnification with +5.00 D spectacles?'
  },
  {
    id: 'MAG-002',
    power: -5,
    correctMagnification: -10,
    scenario: 'Approximate minification with -5.00 D spectacles?'
  },
  {
    id: 'MAG-003',
    power: +10,
    correctMagnification: 20,
    scenario: 'Approximate magnification with +10.00 D spectacles?'
  },
  {
    id: 'MAG-004',
    power: -8,
    correctMagnification: -16,
    scenario: 'Approximate minification with -8.00 D spectacles?'
  },
  {
    id: 'MAG-005',
    power: +3,
    correctMagnification: 6,
    scenario: 'Approximate magnification with +3.00 D spectacles?'
  },
  {
    id: 'MAG-006',
    power: -12,
    correctMagnification: -24,
    scenario: 'Approximate minification with -12.00 D spectacles?'
  },
  {
    id: 'MAG-007',
    power: +7,
    correctMagnification: 14,
    scenario: 'Approximate magnification with +7.00 D spectacles?'
  },
  {
    id: 'MAG-008',
    power: -4,
    correctMagnification: -8,
    scenario: 'Approximate minification with -4.00 D spectacles?'
  },
  {
    id: 'MAG-009',
    power: +15,
    correctMagnification: 30,
    scenario: 'Approximate magnification with +15.00 D aphakic spectacles?'
  },
  {
    id: 'MAG-010',
    power: -6,
    correctMagnification: -12,
    scenario: 'Approximate minification with -6.00 D spectacles?'
  }
];

// =============================================================================
// N1: HORNER'S SYNDROME TRIAD QUESTIONS
// =============================================================================
export interface TriadQuestion {
  id: string;
  syndrome: string;
  correctSymptoms: string[];
  allOptions: string[];
  explanation: string;
}

export const TRIAD_QUESTIONS: TriadQuestion[] = [
  {
    id: 'TRD-001',
    syndrome: "Horner's Syndrome",
    correctSymptoms: ['Ptosis', 'Miosis', 'Anhidrosis'],
    allOptions: ['Ptosis', 'Miosis', 'Anhidrosis', 'Mydriasis', 'Proptosis', 'Lagophthalmos'],
    explanation: "Classic Horner's triad from sympathetic chain disruption"
  },
  {
    id: 'TRD-002',
    syndrome: 'Parinaud Syndrome',
    correctSymptoms: ['Upgaze palsy', 'Light-near dissociation', 'Convergence-retraction nystagmus'],
    allOptions: ['Upgaze palsy', 'Light-near dissociation', 'Convergence-retraction nystagmus', 'Downgaze palsy', 'Horizontal nystagmus', 'Ptosis'],
    explanation: 'Dorsal midbrain syndrome affecting vertical gaze'
  },
  {
    id: 'TRD-003',
    syndrome: 'Orbital Apex Syndrome',
    correctSymptoms: ['CN III palsy', 'CN IV palsy', 'CN VI palsy'],
    allOptions: ['CN III palsy', 'CN IV palsy', 'CN VI palsy', 'CN VII palsy', 'Proptosis', 'Optic neuropathy'],
    explanation: 'All three ocular motor nerves affected at orbital apex'
  },
  {
    id: 'TRD-004',
    syndrome: 'Cavernous Sinus Syndrome',
    correctSymptoms: ['CN III palsy', 'CN VI palsy', 'V1/V2 sensory loss'],
    allOptions: ['CN III palsy', 'CN VI palsy', 'V1/V2 sensory loss', 'CN VII palsy', 'Optic neuropathy', 'Proptosis'],
    explanation: 'Multiple cranial nerves affected in cavernous sinus'
  },
  {
    id: 'TRD-005',
    syndrome: 'Marcus Gunn Jaw-Winking',
    correctSymptoms: ['Ptosis', 'Lid elevation with jaw movement', 'Synkinesis'],
    allOptions: ['Ptosis', 'Lid elevation with jaw movement', 'Synkinesis', 'Miosis', 'Mydriasis', 'Anhidrosis'],
    explanation: 'Aberrant innervation between CN V and CN III'
  },
  {
    id: 'TRD-006',
    syndrome: 'Adie Tonic Pupil',
    correctSymptoms: ['Dilated pupil', 'Light-near dissociation', 'Vermiform movements'],
    allOptions: ['Dilated pupil', 'Light-near dissociation', 'Vermiform movements', 'Miosis', 'Ptosis', 'RAPD'],
    explanation: 'Postganglionic parasympathetic denervation'
  },
  {
    id: 'TRD-007',
    syndrome: 'Foster Kennedy Syndrome',
    correctSymptoms: ['Ipsilateral optic atrophy', 'Contralateral papilledema', 'Anosmia'],
    allOptions: ['Ipsilateral optic atrophy', 'Contralateral papilledema', 'Anosmia', 'Bilateral papilledema', 'Bilateral optic atrophy', 'Proptosis'],
    explanation: 'Frontal lobe mass compressing ipsilateral nerve, causing increased ICP'
  },
  {
    id: 'TRD-008',
    syndrome: 'Gradenigo Syndrome',
    correctSymptoms: ['CN VI palsy', 'Facial pain (V)', 'Otitis media'],
    allOptions: ['CN VI palsy', 'Facial pain (V)', 'Otitis media', 'CN III palsy', 'Hearing loss', 'Vertigo'],
    explanation: 'Petrous apex infection affecting CN VI and trigeminal'
  }
];

// =============================================================================
// N2: VISUAL PATHWAY LESION QUESTIONS
// =============================================================================
export interface VisualPathwayQuestion {
  id: string;
  lesionLocation: string;
  visualFieldDefect: string;
  hasRAPD: boolean;
  explanation: string;
}

export const VISUAL_PATHWAY_QUESTIONS: VisualPathwayQuestion[] = [
  {
    id: 'VP-001',
    lesionLocation: 'Optic nerve (complete)',
    visualFieldDefect: 'Complete monocular blindness',
    hasRAPD: true,
    explanation: 'Unilateral optic nerve lesion causes ipsilateral RAPD'
  },
  {
    id: 'VP-002',
    lesionLocation: 'Optic chiasm (central)',
    visualFieldDefect: 'Bitemporal hemianopia',
    hasRAPD: false,
    explanation: 'Symmetric chiasmal lesion - no RAPD (equal damage)'
  },
  {
    id: 'VP-003',
    lesionLocation: 'Optic tract',
    visualFieldDefect: 'Contralateral homonymous hemianopia',
    hasRAPD: true,
    explanation: 'Tract lesion causes contralateral RAPD (more crossed fibers)'
  },
  {
    id: 'VP-004',
    lesionLocation: 'Lateral geniculate nucleus',
    visualFieldDefect: 'Contralateral homonymous hemianopia',
    hasRAPD: false,
    explanation: 'Post-synaptic lesion - pupil fibers already diverged'
  },
  {
    id: 'VP-005',
    lesionLocation: 'Optic radiations (temporal - Meyer loop)',
    visualFieldDefect: 'Contralateral superior quadrantanopia',
    hasRAPD: false,
    explanation: '"Pie in the sky" - temporal radiations carry inferior field'
  },
  {
    id: 'VP-006',
    lesionLocation: 'Optic radiations (parietal)',
    visualFieldDefect: 'Contralateral inferior quadrantanopia',
    hasRAPD: false,
    explanation: '"Pie on the floor" - parietal radiations carry superior field'
  },
  {
    id: 'VP-007',
    lesionLocation: 'Occipital cortex (complete)',
    visualFieldDefect: 'Contralateral homonymous hemianopia with macular sparing',
    hasRAPD: false,
    explanation: 'Macular sparing due to dual blood supply'
  },
  {
    id: 'VP-008',
    lesionLocation: 'Anterior junction (optic nerve/chiasm)',
    visualFieldDefect: 'Junctional scotoma',
    hasRAPD: true,
    explanation: 'Ipsilateral central + contralateral superior temporal defect'
  }
];

// =============================================================================
// N5: VISUAL FIELD DEFECT PATTERNS
// =============================================================================
export interface VFDefectQuestion {
  id: string;
  pattern: string;
  diagnosis: string;
  description: string;
  options: string[];
}

export const VF_DEFECT_QUESTIONS: VFDefectQuestion[] = [
  {
    id: 'VFD-001',
    pattern: 'Arcuate scotoma',
    diagnosis: 'Glaucoma',
    description: 'Arc-shaped defect following nerve fiber layer',
    options: ['Glaucoma', 'Optic neuritis', 'Pituitary adenoma', 'Stroke']
  },
  {
    id: 'VFD-002',
    pattern: 'Bitemporal hemianopia',
    diagnosis: 'Pituitary adenoma',
    description: 'Loss of both temporal fields',
    options: ['Pituitary adenoma', 'Glaucoma', 'Optic neuritis', 'Occipital stroke']
  },
  {
    id: 'VFD-003',
    pattern: 'Homonymous hemianopia',
    diagnosis: 'Occipital stroke',
    description: 'Loss of same side in both eyes',
    options: ['Occipital stroke', 'Pituitary adenoma', 'Glaucoma', 'Retinal detachment']
  },
  {
    id: 'VFD-004',
    pattern: 'Central scotoma',
    diagnosis: 'Optic neuritis',
    description: 'Central vision loss in one eye',
    options: ['Optic neuritis', 'Glaucoma', 'Macular degeneration', 'Stroke']
  },
  {
    id: 'VFD-005',
    pattern: 'Altitudinal defect',
    diagnosis: 'AION (Anterior Ischemic Optic Neuropathy)',
    description: 'Loss of superior or inferior half of vision',
    options: ['AION', 'Glaucoma', 'Retinal detachment', 'Stroke']
  },
  {
    id: 'VFD-006',
    pattern: 'Nasal step',
    diagnosis: 'Glaucoma',
    description: 'Step-like defect at horizontal midline nasally',
    options: ['Glaucoma', 'Optic neuritis', 'Branch retinal artery occlusion', 'Stroke']
  },
  {
    id: 'VFD-007',
    pattern: 'Superior quadrantanopia',
    diagnosis: 'Temporal lobe lesion',
    description: '"Pie in the sky" - contralateral superior quadrant loss',
    options: ['Temporal lobe lesion', 'Parietal lobe lesion', 'Occipital lesion', 'Optic nerve lesion']
  },
  {
    id: 'VFD-008',
    pattern: 'Inferior quadrantanopia',
    diagnosis: 'Parietal lobe lesion',
    description: '"Pie on the floor" - contralateral inferior quadrant loss',
    options: ['Parietal lobe lesion', 'Temporal lobe lesion', 'Occipital lesion', 'Chiasmal lesion']
  },
  {
    id: 'VFD-009',
    pattern: 'Ring scotoma',
    diagnosis: 'Retinitis pigmentosa',
    description: 'Ring-shaped mid-peripheral vision loss',
    options: ['Retinitis pigmentosa', 'Glaucoma', 'Optic neuritis', 'Macular degeneration']
  },
  {
    id: 'VFD-010',
    pattern: 'Enlarged blind spot',
    diagnosis: 'Papilledema',
    description: 'Increased size of physiologic blind spot',
    options: ['Papilledema', 'Glaucoma', 'Optic neuritis', 'Macular hole']
  }
];

// =============================================================================
// P2: DRUG SIDE EFFECTS
// =============================================================================
export interface DrugSideEffectQuestion {
  id: string;
  sideEffect: string;
  correctDrug: string;
  options: string[];
  explanation: string;
}

export const DRUG_SIDE_EFFECT_QUESTIONS: DrugSideEffectQuestion[] = [
  {
    id: 'DSE-001',
    sideEffect: 'Iris color change (darkening)',
    correctDrug: 'Prostaglandin analogs',
    options: ['Prostaglandin analogs', 'Beta-blockers', 'Alpha agonists', 'CAIs'],
    explanation: 'Increased melanin in iris melanocytes'
  },
  {
    id: 'DSE-002',
    sideEffect: 'Metallic taste',
    correctDrug: 'Carbonic anhydrase inhibitors',
    options: ['Carbonic anhydrase inhibitors', 'Beta-blockers', 'Prostaglandins', 'Miotics'],
    explanation: 'Systemic CAI effect on taste receptors'
  },
  {
    id: 'DSE-003',
    sideEffect: 'Periorbital fat atrophy',
    correctDrug: 'Prostaglandin analogs',
    options: ['Prostaglandin analogs', 'Beta-blockers', 'Alpha agonists', 'CAIs'],
    explanation: 'PAPS - Prostaglandin-Associated Periorbitopathy'
  },
  {
    id: 'DSE-004',
    sideEffect: 'Bronchospasm',
    correctDrug: 'Beta-blockers',
    options: ['Beta-blockers', 'Prostaglandins', 'Alpha agonists', 'CAIs'],
    explanation: 'Beta-2 blockade in airways'
  },
  {
    id: 'DSE-005',
    sideEffect: 'Allergic follicular conjunctivitis',
    correctDrug: 'Brimonidine (Alpha-2 agonist)',
    options: ['Brimonidine', 'Timolol', 'Latanoprost', 'Dorzolamide'],
    explanation: 'Type IV hypersensitivity reaction'
  },
  {
    id: 'DSE-006',
    sideEffect: 'Eyelash growth (hypertrichosis)',
    correctDrug: 'Prostaglandin analogs',
    options: ['Prostaglandin analogs', 'Beta-blockers', 'Alpha agonists', 'Miotics'],
    explanation: 'Stimulation of hair follicle growth phase'
  },
  {
    id: 'DSE-007',
    sideEffect: 'Paresthesias (tingling)',
    correctDrug: 'Carbonic anhydrase inhibitors',
    options: ['Carbonic anhydrase inhibitors', 'Beta-blockers', 'Prostaglandins', 'Alpha agonists'],
    explanation: 'Electrolyte imbalance from systemic CAI'
  },
  {
    id: 'DSE-008',
    sideEffect: 'Bradycardia',
    correctDrug: 'Beta-blockers',
    options: ['Beta-blockers', 'Prostaglandins', 'Alpha agonists', 'CAIs'],
    explanation: 'Systemic beta-1 blockade on heart'
  },
  {
    id: 'DSE-009',
    sideEffect: 'CNS depression in infants',
    correctDrug: 'Brimonidine (Alpha-2 agonist)',
    options: ['Brimonidine', 'Timolol', 'Latanoprost', 'Dorzolamide'],
    explanation: 'Crosses blood-brain barrier, contraindicated in children <2'
  },
  {
    id: 'DSE-010',
    sideEffect: 'Kidney stones',
    correctDrug: 'Carbonic anhydrase inhibitors',
    options: ['Carbonic anhydrase inhibitors', 'Beta-blockers', 'Prostaglandins', 'Alpha agonists'],
    explanation: 'Alkaline urine promotes calcium phosphate precipitation'
  }
];

// =============================================================================
// P3: CONTRAINDICATIONS
// =============================================================================
export interface ContraindicationQuestion {
  id: string;
  patientProfile: string;
  contraindicatedDrug: string;
  options: string[];
  reason: string;
}

export const CONTRAINDICATION_QUESTIONS: ContraindicationQuestion[] = [
  {
    id: 'CTI-001',
    patientProfile: 'Patient with asthma',
    contraindicatedDrug: 'Timolol (Beta-blocker)',
    options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Dorzolamide'],
    reason: 'Beta-blockers can trigger bronchospasm'
  },
  {
    id: 'CTI-002',
    patientProfile: 'Patient with sulfa allergy',
    contraindicatedDrug: 'Dorzolamide (CAI)',
    options: ['Dorzolamide', 'Timolol', 'Latanoprost', 'Brimonidine'],
    reason: 'CAIs are sulfonamide derivatives'
  },
  {
    id: 'CTI-003',
    patientProfile: '18-month-old child',
    contraindicatedDrug: 'Brimonidine (Alpha-2 agonist)',
    options: ['Brimonidine', 'Timolol', 'Latanoprost', 'Dorzolamide'],
    reason: 'CNS depression risk in children under 2'
  },
  {
    id: 'CTI-004',
    patientProfile: 'Patient with second-degree heart block',
    contraindicatedDrug: 'Timolol (Beta-blocker)',
    options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Dorzolamide'],
    reason: 'Beta-blockers worsen AV conduction'
  },
  {
    id: 'CTI-005',
    patientProfile: 'Patient on MAO inhibitors',
    contraindicatedDrug: 'Brimonidine (Alpha-2 agonist)',
    options: ['Brimonidine', 'Timolol', 'Latanoprost', 'Dorzolamide'],
    reason: 'Risk of hypertensive crisis'
  },
  {
    id: 'CTI-006',
    patientProfile: 'Patient with active uveitis',
    contraindicatedDrug: 'Latanoprost (Prostaglandin)',
    options: ['Latanoprost', 'Timolol', 'Brimonidine', 'Dorzolamide'],
    reason: 'Prostaglandins may worsen inflammation'
  },
  {
    id: 'CTI-007',
    patientProfile: 'Patient with severe COPD',
    contraindicatedDrug: 'Timolol (Beta-blocker)',
    options: ['Timolol', 'Latanoprost', 'Brimonidine', 'Dorzolamide'],
    reason: 'Risk of bronchospasm'
  },
  {
    id: 'CTI-008',
    patientProfile: 'Patient with sickle cell disease',
    contraindicatedDrug: 'Dorzolamide (CAI)',
    options: ['Dorzolamide', 'Timolol', 'Latanoprost', 'Brimonidine'],
    reason: 'CAIs may worsen sickling in anterior chamber'
  }
];

// =============================================================================
// P4: PUPIL EFFECTS
// =============================================================================
export interface PupilEffectQuestion {
  id: string;
  drug: string;
  effect: 'miosis' | 'mydriasis' | 'no_change';
  mechanism: string;
}

export const PUPIL_EFFECT_QUESTIONS: PupilEffectQuestion[] = [
  {
    id: 'PUP-001',
    drug: 'Pilocarpine',
    effect: 'miosis',
    mechanism: 'Direct muscarinic agonist - contracts sphincter'
  },
  {
    id: 'PUP-002',
    drug: 'Tropicamide',
    effect: 'mydriasis',
    mechanism: 'Muscarinic antagonist - relaxes sphincter'
  },
  {
    id: 'PUP-003',
    drug: 'Phenylephrine',
    effect: 'mydriasis',
    mechanism: 'Alpha-1 agonist - contracts dilator'
  },
  {
    id: 'PUP-004',
    drug: 'Timolol',
    effect: 'no_change',
    mechanism: 'Beta-blocker - no direct pupil effect'
  },
  {
    id: 'PUP-005',
    drug: 'Brimonidine',
    effect: 'miosis',
    mechanism: 'Alpha-2 agonist - mild miosis'
  },
  {
    id: 'PUP-006',
    drug: 'Atropine',
    effect: 'mydriasis',
    mechanism: 'Muscarinic antagonist - relaxes sphincter'
  },
  {
    id: 'PUP-007',
    drug: 'Latanoprost',
    effect: 'no_change',
    mechanism: 'Prostaglandin - no direct pupil effect'
  },
  {
    id: 'PUP-008',
    drug: 'Cocaine',
    effect: 'mydriasis',
    mechanism: 'Blocks norepinephrine reuptake - dilator activation'
  },
  {
    id: 'PUP-009',
    drug: 'Hydroxyamphetamine',
    effect: 'mydriasis',
    mechanism: 'Releases norepinephrine from nerve terminals'
  },
  {
    id: 'PUP-010',
    drug: 'Apraclonidine',
    effect: 'mydriasis',
    mechanism: 'Alpha agonist - reversal of Horner miosis'
  }
];

// =============================================================================
// C2: GONIOSCOPY GRADING
// =============================================================================
export interface GonioscopyQuestion {
  id: string;
  shafferGrade: number;
  scheieGrade: string;
  description: string;
  angleStatus: string;
}

export const GONIOSCOPY_QUESTIONS: GonioscopyQuestion[] = [
  {
    id: 'GON-001',
    shafferGrade: 4,
    scheieGrade: '0',
    description: 'Wide open angle - all structures visible',
    angleStatus: 'Wide open'
  },
  {
    id: 'GON-002',
    shafferGrade: 3,
    scheieGrade: 'I',
    description: 'Open angle - scleral spur visible',
    angleStatus: 'Open'
  },
  {
    id: 'GON-003',
    shafferGrade: 2,
    scheieGrade: 'II',
    description: 'Moderately narrow - trabecular meshwork visible',
    angleStatus: 'Moderately narrow'
  },
  {
    id: 'GON-004',
    shafferGrade: 1,
    scheieGrade: 'III',
    description: 'Very narrow - only Schwalbe line visible',
    angleStatus: 'Very narrow'
  },
  {
    id: 'GON-005',
    shafferGrade: 0,
    scheieGrade: 'IV',
    description: 'Closed - no structures visible',
    angleStatus: 'Closed'
  },
  {
    id: 'GON-006',
    shafferGrade: 4,
    scheieGrade: '0',
    description: 'Ciliary body band visible',
    angleStatus: 'Wide open'
  },
  {
    id: 'GON-007',
    shafferGrade: 2,
    scheieGrade: 'II',
    description: 'Posterior TM visible, anterior TM obscured',
    angleStatus: 'Narrow'
  },
  {
    id: 'GON-008',
    shafferGrade: 1,
    scheieGrade: 'III',
    description: 'Only anterior TM/Schwalbe visible',
    angleStatus: 'Very narrow - closure risk'
  }
];

// =============================================================================
// C4: DR CLASSIFICATION
// =============================================================================
export interface DRClassificationQuestion {
  id: string;
  findings: string[];
  correctClassification: string;
  options: string[];
  rule: string;
}

export const DR_CLASSIFICATION_QUESTIONS: DRClassificationQuestion[] = [
  {
    id: 'DRC-001',
    findings: ['Microaneurysms only'],
    correctClassification: 'Mild NPDR',
    options: ['Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'],
    rule: 'MA only = Mild'
  },
  {
    id: 'DRC-002',
    findings: ['Microaneurysms', 'Dot-blot hemorrhages', 'Hard exudates'],
    correctClassification: 'Moderate NPDR',
    options: ['Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'],
    rule: 'More than MA, less than 4-2-1'
  },
  {
    id: 'DRC-003',
    findings: ['Hemorrhages in all 4 quadrants', 'Venous beading in 2 quadrants', 'IRMA in 1 quadrant'],
    correctClassification: 'Severe NPDR',
    options: ['Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'],
    rule: '4-2-1 rule: Any ONE of these'
  },
  {
    id: 'DRC-004',
    findings: ['Neovascularization of disc (NVD)'],
    correctClassification: 'PDR',
    options: ['Moderate NPDR', 'Severe NPDR', 'PDR', 'Very Severe NPDR'],
    rule: 'Any NV = PDR'
  },
  {
    id: 'DRC-005',
    findings: ['Neovascularization elsewhere (NVE)', 'Vitreous hemorrhage'],
    correctClassification: 'High-risk PDR',
    options: ['Severe NPDR', 'PDR', 'High-risk PDR', 'Moderate NPDR'],
    rule: 'NV + VH = High-risk'
  },
  {
    id: 'DRC-006',
    findings: ['Cotton wool spots', 'Venous beading in 1 quadrant'],
    correctClassification: 'Moderate NPDR',
    options: ['Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'],
    rule: 'CWS present but not meeting 4-2-1'
  },
  {
    id: 'DRC-007',
    findings: ['IRMA in all 4 quadrants'],
    correctClassification: 'Severe NPDR',
    options: ['Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'],
    rule: '4-2-1: IRMA in 1+ quadrant qualifies'
  },
  {
    id: 'DRC-008',
    findings: ['NVD > 1/3 disc area'],
    correctClassification: 'High-risk PDR',
    options: ['PDR', 'High-risk PDR', 'Severe NPDR', 'Very Severe NPDR'],
    rule: 'Large NVD = High-risk characteristic'
  },
  {
    id: 'DRC-009',
    findings: ['Venous beading in all 4 quadrants'],
    correctClassification: 'Severe NPDR',
    options: ['Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'],
    rule: '4-2-1: VB in 2+ quadrants qualifies'
  },
  {
    id: 'DRC-010',
    findings: ['Tractional retinal detachment involving macula'],
    correctClassification: 'Advanced PDR',
    options: ['High-risk PDR', 'Advanced PDR', 'Severe NPDR', 'PDR'],
    rule: 'TRD with macular involvement = Advanced'
  }
];

// =============================================================================
// E1: VA CONVERSION
// =============================================================================
export interface VAConversionQuestion {
  id: string;
  givenFormat: 'snellen' | 'decimal' | 'logMAR';
  givenValue: string;
  targetFormat: 'snellen' | 'decimal' | 'logMAR';
  correctAnswer: string;
  allValues: {
    snellen: string;
    decimal: string;
    logMAR: string;
  };
}

export const VA_CONVERSION_QUESTIONS: VAConversionQuestion[] = [
  {
    id: 'VAC-001',
    givenFormat: 'snellen',
    givenValue: '20/20',
    targetFormat: 'logMAR',
    correctAnswer: '0.0',
    allValues: { snellen: '20/20', decimal: '1.0', logMAR: '0.0' }
  },
  {
    id: 'VAC-002',
    givenFormat: 'snellen',
    givenValue: '20/40',
    targetFormat: 'decimal',
    correctAnswer: '0.5',
    allValues: { snellen: '20/40', decimal: '0.5', logMAR: '0.3' }
  },
  {
    id: 'VAC-003',
    givenFormat: 'logMAR',
    givenValue: '1.0',
    targetFormat: 'snellen',
    correctAnswer: '20/200',
    allValues: { snellen: '20/200', decimal: '0.1', logMAR: '1.0' }
  },
  {
    id: 'VAC-004',
    givenFormat: 'decimal',
    givenValue: '0.5',
    targetFormat: 'logMAR',
    correctAnswer: '0.3',
    allValues: { snellen: '20/40', decimal: '0.5', logMAR: '0.3' }
  },
  {
    id: 'VAC-005',
    givenFormat: 'snellen',
    givenValue: '20/100',
    targetFormat: 'decimal',
    correctAnswer: '0.2',
    allValues: { snellen: '20/100', decimal: '0.2', logMAR: '0.7' }
  },
  {
    id: 'VAC-006',
    givenFormat: 'logMAR',
    givenValue: '0.5',
    targetFormat: 'snellen',
    correctAnswer: '20/63',
    allValues: { snellen: '20/63', decimal: '0.32', logMAR: '0.5' }
  },
  {
    id: 'VAC-007',
    givenFormat: 'decimal',
    givenValue: '0.1',
    targetFormat: 'snellen',
    correctAnswer: '20/200',
    allValues: { snellen: '20/200', decimal: '0.1', logMAR: '1.0' }
  },
  {
    id: 'VAC-008',
    givenFormat: 'snellen',
    givenValue: '20/25',
    targetFormat: 'logMAR',
    correctAnswer: '0.1',
    allValues: { snellen: '20/25', decimal: '0.8', logMAR: '0.1' }
  },
  {
    id: 'VAC-009',
    givenFormat: 'logMAR',
    givenValue: '-0.1',
    targetFormat: 'snellen',
    correctAnswer: '20/16',
    allValues: { snellen: '20/16', decimal: '1.25', logMAR: '-0.1' }
  },
  {
    id: 'VAC-010',
    givenFormat: 'decimal',
    givenValue: '2.0',
    targetFormat: 'snellen',
    correctAnswer: '20/10',
    allValues: { snellen: '20/10', decimal: '2.0', logMAR: '-0.3' }
  }
];
