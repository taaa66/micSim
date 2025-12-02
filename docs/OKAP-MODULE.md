# OKAP Rapid-Fire Knowledge Module

## Clinical & Educational Documentation

---

## Overview

The OKAP (Ophthalmic Knowledge Assessment Program) Rapid-Fire module is designed to prepare ophthalmology residents for board examinations through **active recall** methodology—a learning technique proven to be significantly more effective than passive review.

### Why Active Recall?

Research consistently demonstrates that testing oneself on material produces stronger long-term retention than re-reading or highlighting:

> "The testing effect shows that the act of retrieving information from memory strengthens the memory trace more than additional study." — Roediger & Karpicke, 2006

Our implementation adds **time pressure** (15 seconds per question) to simulate the cognitive demands of clinical decision-making, where rapid pattern recognition is essential.

---

## Module Architecture

### 5 Clinical Categories

| Category | Focus Area | OKAP Weight | Games |
|----------|------------|-------------|-------|
| **Optics** | Refraction, lenses, optical principles | ~15% | 5 |
| **Neuro-Ophthalmology** | Cranial nerves, visual pathway, pupil | ~12% | 5 |
| **Pharmacology** | Glaucoma medications, autonomic drugs | ~10% | 4 |
| **Classifications** | Grading systems, diagnostic criteria | ~8% | 4 |
| **Emergency** | Acute management, triage protocols | ~5% | 2 |

### 20 Individual Games

Each game targets a specific high-yield topic with a unique game mechanic optimized for that content type.

---

## Detailed Game Specifications

### Module 1: Optics (O1-O5)

#### O1: Vergence Shift Machine
- **OKAP Topic**: Vergence formula (U + D = V)
- **Mechanic**: Equation completion
- **Question Format**: Given 2 of 3 variables, calculate the missing value
- **Clinical Relevance**: Foundation for understanding lens power and image formation
- **Example**:
  ```
  U = -2.00 D, D = +5.00 D, V = ?
  Answer: +3.00 D
  ```

#### O2: Vertex Distance Race
- **OKAP Topic**: Effective power changes with vertex distance
- **Mechanic**: Conceptual sorting
- **Question Format**: Classify lens movements as increasing or decreasing effective power
- **Clinical Relevance**: Critical for high-power spectacle prescriptions

#### O3: Prentice's Rule Roulette
- **OKAP Topic**: Prism induced by decentration (P = F × d)
- **Mechanic**: Calculation + direction identification
- **Question Format**: Calculate prism amount and identify base direction
- **Clinical Relevance**: Understanding unwanted prismatic effects

#### O4: Spherical Equivalent
- **OKAP Topic**: SE = Sphere + ½ Cylinder
- **Mechanic**: Matching pairs
- **Question Format**: Match prescriptions to their spherical equivalent
- **Clinical Relevance**: Contact lens fitting, refractive surgery planning

#### O5: Spectacle Zoom
- **OKAP Topic**: Spectacle magnification (~2% per diopter)
- **Mechanic**: Quick calculation
- **Question Format**: Calculate magnification percentage
- **Clinical Relevance**: Aniseikonia management

---

### Module 2: Neuro-Ophthalmology (N1-N5)

#### N1: Triad Identification
- **OKAP Topic**: Classic neuro-ophthalmic syndromes
- **Mechanic**: Drag-drop triad selection
- **Question Format**: Select 3 symptoms that define a syndrome
- **Clinical Relevance**: Pattern recognition for Horner's, Parinaud's, etc.

#### N2: Visual Pathway Puzzle
- **OKAP Topic**: Lesion localization and RAPD
- **Mechanic**: Anatomical mapping
- **Question Format**: Place lesion, predict visual field defect and RAPD
- **Clinical Relevance**: Neuroimaging correlation

#### N3: The CN III Norm ✅ *Implemented*
- **OKAP Topic**: CN III palsy—pupil involvement significance
- **Mechanic**: True/False rapid-fire
- **Question Format**: Rapid statements about CN III anatomy and pathology
- **Clinical Relevance**: Distinguishing surgical vs. medical third nerve palsy
- **Sample Questions**:
  - "Pupil-sparing CN III palsy is more likely ischemic" → TRUE
  - "Complete CN III palsy always involves the pupil" → FALSE

#### N4: Who Moves Whom? ✅ *Implemented*
- **OKAP Topic**: Extraocular muscle actions and innervation
- **Mechanic**: Multiple choice
- **Question Format**: Identify primary/secondary actions in different gaze positions
- **Clinical Relevance**: Strabismus evaluation, cranial nerve palsy diagnosis
- **Key Mnemonic**: LR6 SO4 R3

#### N5: VF Defect Diagnosis
- **OKAP Topic**: Visual field patterns and localization
- **Mechanic**: Image classification
- **Question Format**: Match VF pattern to anatomical lesion
- **Clinical Relevance**: Stroke, tumor, glaucoma differentiation

---

### Module 3: Glaucoma & Pharmacology (P1-P4)

#### P1: MoA - Who Against Whom? ✅ *Implemented*
- **OKAP Topic**: Glaucoma drug mechanisms
- **Mechanic**: Two-column sorting
- **Question Format**: Classify drugs as decreasing production vs. increasing outflow
- **Clinical Relevance**: Rational polypharmacy, mechanism-based selection
- **Drug Classes**:
  - Decrease Production: Beta-blockers, CAIs, Alpha-2 agonists
  - Increase Outflow: Prostaglandins, Rho kinase inhibitors, Miotics

#### P2: Signature Symptom
- **OKAP Topic**: Unique side effects by drug class
- **Mechanic**: Matching pairs
- **Question Format**: Match rare side effect to drug family
- **Clinical Relevance**: Anticipating and recognizing adverse effects
- **Examples**:
  - Eyelash growth → Prostaglandin analogs
  - Metallic taste → Carbonic anhydrase inhibitors

#### P3: Systemic Risk Equation
- **OKAP Topic**: Contraindications (e.g., beta-blockers in asthma)
- **Mechanic**: Case-based exclusion
- **Question Format**: Given patient profile, identify contraindicated drug
- **Clinical Relevance**: Safe prescribing, avoiding adverse events

#### P4: Miosis or Mydriasis?
- **OKAP Topic**: Pupil effects of ophthalmic drugs
- **Mechanic**: Binary classification
- **Question Format**: Classify drug by pupil effect
- **Clinical Relevance**: Understanding autonomic pharmacology

---

### Module 4: Classifications & Rules (C1-C4)

#### C1: The ISNT Series ✅ *Implemented*
- **OKAP Topic**: ISNT rule for optic disc evaluation
- **Mechanic**: Sequencing
- **Question Format**: Order neuroretinal rim thickness (I > S > N > T)
- **Clinical Relevance**: Glaucoma screening, disc assessment
- **Correct Order**: Inferior → Superior → Nasal → Temporal

#### C2: T-thinnest Exception
- **OKAP Topic**: ISNT rule variations
- **Mechanic**: Image classification
- **Question Format**: Identify when ISNT rule may not apply
- **Clinical Relevance**: Avoiding false positives in glaucoma diagnosis

#### C3: Gonioscopy Contradiction
- **OKAP Topic**: Shaffer vs. Scheie grading systems
- **Mechanic**: Opposite pairing
- **Question Format**: Match grades between systems (4 = open in Shaffer, closed in Scheie)
- **Clinical Relevance**: Accurate angle documentation

#### C4: DR Classification
- **OKAP Topic**: Diabetic retinopathy staging
- **Mechanic**: Case classification
- **Question Format**: Classify findings as Mild/Moderate/Severe NPDR or PDR
- **Clinical Relevance**: Treatment timing, referral decisions
- **Key Rule**: 4-2-1 for severe NPDR

---

### Module 5: VA & Emergency (E1-E2)

#### E1: Olympic VA Converter
- **OKAP Topic**: Visual acuity notation systems
- **Mechanic**: Triple matching
- **Question Format**: Match VA across Snellen, decimal, and LogMAR
- **Clinical Relevance**: International communication, research interpretation

#### E2: Chemical Burn Protocol ✅ *Implemented*
- **OKAP Topic**: Emergency management sequence
- **Mechanic**: Sequencing
- **Question Format**: Order the steps of chemical burn management
- **Clinical Relevance**: Time-critical intervention
- **Correct Order**:
  1. Anesthetize
  2. 30-minute irrigation
  3. Eyelid eversion (sweep fornices)
  4. pH check
  5. Urgent referral

---

## Scoring System

### Point Calculation

```
Base Points:           100 per correct answer
Speed Bonus:           Up to 50 points (faster = more)
Streak Multiplier:     10% per consecutive correct (max 2x)
Perfect Game Bonus:    500 points for 100% accuracy
```

### Grade Thresholds

| Grade | Accuracy | Interpretation |
|-------|----------|----------------|
| **S** | ≥95% | Exceptional—ready for boards |
| **A** | ≥85% | Strong—minor review needed |
| **B** | ≥70% | Competent—focused study recommended |
| **C** | ≥50% | Developing—significant review needed |
| **D** | <50% | Needs intensive review |

---

## Implementation Status

| Game | Status | Mechanic | Questions |
|------|--------|----------|-----------|
| O1 | ✅ Complete | Equation | 10 |
| O2 | 📋 Defined | Sorting | 8 |
| O3 | 📋 Defined | Calculation | 10 |
| O4 | 📋 Defined | Matching | 10 |
| O5 | 📋 Defined | Calculation | 10 |
| N1 | 📋 Defined | Drag-drop | 8 |
| N2 | 📋 Defined | Mapping | 8 |
| N3 | ✅ Complete | True/False | 12 |
| N4 | ✅ Complete | Multi-choice | 10 |
| N5 | 📋 Defined | Classification | 10 |
| P1 | ✅ Complete | Two-column | 10 |
| P2 | 📋 Defined | Matching | 10 |
| P3 | 📋 Defined | Exclusion | 8 |
| P4 | 📋 Defined | Classification | 10 |
| C1 | ✅ Complete | Sequencing | 6 |
| C2 | 📋 Defined | Classification | 6 |
| C3 | 📋 Defined | Pairing | 8 |
| C4 | 📋 Defined | Classification | 10 |
| E1 | 📋 Defined | Triple-match | 10 |
| E2 | ✅ Complete | Sequencing | 6 |

**Total**: 6/20 games fully implemented, 14 defined with question banks

---

## Pedagogical Validation

### Alignment with OKAP Blueprint

Content distribution mirrors the OKAP examination blueprint published by the American Academy of Ophthalmology, ensuring study time is allocated proportionally to exam weight.

### Evidence-Based Design Principles

1. **Testing Effect**: Active retrieval strengthens memory more than passive review
2. **Spacing Effect**: Distributed practice outperforms massed practice
3. **Interleaving**: Mixing topics improves discrimination and transfer
4. **Immediate Feedback**: Corrects misconceptions before they consolidate
5. **Desirable Difficulty**: Time pressure creates optimal challenge level

---

## Future Enhancements

### Planned Features

- **Adaptive Difficulty**: Algorithm adjusts based on performance
- **Spaced Repetition**: Prioritize weak areas automatically
- **Detailed Explanations**: Post-answer educational content
- **Image-Based Questions**: Fundus photos, OCT, visual fields
- **Custom Question Sets**: Faculty-created content

### Integration Opportunities

- **Residency Management Systems**: Sync progress with training records
- **CME Platforms**: Credit for completion
- **Research**: De-identified data for educational research

---

## References

1. Roediger, H.L., & Karpicke, J.D. (2006). Test-enhanced learning. *Psychological Science*.
2. American Academy of Ophthalmology. OKAP Examination Blueprint.
3. Larsen, D.P., et al. (2009). Repeated testing improves long-term retention. *Medical Education*.
4. Kerfoot, B.P. (2010). Adaptive spaced education improves learning efficiency. *Journal of Urology*.

---

*Document Version: 1.0 | Last Updated: December 2024*
