/**
 * =============================================================================
 * CONFETTI CELEBRATION EFFECTS
 * =============================================================================
 * Canvas-based confetti animations for achievements and celebrations
 * =============================================================================
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  shape: 'square' | 'circle' | 'star';
}

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  colors?: string[];
  origin?: { x: number; y: number };
  shapes?: ('square' | 'circle' | 'star')[];
}

const defaultColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
  '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe',
  '#00b894', '#fdcb6e', '#e17055', '#0984e3'
];

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animationId: number | null = null;

function initCanvas(): void {
  if (typeof document === 'undefined') return;
  
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99999;
    `;
    document.body.appendChild(canvas);
  }
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
}

function createParticle(options: ConfettiOptions): Particle {
  const angle = (Math.random() * (options.spread || 90) - (options.spread || 90) / 2) * Math.PI / 180;
  const velocity = (options.startVelocity || 45) * (0.5 + Math.random() * 0.5);
  const colors = options.colors || defaultColors;
  const shapes = options.shapes || ['square', 'circle'];
  
  return {
    x: (options.origin?.x || 0.5) * window.innerWidth,
    y: (options.origin?.y || 0.5) * window.innerHeight,
    vx: Math.sin(angle) * velocity,
    vy: -Math.cos(angle) * velocity - Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 8,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 20,
    life: 0,
    maxLife: 150 + Math.random() * 100,
    shape: shapes[Math.floor(Math.random() * shapes.length)]
  };
}

function drawParticle(p: Particle): void {
  if (!ctx) return;
  
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation * Math.PI / 180);
  ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
  ctx.fillStyle = p.color;
  
  switch (p.shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'star':
      drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
      break;
    default:
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
  }
  
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function animate(): void {
  if (!ctx || !canvas) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.5; // gravity
    p.vx *= 0.99; // air resistance
    p.rotation += p.rotationSpeed;
    p.life++;
    
    if (p.life < p.maxLife) {
      drawParticle(p);
      return true;
    }
    return false;
  });
  
  if (particles.length > 0) {
    animationId = requestAnimationFrame(animate);
  } else {
    cleanup();
  }
}

function cleanup(): void {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Fire confetti celebration
 */
export function confetti(options: ConfettiOptions = {}): void {
  initCanvas();
  
  const count = options.particleCount || 100;
  
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(options));
  }
  
  if (!animationId) {
    animate();
  }
}

/**
 * Fire confetti from both sides (celebration burst)
 */
export function celebrationBurst(): void {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
    startVelocity: 55
  });
  
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0.9, y: 0.6 },
    startVelocity: 55
  });
}

/**
 * Fire confetti from center (achievement unlocked)
 */
export function achievementUnlocked(): void {
  confetti({
    particleCount: 150,
    spread: 180,
    origin: { x: 0.5, y: 0.5 },
    startVelocity: 40,
    colors: ['#ffd700', '#ffb700', '#ff9500', '#ffffff', '#ffeaa7'],
    shapes: ['star', 'circle']
  });
}

/**
 * Fire confetti rain from top
 */
export function confettiRain(): void {
  const duration = 3000;
  const end = Date.now() + duration;
  
  function frame() {
    confetti({
      particleCount: 3,
      spread: 180,
      origin: { x: Math.random(), y: -0.1 },
      startVelocity: 10,
      gravity: 1
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }
  
  frame();
}

/**
 * Fire emoji-style celebration
 */
export function emojiCelebration(emoji: string = '🎉'): void {
  if (typeof document === 'undefined') return;
  
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.textContent = emoji;
    el.style.cssText = `
      position: fixed;
      font-size: ${20 + Math.random() * 20}px;
      left: ${Math.random() * 100}vw;
      top: 100vh;
      z-index: 99999;
      pointer-events: none;
      animation: emojiFloat ${2 + Math.random() * 2}s ease-out forwards;
    `;
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 4000);
  }
  
  // Add animation if not exists
  if (!document.getElementById('emoji-animation-style')) {
    const style = document.createElement('style');
    style.id = 'emoji-animation-style';
    style.textContent = `
      @keyframes emojiFloat {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-120vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default {
  confetti,
  celebrationBurst,
  achievementUnlocked,
  confettiRain,
  emojiCelebration
};
