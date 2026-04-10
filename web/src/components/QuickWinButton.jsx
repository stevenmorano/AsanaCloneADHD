/**
 * QuickWinButton.jsx
 * 
 * Emergency dopamine button per gamification_logic.md:
 * - Surfaces one random isQuickWin task instantly
 * - Extreme visibility: hot coral, pulsing glow, FAB position
 * - Completion triggers: confetti burst + momentum prompt
 * - Hidden Quick Win Streak tracked (affects visual intensity)
 */

import { useState, useEffect, useRef } from 'react';
import './QuickWinButton.css';

const STREAK_MESSAGES = [
  'Great job! Use that momentum!',
  '🔥 ON FIRE! Keep it going!',
  '⚡ UNSTOPPABLE! You\'re crushing it!',
  '🚀 CHAIN COMBO! What a streak!',
];

function getStreakMessage(streak) {
  const idx = Math.min(streak - 1, STREAK_MESSAGES.length - 1);
  return STREAK_MESSAGES[Math.max(0, idx)];
}

function ConfettiParticle({ color, left, delay, duration }) {
  return (
    <div
      className="confetti-particle"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
      aria-hidden="true"
    />
  );
}

const CONFETTI_COLORS = [
  '#ff6b6b', '#4ecdc4', '#a78bfa', '#fbbf24', '#34d399',
  '#f7a26a', '#60a5fa', '#f472b6',
];

function generateConfetti(count = 24) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 300,
    duration: 600 + Math.random() * 600,
  }));
}

export function QuickWinButton({ onGetQuickWin, onCompleteTask, quickWinStreak }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMomentum, setShowMomentum] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const modalRef = useRef(null);

  function handleOpen() {
    const task = onGetQuickWin();
    if (!task) {
      // No quick wins available — still open modal with empty state
      setCurrentTask(null);
    } else {
      setCurrentTask(task);
    }
    setShowConfetti(false);
    setShowMomentum(false);
    setModalOpen(true);
  }

  function handleComplete() {
    if (!currentTask) return;
    onCompleteTask(currentTask.id);

    // Intensity scales with streak (gamification_logic.md)
    const intensity = Math.min(quickWinStreak + 1, 4);
    const particleCount = 16 + intensity * 8;
    setConfettiParticles(generateConfetti(particleCount));
    setShowConfetti(true);
    setShowMomentum(true);

    setTimeout(() => setShowConfetti(false), 1200);
  }

  function handleGetAnother() {
    const task = onGetQuickWin();
    setCurrentTask(task);
    setShowConfetti(false);
    setShowMomentum(false);
  }

  function handleGoToDashboard() {
    setModalOpen(false);
    setShowMomentum(false);
    setCurrentTask(null);
  }

  function handleClose() {
    setModalOpen(false);
    setShowMomentum(false);
    setCurrentTask(null);
  }

  // Trap focus and close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const streakIntensityClass = quickWinStreak >= 3
    ? 'quick-win-btn--blazing'
    : quickWinStreak >= 1
    ? 'quick-win-btn--glowing'
    : '';

  return (
    <>
      {/* FAB Button */}
      <button
        id="quick-win-fab"
        className={`quick-win-btn ${streakIntensityClass}`}
        onClick={handleOpen}
        aria-label="Quick Win — Get a fast task to build momentum"
        title="Quick Win: Break task paralysis instantly"
      >
        <span className="quick-win-btn__icon" aria-hidden="true">⚡</span>
        <span className="quick-win-btn__label">Quick Win</span>
        {quickWinStreak > 0 && (
          <span className="quick-win-btn__streak" aria-label={`${quickWinStreak} streak`}>
            {quickWinStreak}🔥
          </span>
        )}
      </button>

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          className="qw-overlay"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qw-modal-title"
        >
          <div className="qw-modal" ref={modalRef}>
            {/* Confetti */}
            {showConfetti && (
              <div className="qw-modal__confetti" aria-hidden="true">
                {confettiParticles.map((p) => (
                  <ConfettiParticle key={p.id} {...p} />
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              id="qw-modal-close"
              className="qw-modal__close"
              onClick={handleClose}
              aria-label="Close Quick Win panel"
            >
              ✕
            </button>

            {!showMomentum ? (
              /* Initial state: show the task */
              <>
                <div className="qw-modal__header">
                  <span className="qw-modal__icon" aria-hidden="true">⚡</span>
                  <h2 id="qw-modal-title" className="qw-modal__title">Quick Win</h2>
                  <p className="qw-modal__subtitle">
                    One small win. Massive momentum.
                  </p>
                </div>

                {currentTask ? (
                  <div className="qw-modal__task">
                    <div className="qw-modal__task-card">
                      <span className="qw-modal__task-emoji" aria-hidden="true">✅</span>
                      <div className="qw-modal__task-info">
                        <span className="qw-modal__task-name">{currentTask.title}</span>
                        {currentTask.estimatedDurationMinutes && (
                          <span className="qw-modal__task-duration">
                            ~{currentTask.estimatedDurationMinutes} min
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      id="qw-complete-btn"
                      className="qw-modal__cta"
                      onClick={handleComplete}
                    >
                      ✅ Complete it!
                    </button>
                    <button
                      id="qw-reshuffle-btn"
                      className="qw-modal__secondary"
                      onClick={handleGetAnother}
                    >
                      🔀 Give me another
                    </button>
                  </div>
                ) : (
                  <div className="qw-modal__empty">
                    <p>🎉 All Quick Wins done! You're a superstar.</p>
                    <button className="qw-modal__secondary" onClick={handleClose}>
                      Back to dashboard
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Momentum state: post-completion prompt */
              <div className="qw-modal__momentum">
                <div className="qw-modal__momentum-icon" aria-hidden="true">
                  {quickWinStreak >= 2 ? '🔥' : '🎉'}
                </div>
                <h2 id="qw-modal-title" className="qw-modal__momentum-title">
                  {getStreakMessage(quickWinStreak)}
                </h2>
                {quickWinStreak >= 2 && (
                  <p className="qw-modal__streak-info">
                    {quickWinStreak} wins in a row!
                  </p>
                )}
                <div className="qw-modal__momentum-actions">
                  <button
                    id="qw-dashboard-btn"
                    className="qw-modal__cta"
                    onClick={handleGoToDashboard}
                  >
                    🚀 Jump into my tasks
                  </button>
                  <button
                    id="qw-another-momentum-btn"
                    className="qw-modal__secondary"
                    onClick={handleGetAnother}
                  >
                    ⚡ Grab another win
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
