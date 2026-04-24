/**
 * sounds.js
 *
 * Synthesized sound effects via the Web Audio API.
 * No audio files required — all sounds are generated programmatically.
 *
 * Exports:
 *   playQuickWin(streak)   — "item discovered" chime, pitch rises with streak
 *   playCompletion()       — softer, satisfying "done" tone for regular tasks
 *   playHeal()             — RPG health-potion ascending arpeggio
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/**
 * Play a simple tone burst.
 * @param {number}  freq       Hz
 * @param {number}  duration   seconds
 * @param {string}  type       OscillatorNode type
 * @param {number}  gain       0–1
 * @param {number}  startAt    AudioContext time offset
 */
function tone(freq, duration, type = 'sine', gain = 0.3, startAt = 0) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc  = ctx.createOscillator();
  const amp  = ctx.createGain();

  osc.connect(amp);
  amp.connect(ctx.destination);

  osc.type      = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);

  // Quick attack, exponential decay
  amp.gain.setValueAtTime(0, ctx.currentTime + startAt);
  amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);

  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

/**
 * Quick Win completion chime.
 * Plays a rising 3-note arpeggio, pitch increments with streak.
 * @param {number} streak  — hidden streak counter (0-based)
 */
export function playQuickWin(streak = 0) {
  const ctx = getCtx();
  if (!ctx) return;

  // Base chord: C5 arpeggio, pitch ratio scales up with streak (max 2x at streak 8)
  const pitchMult = 1 + Math.min(streak, 8) * 0.07;
  const notes     = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((freq, i) => {
    tone(freq * pitchMult, 0.35, 'triangle', 0.25, i * 0.09);
  });
  // Happy octave pop at the end
  tone(notes[2] * pitchMult * 2, 0.2, 'sine', 0.15, 0.3);
}

/**
 * Standard task completion — softer single tone.
 */
export function playCompletion() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(440, 0.22, 'sine', 0.2, 0);
  tone(554.37, 0.18, 'sine', 0.13, 0.12);
}

/**
 * Health bar heal — ascending RPG arpeggio (Zelda-style).
 */
export function playHeal() {
  const ctx = getCtx();
  if (!ctx) return;
  const notes = [392, 523.25, 659.25, 784, 1046.5]; // G4 → C6
  notes.forEach((freq, i) => {
    tone(freq, 0.28, 'triangle', 0.2, i * 0.07);
  });
}
