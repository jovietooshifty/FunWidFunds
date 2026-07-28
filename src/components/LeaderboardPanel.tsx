import { motion } from "framer-motion";
import type { LeaderboardEntry } from "../hooks/useLeaderboard";
import { prefersReducedMotion } from "../motion";

const MEDALS = ["", "medal-gold", "medal-silver", "medal-bronze"];

const DECOR: { e: string; top: string; left: string; size: string; delay: number }[] = [
  { e: "🏆", top: "8%", left: "6%", size: "2.6rem", delay: 0 },
  { e: "🏅", top: "18%", left: "88%", size: "2.2rem", delay: 0.4 },
  { e: "🎖️", top: "42%", left: "4%", size: "2rem", delay: 0.8 },
  { e: "⭐", top: "58%", left: "92%", size: "1.8rem", delay: 0.2 },
  { e: "🥇", top: "72%", left: "8%", size: "2.2rem", delay: 0.6 },
  { e: "🎗️", top: "84%", left: "84%", size: "2rem", delay: 1 },
];

export function AwardDecor() {
  const reduced = prefersReducedMotion();
  return (
    <div className="award-decor" aria-hidden="true">
      {DECOR.map((d, i) => (
        <motion.span
          key={i}
          className="award-decor-item"
          style={{ top: d.top, left: d.left, fontSize: d.size }}
          animate={reduced ? undefined : { y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{
            repeat: Infinity,
            duration: 4 + i * 0.3,
            ease: "easeInOut",
            delay: d.delay,
          }}
        >
          {d.e}
        </motion.span>
      ))}
    </div>
  );
}

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  /** Highlights this player's row ("you"). */
  highlightStudentId?: string;
  emptyMessage?: string;
}

export function LeaderboardPanel({
  entries,
  highlightStudentId,
  emptyMessage = "No scores yet. Start playing!",
}: LeaderboardPanelProps) {
  if (entries.length === 0) {
    return <p className="dashboard-empty">{emptyMessage}</p>;
  }

  return (
    <div className="leaderboard-table">
      {entries.map((entry, i) => {
        const isYou = highlightStudentId && entry.student_id === highlightStudentId;
        return (
          <motion.div
            key={entry.student_id}
            className={`leaderboard-row ${MEDALS[i + 1] ?? ""} ${isYou ? "is-you" : ""}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.5) }}
          >
            <span className="lb-rank">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </span>
            <span className="lb-emoji">
              {i === 0 && (
                <span className="lb-crown" aria-hidden="true">
                  👑
                </span>
              )}
              {entry.emoji}
            </span>
            <span className="lb-name">
              {entry.name}
              {isYou && <span className="lb-you-tag">YOU</span>}
            </span>
            <span className="lb-stars">
              <span className="lb-stars-icons">
                {"⭐".repeat(Math.min(entry.total_stars, 5))}
              </span>
              <span className="lb-stars-num">{entry.total_stars}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
