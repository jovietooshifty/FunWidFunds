import { motion } from "framer-motion";

interface StreakBadgeProps {
  streak: number;
  milestone: boolean;
}

/** Compact pill showing the current consecutive-correct streak. */
export function StreakBadge({ streak, milestone }: StreakBadgeProps) {
  return (
    <div
      className={`streak-badge ${streak === 0 ? "zero" : ""} ${milestone ? "milestone" : ""}`}
      role="status"
      aria-label={`Streak: ${streak} correct in a row`}
    >
      <span className="streak-icon" aria-hidden="true">
        🔥
      </span>
      <span className="streak-label">Streak</span>
      <motion.span
        className="streak-count"
        key={streak}
        initial={{ scale: streak > 0 ? 1.9 : 1, y: streak > 0 ? -6 : 0 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
      >
        {streak}
      </motion.span>
    </div>
  );
}
