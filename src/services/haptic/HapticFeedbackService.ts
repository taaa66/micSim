/**
 * =============================================================================
 * ADVANCED HAPTIC FEEDBACK SERVICE
 * =============================================================================
 * Provides sophisticated haptic feedback for microsurgery simulation:
 * - Force feedback simulation (tissue resistance)
 * - Texture simulation (different tissue types)
 * - Vibration patterns (action-specific feedback)
 * - Full Apple Pencil/Stylus integration
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface IStylusState {
  isConnected: boolean;
  type: 'apple-pencil' | 'stylus' | 'touch' | 'mouse' | 'unknown';
  pressure: number;        // 0-1
  tiltX: number;           // -90 to 90 degrees
  tiltY: number;           // -90 to 90 degrees
  azimuth: number;         // 0-360 degrees
  altitude: number;        // 0-90 degrees
  twist: number;           // 0-360 degrees (for supported devices)
  isEraser: boolean;
  supportsForce: boolean;
  supportsTilt: boolean;
  supportsAzimuth: boolean;
}

export interface IForceProfile {
  id: string;
  name: string;
  nameHe: string;
  baseResistance: number;      // 0-1
  elasticity: number;          // 0-1 (how much it springs back)
  viscosity: number;           // 0-1 (resistance to movement)
  breakThreshold: number;      // Force at which tissue "breaks"
  healRate: number;            // Recovery rate after deformation
}

export interface ITextureProfile {
  id: string;
  name: string;
  nameHe: string;
  roughness: number;           // 0-1
  granularity: number;         // Pattern frequency
  amplitude: number;           // Pattern intensity
  pattern: 'smooth' | 'bumpy' | 'fibrous' | 'granular' | 'layered';
}

export interface IVibrationPattern {
  id: string;
  name: string;
  pattern: number[];           // Duration array [vibrate, pause, vibrate, ...]
  intensity: number;           // 0-1
  frequency: number;           // Hz (for supported devices)
}

export interface IHapticEvent {
  type: 'force' | 'texture' | 'vibration' | 'impact';
  intensity: number;
  duration: number;
  pattern?: IVibrationPattern;
  force?: IForceProfile;
  texture?: ITextureProfile;
  position: { x: number; y: number };
  timestamp: number;
}

export interface IForceFeedbackState {
  currentForce: number;        // 0-1 current resistance
  targetForce: number;         // 0-1 target resistance
  deformation: number;         // 0-1 tissue deformation level
  isBreaking: boolean;         // Near break threshold
  isBroken: boolean;           // Exceeded break threshold
  direction: { x: number; y: number }; // Force direction vector
}

export interface IHapticCapabilities {
  supportsVibration: boolean;
  supportsForceTouch: boolean;
  supportsPressure: boolean;
  supportsTilt: boolean;
  supportsAzimuth: boolean;
  maxVibrationDuration: number;
  vibrationPatternSupport: boolean;
}

// =============================================================================
// TISSUE FORCE PROFILES
// =============================================================================

export const TISSUE_PROFILES: Record<string, IForceProfile> = {
  capsule: {
    id: 'capsule',
    name: 'Lens Capsule',
    nameHe: 'קפסולת העדשה',
    baseResistance: 0.3,
    elasticity: 0.7,
    viscosity: 0.2,
    breakThreshold: 0.85,
    healRate: 0.1
  },
  cornea: {
    id: 'cornea',
    name: 'Cornea',
    nameHe: 'קרנית',
    baseResistance: 0.5,
    elasticity: 0.4,
    viscosity: 0.3,
    breakThreshold: 0.9,
    healRate: 0.05
  },
  sclera: {
    id: 'sclera',
    name: 'Sclera',
    nameHe: 'סקלרה',
    baseResistance: 0.7,
    elasticity: 0.3,
    viscosity: 0.4,
    breakThreshold: 0.95,
    healRate: 0.02
  },
  iris: {
    id: 'iris',
    name: 'Iris',
    nameHe: 'קשתית',
    baseResistance: 0.25,
    elasticity: 0.6,
    viscosity: 0.15,
    breakThreshold: 0.7,
    healRate: 0.15
  },
  vitreous: {
    id: 'vitreous',
    name: 'Vitreous',
    nameHe: 'זגוגית',
    baseResistance: 0.1,
    elasticity: 0.9,
    viscosity: 0.8,
    breakThreshold: 0.5,
    healRate: 0.3
  },
  retina: {
    id: 'retina',
    name: 'Retina',
    nameHe: 'רשתית',
    baseResistance: 0.15,
    elasticity: 0.2,
    viscosity: 0.1,
    breakThreshold: 0.4,
    healRate: 0.0
  },
  suture: {
    id: 'suture',
    name: 'Suture Thread',
    nameHe: 'חוט תפר',
    baseResistance: 0.6,
    elasticity: 0.1,
    viscosity: 0.05,
    breakThreshold: 0.98,
    healRate: 0.0
  }
};

// =============================================================================
// TEXTURE PROFILES
// =============================================================================

export const TEXTURE_PROFILES: Record<string, ITextureProfile> = {
  smooth_membrane: {
    id: 'smooth_membrane',
    name: 'Smooth Membrane',
    nameHe: 'ממברנה חלקה',
    roughness: 0.1,
    granularity: 0.05,
    amplitude: 0.1,
    pattern: 'smooth'
  },
  fibrous_tissue: {
    id: 'fibrous_tissue',
    name: 'Fibrous Tissue',
    nameHe: 'רקמה סיבית',
    roughness: 0.6,
    granularity: 0.3,
    amplitude: 0.4,
    pattern: 'fibrous'
  },
  granular_surface: {
    id: 'granular_surface',
    name: 'Granular Surface',
    nameHe: 'משטח גרגירי',
    roughness: 0.8,
    granularity: 0.7,
    amplitude: 0.5,
    pattern: 'granular'
  },
  layered_tissue: {
    id: 'layered_tissue',
    name: 'Layered Tissue',
    nameHe: 'רקמה שכבתית',
    roughness: 0.4,
    granularity: 0.2,
    amplitude: 0.6,
    pattern: 'layered'
  },
  bumpy_surface: {
    id: 'bumpy_surface',
    name: 'Bumpy Surface',
    nameHe: 'משטח גבשושי',
    roughness: 0.7,
    granularity: 0.5,
    amplitude: 0.7,
    pattern: 'bumpy'
  }
};

// =============================================================================
// VIBRATION PATTERNS
// =============================================================================

export const VIBRATION_PATTERNS: Record<string, IVibrationPattern> = {
  // Surgical action patterns
  incision_start: {
    id: 'incision_start',
    name: 'Incision Start',
    pattern: [50, 30, 50],
    intensity: 0.7,
    frequency: 200
  },
  tissue_contact: {
    id: 'tissue_contact',
    name: 'Tissue Contact',
    pattern: [20],
    intensity: 0.3,
    frequency: 150
  },
  tissue_resistance: {
    id: 'tissue_resistance',
    name: 'Tissue Resistance',
    pattern: [10, 10, 10, 10, 10],
    intensity: 0.5,
    frequency: 100
  },
  tissue_break: {
    id: 'tissue_break',
    name: 'Tissue Break',
    pattern: [100, 50, 200],
    intensity: 1.0,
    frequency: 50
  },
  suture_pull: {
    id: 'suture_pull',
    name: 'Suture Pull',
    pattern: [30, 20, 30, 20, 30],
    intensity: 0.6,
    frequency: 180
  },
  knot_tighten: {
    id: 'knot_tighten',
    name: 'Knot Tighten',
    pattern: [50, 30, 80],
    intensity: 0.8,
    frequency: 120
  },
  
  // Feedback patterns
  success: {
    id: 'success',
    name: 'Success',
    pattern: [50, 50, 100],
    intensity: 0.5,
    frequency: 250
  },
  warning: {
    id: 'warning',
    name: 'Warning',
    pattern: [100, 50, 100, 50, 100],
    intensity: 0.8,
    frequency: 80
  },
  error: {
    id: 'error',
    name: 'Error',
    pattern: [200, 100, 200],
    intensity: 1.0,
    frequency: 60
  },
  gentle_pulse: {
    id: 'gentle_pulse',
    name: 'Gentle Pulse',
    pattern: [15],
    intensity: 0.2,
    frequency: 200
  },
  
  // Guidance patterns
  guide_left: {
    id: 'guide_left',
    name: 'Guide Left',
    pattern: [30, 50, 30],
    intensity: 0.4,
    frequency: 150
  },
  guide_right: {
    id: 'guide_right',
    name: 'Guide Right',
    pattern: [30, 50, 30],
    intensity: 0.4,
    frequency: 150
  },
  guide_slower: {
    id: 'guide_slower',
    name: 'Guide Slower',
    pattern: [100, 100, 100],
    intensity: 0.3,
    frequency: 100
  },
  guide_faster: {
    id: 'guide_faster',
    name: 'Guide Faster',
    pattern: [20, 20, 20, 20, 20],
    intensity: 0.4,
    frequency: 200
  }
};

// =============================================================================
// HAPTIC FEEDBACK SERVICE CLASS
// =============================================================================

export class HapticFeedbackService {
  // Stores
  private stylusState = writable<IStylusState>({
    isConnected: false,
    type: 'unknown',
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    azimuth: 0,
    altitude: 90,
    twist: 0,
    isEraser: false,
    supportsForce: false,
    supportsTilt: false,
    supportsAzimuth: false
  });
  
  private forceFeedback = writable<IForceFeedbackState>({
    currentForce: 0,
    targetForce: 0,
    deformation: 0,
    isBreaking: false,
    isBroken: false,
    direction: { x: 0, y: 0 }
  });
  
  private activeTexture = writable<ITextureProfile | null>(null);
  private hapticEvents = writable<IHapticEvent[]>([]);
  private capabilities = writable<IHapticCapabilities>({
    supportsVibration: false,
    supportsForceTouch: false,
    supportsPressure: false,
    supportsTilt: false,
    supportsAzimuth: false,
    maxVibrationDuration: 0,
    vibrationPatternSupport: false
  });
  
  // Internal state
  private currentTissue: IForceProfile | null = null;
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  private forceAnimationFrame: number | null = null;
  private textureAnimationFrame: number | null = null;
  private isEnabled: boolean = true;
  
  // =============================================================================
  // PUBLIC STORES
  // =============================================================================
  
  get stylus$() { return { subscribe: this.stylusState.subscribe }; }
  get force$() { return { subscribe: this.forceFeedback.subscribe }; }
  get texture$() { return { subscribe: this.activeTexture.subscribe }; }
  get events$() { return { subscribe: this.hapticEvents.subscribe }; }
  get capabilities$() { return { subscribe: this.capabilities.subscribe }; }
  
  // Derived stores
  get isApplePencil$() {
    return derived(this.stylusState, $state => $state.type === 'apple-pencil');
  }
  
  get hasAdvancedHaptics$() {
    return derived(this.capabilities, $caps => 
      $caps.supportsVibration && $caps.vibrationPatternSupport
    );
  }
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  constructor() {
    this.detectCapabilities();
  }
  
  private detectCapabilities(): void {
    const caps: IHapticCapabilities = {
      supportsVibration: 'vibrate' in navigator,
      supportsForceTouch: false,
      supportsPressure: false,
      supportsTilt: false,
      supportsAzimuth: false,
      maxVibrationDuration: 10000,
      vibrationPatternSupport: false
    };
    
    // Check for vibration pattern support
    if (caps.supportsVibration) {
      try {
        navigator.vibrate([1, 1, 1]);
        caps.vibrationPatternSupport = true;
      } catch {
        caps.vibrationPatternSupport = false;
      }
    }
    
    // Force Touch detection (Safari/iOS)
    if ('ontouchforcechange' in document) {
      caps.supportsForceTouch = true;
    }
    
    this.capabilities.set(caps);
  }
  
  // =============================================================================
  // STYLUS HANDLING
  // =============================================================================
  
  processPointerEvent(event: PointerEvent): void {
    const state = get(this.stylusState);
    
    // Detect stylus type
    let type: IStylusState['type'] = 'unknown';
    if (event.pointerType === 'pen') {
      // Check for Apple Pencil characteristics
      if (event.tiltX !== undefined && event.tiltY !== undefined) {
        type = 'apple-pencil';
      } else {
        type = 'stylus';
      }
    } else if (event.pointerType === 'touch') {
      type = 'touch';
    } else if (event.pointerType === 'mouse') {
      type = 'mouse';
    }
    
    // Calculate azimuth and altitude from tilt
    const tiltX = event.tiltX || 0;
    const tiltY = event.tiltY || 0;
    const azimuth = Math.atan2(tiltY, tiltX) * (180 / Math.PI) + 180;
    const altitude = 90 - Math.sqrt(tiltX * tiltX + tiltY * tiltY);
    
    // Update stylus state
    this.stylusState.set({
      isConnected: true,
      type,
      pressure: event.pressure || 0.5,
      tiltX,
      tiltY,
      azimuth,
      altitude: Math.max(0, altitude),
      twist: (event as any).twist || 0,
      isEraser: (event as any).buttons === 32, // Eraser button
      supportsForce: event.pressure !== undefined && event.pressure !== 0.5,
      supportsTilt: tiltX !== 0 || tiltY !== 0,
      supportsAzimuth: true
    });
    
    // Update capabilities based on detected features
    this.capabilities.update(caps => ({
      ...caps,
      supportsPressure: event.pressure !== undefined && event.pressure !== 0.5,
      supportsTilt: tiltX !== 0 || tiltY !== 0,
      supportsAzimuth: true
    }));
    
    // Process force feedback if tissue is active
    if (this.currentTissue) {
      this.updateForceFeedback(event.pressure || 0.5, { x: event.clientX, y: event.clientY });
    }
    
    // Process texture feedback
    const texture = get(this.activeTexture);
    if (texture) {
      this.processTextureFeedback(texture, { x: event.clientX, y: event.clientY });
    }
  }
  
  // =============================================================================
  // FORCE FEEDBACK SIMULATION
  // =============================================================================
  
  setTissue(tissueId: string): void {
    this.currentTissue = TISSUE_PROFILES[tissueId] || null;
    
    if (this.currentTissue) {
      this.forceFeedback.set({
        currentForce: 0,
        targetForce: this.currentTissue.baseResistance,
        deformation: 0,
        isBreaking: false,
        isBroken: false,
        direction: { x: 0, y: 0 }
      });
    }
  }
  
  clearTissue(): void {
    this.currentTissue = null;
    this.forceFeedback.set({
      currentForce: 0,
      targetForce: 0,
      deformation: 0,
      isBreaking: false,
      isBroken: false,
      direction: { x: 0, y: 0 }
    });
  }
  
  private updateForceFeedback(pressure: number, position: { x: number; y: number }): void {
    if (!this.currentTissue || !this.isEnabled) return;
    
    const tissue = this.currentTissue;
    const state = get(this.forceFeedback);
    
    // Calculate movement
    const dx = position.x - this.lastPosition.x;
    const dy = position.y - this.lastPosition.y;
    const movement = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate force based on pressure and movement
    const pressureForce = pressure * tissue.baseResistance;
    const viscousForce = movement * tissue.viscosity * 0.01;
    const totalForce = Math.min(1, pressureForce + viscousForce);
    
    // Calculate deformation
    const deformation = Math.min(1, state.deformation + (totalForce - tissue.elasticity * state.deformation) * 0.1);
    
    // Check break threshold
    const isBreaking = totalForce > tissue.breakThreshold * 0.8;
    const isBroken = totalForce > tissue.breakThreshold;
    
    // Update state
    this.forceFeedback.set({
      currentForce: totalForce,
      targetForce: tissue.baseResistance,
      deformation,
      isBreaking,
      isBroken,
      direction: movement > 0 ? { x: dx / movement, y: dy / movement } : { x: 0, y: 0 }
    });
    
    // Trigger haptic feedback based on force
    if (isBroken && !state.isBroken) {
      this.vibrate('tissue_break');
      this.emitHapticEvent('impact', 1.0, position);
    } else if (isBreaking && !state.isBreaking) {
      this.vibrate('warning');
    } else if (totalForce > 0.5) {
      this.vibrate('tissue_resistance');
    }
    
    this.lastPosition = position;
  }
  
  /**
   * Simulate tissue resistance with visual feedback
   * Returns a resistance factor (0-1) that can be used to slow cursor movement
   */
  calculateResistance(pressure: number, velocity: number): number {
    if (!this.currentTissue) return 0;
    
    const tissue = this.currentTissue;
    const baseResistance = tissue.baseResistance;
    const viscousResistance = velocity * tissue.viscosity * 0.1;
    
    return Math.min(0.9, baseResistance + viscousResistance);
  }
  
  // =============================================================================
  // TEXTURE SIMULATION
  // =============================================================================
  
  setTexture(textureId: string): void {
    this.activeTexture.set(TEXTURE_PROFILES[textureId] || null);
  }
  
  clearTexture(): void {
    this.activeTexture.set(null);
  }
  
  private processTextureFeedback(texture: ITextureProfile, position: { x: number; y: number }): void {
    if (!this.isEnabled) return;
    
    // Calculate texture-based vibration
    const textureValue = this.calculateTextureValue(texture, position);
    
    if (textureValue > texture.roughness * 0.5) {
      // Generate micro-vibration for texture feedback
      const duration = Math.round(5 + textureValue * 10);
      this.microVibrate(duration);
    }
  }
  
  private calculateTextureValue(texture: ITextureProfile, position: { x: number; y: number }): number {
    // Generate procedural texture value based on position and pattern
    const { x, y } = position;
    const freq = texture.granularity * 0.1;
    
    let value = 0;
    switch (texture.pattern) {
      case 'smooth':
        value = Math.sin(x * freq) * Math.sin(y * freq) * 0.1;
        break;
      case 'bumpy':
        value = Math.abs(Math.sin(x * freq * 3) * Math.cos(y * freq * 3));
        break;
      case 'fibrous':
        value = Math.abs(Math.sin(x * freq + y * freq * 0.5));
        break;
      case 'granular':
        value = (Math.sin(x * freq * 5) + Math.cos(y * freq * 7)) * 0.5 + 0.5;
        break;
      case 'layered':
        value = Math.abs(Math.sin(y * freq * 2)) * 0.7;
        break;
    }
    
    return value * texture.amplitude;
  }
  
  /**
   * Get texture feedback intensity for visual rendering
   */
  getTextureIntensity(position: { x: number; y: number }): number {
    const texture = get(this.activeTexture);
    if (!texture) return 0;
    return this.calculateTextureValue(texture, position);
  }
  
  // =============================================================================
  // VIBRATION PATTERNS
  // =============================================================================
  
  vibrate(patternId: string): void {
    if (!this.isEnabled) return;
    
    const pattern = VIBRATION_PATTERNS[patternId];
    if (!pattern) return;
    
    const caps = get(this.capabilities);
    if (!caps.supportsVibration) return;
    
    try {
      if (caps.vibrationPatternSupport) {
        navigator.vibrate(pattern.pattern);
      } else {
        // Fallback to single vibration
        const totalDuration = pattern.pattern.reduce((a, b) => a + b, 0);
        navigator.vibrate(Math.min(totalDuration, caps.maxVibrationDuration));
      }
    } catch (e) {
      console.warn('Vibration failed:', e);
    }
    
    // Emit event
    this.emitHapticEvent('vibration', pattern.intensity, this.lastPosition, pattern);
  }
  
  private microVibrate(duration: number): void {
    const caps = get(this.capabilities);
    if (!caps.supportsVibration || !this.isEnabled) return;
    
    try {
      navigator.vibrate(Math.min(duration, 20));
    } catch {
      // Ignore micro-vibration failures
    }
  }
  
  customVibrate(pattern: number[]): void {
    const caps = get(this.capabilities);
    if (!caps.supportsVibration || !this.isEnabled) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Custom vibration failed:', e);
    }
  }
  
  stopVibration(): void {
    try {
      navigator.vibrate(0);
    } catch {
      // Ignore
    }
  }
  
  // =============================================================================
  // HAPTIC EVENTS
  // =============================================================================
  
  private emitHapticEvent(
    type: IHapticEvent['type'],
    intensity: number,
    position: { x: number; y: number },
    pattern?: IVibrationPattern
  ): void {
    const event: IHapticEvent = {
      type,
      intensity,
      duration: pattern?.pattern.reduce((a, b) => a + b, 0) || 0,
      pattern,
      force: this.currentTissue || undefined,
      texture: get(this.activeTexture) || undefined,
      position,
      timestamp: performance.now()
    };
    
    this.hapticEvents.update(events => {
      const recent = events.filter(e => performance.now() - e.timestamp < 5000);
      return [...recent, event].slice(-50);
    });
  }
  
  // =============================================================================
  // SURGICAL ACTION HAPTICS
  // =============================================================================
  
  /**
   * Trigger haptic feedback for incision start
   */
  onIncisionStart(): void {
    this.vibrate('incision_start');
    this.emitHapticEvent('impact', 0.7, this.lastPosition);
  }
  
  /**
   * Trigger haptic feedback for tissue contact
   */
  onTissueContact(): void {
    this.vibrate('tissue_contact');
  }
  
  /**
   * Trigger haptic feedback for suture pull
   */
  onSuturePull(tension: number): void {
    if (tension > 0.7) {
      this.vibrate('suture_pull');
    } else {
      this.vibrate('gentle_pulse');
    }
  }
  
  /**
   * Trigger haptic feedback for knot tightening
   */
  onKnotTighten(): void {
    this.vibrate('knot_tighten');
  }
  
  /**
   * Trigger success feedback
   */
  onSuccess(): void {
    this.vibrate('success');
  }
  
  /**
   * Trigger warning feedback
   */
  onWarning(): void {
    this.vibrate('warning');
  }
  
  /**
   * Trigger error feedback
   */
  onError(): void {
    this.vibrate('error');
  }
  
  // =============================================================================
  // GUIDANCE HAPTICS
  // =============================================================================
  
  /**
   * Guide user to move left
   */
  guideLeft(): void {
    this.vibrate('guide_left');
  }
  
  /**
   * Guide user to move right
   */
  guideRight(): void {
    this.vibrate('guide_right');
  }
  
  /**
   * Guide user to slow down
   */
  guideSlower(): void {
    this.vibrate('guide_slower');
  }
  
  /**
   * Guide user to speed up
   */
  guideFaster(): void {
    this.vibrate('guide_faster');
  }
  
  /**
   * Provide directional guidance based on deviation
   */
  guideDirection(deviation: { x: number; y: number }, threshold: number = 10): void {
    if (Math.abs(deviation.x) > threshold) {
      if (deviation.x > 0) {
        this.guideLeft();
      } else {
        this.guideRight();
      }
    }
  }
  
  // =============================================================================
  // CONFIGURATION
  // =============================================================================
  
  enable(): void {
    this.isEnabled = true;
  }
  
  disable(): void {
    this.isEnabled = false;
    this.stopVibration();
  }
  
  isHapticEnabled(): boolean {
    return this.isEnabled;
  }
  
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopVibration();
    }
  }
  
  // =============================================================================
  // CLEANUP
  // =============================================================================
  
  destroy(): void {
    this.stopVibration();
    if (this.forceAnimationFrame) {
      cancelAnimationFrame(this.forceAnimationFrame);
    }
    if (this.textureAnimationFrame) {
      cancelAnimationFrame(this.textureAnimationFrame);
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const hapticService = new HapticFeedbackService();
