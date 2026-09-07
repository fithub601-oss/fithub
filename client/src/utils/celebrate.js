import confetti from 'canvas-confetti';

const COLORS = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#ffffff'];

export const popConfetti = () => {
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.6 },
    colors: COLORS,
    disableForReducedMotion: true
  });
};

export const bigCelebration = () => {
  popConfetti();
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: COLORS,
      disableForReducedMotion: true
    });
  }, 250);
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: COLORS,
      disableForReducedMotion: true
    });
  }, 400);
};
