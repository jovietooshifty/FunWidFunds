import { useState } from "react";
import { motion } from "framer-motion";
import { useCountryLeaderboard, useClassLeaderboard } from "../hooks/useLeaderboard";
import { AwardDecor, LeaderboardPanel } from "./LeaderboardPanel";
import { sounds } from "../audio/sound";

interface InGameLeaderboardProps {
  studentId: string;
  classId?: string;
  onClose: () => void;
}

/** Leaderboard overlay a student can open without leaving the game. */
export function InGameLeaderboard({ studentId, classId, onClose }: InGameLeaderboardProps) {
  const [tab, setTab] = useState<"country" | "class">("country");
  const { entries: country, loading: countryLoading } = useCountryLeaderboard();
  const { entries: classEntries, loading: classLoading } = useClassLeaderboard(classId);

  return (
    <motion.div
      className="lb-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-label="Leaderboard"
    >
      <motion.div
        className="lb-overlay-card"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <AwardDecor />

        <div className="lb-banner">
          <span className="lb-banner-trophy" aria-hidden="true">🏆</span>
          <span className="lb-banner-title">Leaderboard</span>
          <span className="lb-banner-trophy" aria-hidden="true">🏆</span>
        </div>

        <div className="leaderboard-tabs">
          <button
            type="button"
            className={`lb-tab ${tab === "country" ? "active" : ""}`}
            onClick={() => {
              sounds.click();
              setTab("country");
            }}
          >
            🇹🇹 Local
          </button>
          {classId && (
            <button
              type="button"
              className={`lb-tab ${tab === "class" ? "active" : ""}`}
              onClick={() => {
                sounds.click();
                setTab("class");
              }}
            >
              🎓 My Class
            </button>
          )}
        </div>

        <div className="lb-overlay-scroll">
          {tab === "country" ? (
            countryLoading ? null : (
              <LeaderboardPanel entries={country} highlightStudentId={studentId} />
            )
          ) : classLoading ? null : (
            <LeaderboardPanel
              entries={classEntries}
              highlightStudentId={studentId}
              emptyMessage="No one in your class has played yet!"
            />
          )}
        </div>

        <motion.button
          type="button"
          className="big-button"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sounds.click();
            onClose();
          }}
        >
          Back to Map 🗺️
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
