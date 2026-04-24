/**
 * confetti.js
 *
 * Lightweight canvas-based confetti burst.
 * No external dependency — pure vanilla JS injected into the document body.
 *
 * Usage:
 *   import { burstConfetti } from '../utils/confetti';
 *   burstConfetti({ x: 200, y: 300, intensity: 1.5 });
 *
 * intensity: 1 = standard, 2+ = bigger burst (Quick Win streak multiplier)
 */

const COLORS = [
  '#7c6af7', '#a78bfa', '#34d399', '#fb923c',
  '#f472b6', '#facc15', '#60a5fa', '#f87171',
];

export function burstConfetti({ x, y, intensity = 1 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx    = canvas.getContext('2d');
  const count  = Math.round(60 * intensity);
  const cx     = x ?? canvas.width  / 2;
  const cy     = y ?? canvas.height / 2;
  const speed  = 8 + 4 * intensity;

  const particles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const v     = (Math.random() * 0.6 + 0.4) * speed;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - 5,  // initial upward kick
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 5 + 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      alpha: 1,
      decay: 0.018 + Math.random() * 0.01,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    };
  });

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      if (p.alpha <= 0) continue;
      alive++;
      p.vy += 0.3; // gravity
      p.x  += p.vx;
      p.y  += p.vy;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive > 0) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  frame = requestAnimationFrame(animate);

  // Cleanup safety net (5s max)
  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 5000);
}
