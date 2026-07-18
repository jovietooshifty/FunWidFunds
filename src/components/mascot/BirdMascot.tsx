import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { HummingbirdArt } from "./HummingbirdArt";

export type MascotState = "idle" | "correct" | "incorrect" | "streak";
export type MascotSize = "small" | "medium" | "large";

interface BirdMascotProps {
  state: MascotState;
  message: string | null;
  reducedMotion: boolean;
  streak?: number;
  size?: MascotSize;
}

const BODY_ANIMATIONS: Record<MascotState, TargetAndTransition> = {
  idle: {},
  correct: { y: [0, -26, 0, -12, 0], rotate: [0, -5, 5, 0] },
  incorrect: { rotate: [0, -7, 0], y: [0, 3, 0] },
  streak: { y: [0, -34, 0, -20, 0], rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] },
};

const SIZE_CLASS: Record<MascotSize, string> = {
  small: "mascot--sm",
  medium: "mascot--md",
  large: "mascot--lg",
};

const SPARKLES = [
  { left: "-6%", top: "8%", delay: 0 },
  { left: "82%", top: "2%", delay: 0.12 },
  { left: "96%", top: "48%", delay: 0.24 },
  { left: "-10%", top: "56%", delay: 0.34 },
];

/**
 * The platform guide mascot ("Professor Pico"), used on every screen.
 * Distinct from the selectable learning buddies — never selectable itself.
 * Visuals live in HummingbirdArt; this wrapper owns the state-driven
 * motion, the speech bubble and streak sparkles.
 */
export function BirdMascot({
  state,
  message,
  reducedMotion,
  streak = 0,
  size = "large",
}: BirdMascotProps) {
  return (
    <div className={`mascot mascot--${state} ${SIZE_CLASS[size]}`}>
      {/* static anchor keeps the bubble centered — framer transforms only the inner bubble */}
      <div className="mascot-bubble-anchor">
        <AnimatePresence>
          {message && (
            <motion.div
              key={message + state}
              className={`mascot-bubble mascot-bubble--${state}`}
              role="status"
              aria-live="polite"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 14 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.6 }}
              transition={{ type: "spring", bounce: 0.55 }}
            >
              {message}
              {state === "streak" && streak > 1 && (
                <span className="mascot-bubble-streak"> {streak} in a row!</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="mascot-body"
        key={state === "idle" ? "idle" : `${state}-${streak}`}
        animate={reducedMotion ? { opacity: [0.7, 1] } : BODY_ANIMATIONS[state]}
        transition={{ duration: state === "streak" ? 1.1 : 0.8 }}
      >
        <HummingbirdArt />
      </motion.div>

      {state === "streak" && !reducedMotion && (
        <div className="mascot-sparkles" aria-hidden="true">
          {SPARKLES.map((s, i) => (
            <motion.span
              key={i}
              className="mascot-sparkle"
              style={{ left: s.left, top: s.top }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4], rotate: 40 }}
              transition={{ duration: 1.2, delay: s.delay }}
            >
              ✨
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
