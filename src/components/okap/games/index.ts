/**
 * OKAP Games - Index
 * Export all game components
 */

// OKAP Games - Individual game components
// Optics (O1-O5)
export { default as VergenceGame } from './VergenceGame.svelte';
export { default as VertexDistanceGame } from './VertexDistanceGame.svelte';
export { default as PrenticeRuleGame } from './PrenticeRuleGame.svelte';
export { default as SphericalEquivalentGame } from './SphericalEquivalentGame.svelte';
export { default as MagnificationGame } from './MagnificationGame.svelte';

// Neuro (N1-N5)
export { default as TriadGame } from './TriadGame.svelte';
export { default as VisualPathwayGame } from './VisualPathwayGame.svelte';
export { default as CN3Game } from './CN3Game.svelte';
export { default as EOMGame } from './EOMGame.svelte';
export { default as VFDefectGame } from './VFDefectGame.svelte';

// Pharmacology (P1-P4)
export { default as DrugMoAGame } from './DrugMoAGame.svelte';
export { default as SideEffectsGame } from './SideEffectsGame.svelte';
export { default as ContraindicationsGame } from './ContraindicationsGame.svelte';
export { default as PupilEffectsGame } from './PupilEffectsGame.svelte';

// Classifications (C1-C4)
export { default as ISNTGame } from './ISNTGame.svelte';
export { default as GonioscopyGame } from './GonioscopyGame.svelte';
export { default as DRClassificationGame } from './DRClassificationGame.svelte';

// Emergency (E1-E2)
export { default as VAConverterGame } from './VAConverterGame.svelte';
export { default as ChemicalBurnGame } from './ChemicalBurnGame.svelte';

// Game ID to Component mapping - ALL 20 GAMES
export const GAME_COMPONENTS = {
  // Optics
  'O1': () => import('./VergenceGame.svelte'),
  'O2': () => import('./VertexDistanceGame.svelte'),
  'O3': () => import('./PrenticeRuleGame.svelte'),
  'O4': () => import('./SphericalEquivalentGame.svelte'),
  'O5': () => import('./MagnificationGame.svelte'),
  // Neuro
  'N1': () => import('./TriadGame.svelte'),
  'N2': () => import('./VisualPathwayGame.svelte'),
  'N3': () => import('./CN3Game.svelte'),
  'N4': () => import('./EOMGame.svelte'),
  'N5': () => import('./VFDefectGame.svelte'),
  // Pharmacology
  'P1': () => import('./DrugMoAGame.svelte'),
  'P2': () => import('./SideEffectsGame.svelte'),
  'P3': () => import('./ContraindicationsGame.svelte'),
  'P4': () => import('./PupilEffectsGame.svelte'),
  // Classifications
  'C1': () => import('./ISNTGame.svelte'),
  'C2': () => import('./ISNTGame.svelte'), // Reuse ISNT for T-thinnest variations
  'C3': () => import('./GonioscopyGame.svelte'),
  'C4': () => import('./DRClassificationGame.svelte'),
  // Emergency
  'E1': () => import('./VAConverterGame.svelte'),
  'E2': () => import('./ChemicalBurnGame.svelte')
};
