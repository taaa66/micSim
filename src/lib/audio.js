let ctx = null;
let clickBuffer = null;
let chimeBuffer = null;
let humNode = null;
let humGain = null;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window['webkitAudioContext'])();
  return ctx;
}

function makeClick() {
  const c = ensureCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.value = 220;
  g.gain.value = 0.0001;
  o.connect(g).connect(c.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.02, c.currentTime + 0.005);
  o.stop(c.currentTime + 0.02);
}

function makeChime() {
  const c = ensureCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, c.currentTime);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.03, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.25);
}

function startHum() {
  const c = ensureCtx();
  if (humNode) return;
  humNode = c.createOscillator();
  humGain = c.createGain();
  humNode.type = 'sine';
  humNode.frequency.value = 50; // subtle system hum
  humGain.gain.value = 0.0003;
  humNode.connect(humGain).connect(c.destination);
  humNode.start();
}

export const audio = {
  init() {
    try { ensureCtx(); startHum(); } catch (_) {}
  },
  click() { try { makeClick(); } catch (_) {} },
  chime() { try { makeChime(); } catch (_) {} },
  setHum(on) {
    const c = ensureCtx();
    if (on) startHum(); else if (humNode) { humNode.stop(); humNode.disconnect(); humNode = null; }
  }
};
