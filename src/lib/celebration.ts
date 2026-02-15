/**
 * Celebration Effects
 *
 * Thin wrapper around canvas-confetti for milestone celebrations.
 * Respects prefers-reduced-motion and seniors mode settings.
 */

import confetti from "canvas-confetti";

type CelebrationType = "badge" | "streak" | "goal" | "milestone" | "debt-free";

/**
 * Fire a celebration effect based on the type of achievement.
 * No-ops if the user prefers reduced motion.
 */
export function celebrate(type: CelebrationType): void {
  if (typeof window === "undefined") return;

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  // Check if seniors mode with reduced motion is active
  const isSeniorsReducedMotion =
    document.documentElement.classList.contains("seniors-reduce-motion");
  if (isSeniorsReducedMotion) return;

  switch (type) {
    case "badge":
      // Subtle burst for badge unlocks
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#14b8a6", "#0891b2", "#10b981"],
        disableForReducedMotion: true,
      });
      break;

    case "streak":
      // Side cannons for streak milestones
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#f59e0b", "#f97316", "#ef4444"],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#f59e0b", "#f97316", "#ef4444"],
        disableForReducedMotion: true,
      });
      break;

    case "goal":
      // Big celebration for goal reached
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#14b8a6", "#10b981", "#22d3ee", "#06b6d4"],
        disableForReducedMotion: true,
      });
      break;

    case "debt-free":
      // Grand celebration for debt payoff
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ["#10b981", "#14b8a6", "#06b6d4", "#f59e0b"],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ["#10b981", "#14b8a6", "#06b6d4", "#f59e0b"],
          disableForReducedMotion: true,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      break;

    case "milestone":
    default:
      // Standard celebration
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.65 },
        colors: ["#14b8a6", "#0891b2", "#f59e0b", "#10b981"],
        disableForReducedMotion: true,
      });
      break;
  }
}

/**
 * Map achievement rarity to celebration type.
 */
export function celebrateAchievement(rarity: string): void {
  switch (rarity) {
    case "legendary":
      celebrate("debt-free");
      break;
    case "rare":
      celebrate("goal");
      break;
    case "uncommon":
      celebrate("badge");
      break;
    case "common":
    default:
      celebrate("badge");
      break;
  }
}
