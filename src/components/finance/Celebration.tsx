"use client";

import confetti from "canvas-confetti";

const ORANGE = ["#F97316", "#FB923C", "#FED7AA"];
const SUCCESS = ["#22C55E", "#86EFAC", "#16A34A"];
const NEUTRAL = ["#FFFFFF", "#FED7AA", "#22C55E"];

/**
 * Dispara a animação de festejo: confete em cascata com gradiente
 * laranja + verde, mais um burst central.
 */
export function celebrate() {
  if (typeof window === "undefined") return;

  const duration = 1600;
  const end = Date.now() + duration;

  // Burst central
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.55 },
    colors: NEUTRAL,
    scalar: 0.9,
    zIndex: 9999,
  });

  // Cascata lateral (esquerda + direita)
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      startVelocity: 45,
      origin: { x: 0, y: 0.7 },
      colors: ORANGE,
      zIndex: 9999,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      startVelocity: 45,
      origin: { x: 1, y: 0.7 },
      colors: SUCCESS,
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
