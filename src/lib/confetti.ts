import confetti from 'canvas-confetti';

export const triggerBadgeConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Purple and multi-color confetti
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#9b59b6', '#e74c3c', '#3498db', '#f39c12', '#1abc9c'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#c084fc', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'],
    });
  }, 250);
};

export const triggerTaskCompleteConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#9b59b6', '#c084fc', '#e879f9', '#06b6d4', '#10b981'],
  });
};

export const triggerLevelUpConfetti = () => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#9b59b6', '#c084fc', '#e879f9'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#9b59b6', '#c084fc', '#e879f9'],
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  }());
};
