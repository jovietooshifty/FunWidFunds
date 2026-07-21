import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useLeaderboard, type LeaderboardEntry } from "../../hooks/useLeaderboard";
import { supabase } from "../../lib/supabase";
import { prefersReducedMotion } from "../../motion";

const MEDALS = ["", "medal-gold", "medal-silver", "medal-bronze"];

// Award decorations scattered behind the board.
const DECOR: { e: string; top: string; left: string; size: string; delay: number }[] = [
  { e: "🏆", top: "8%", left: "6%", size: "2.6rem", delay: 0 },
  { e: "🏅", top: "18%", left: "88%", size: "2.2rem", delay: 0.4 },
  { e: "🎖️", top: "42%", left: "4%", size: "2rem", delay: 0.8 },
  { e: "⭐", top: "58%", left: "92%", size: "1.8rem", delay: 0.2 },
  { e: "🥇", top: "72%", left: "8%", size: "2.2rem", delay: 0.6 },
  { e: "🎗️", top: "84%", left: "84%", size: "2rem", delay: 1 },
  { e: "⭐", top: "30%", left: "94%", size: "1.4rem", delay: 1.2 },
  { e: "🏆", top: "90%", left: "50%", size: "1.8rem", delay: 0.5 },
];

function AwardDecor() {
  const reduced = prefersReducedMotion();
  return (
    <div className="award-decor" aria-hidden="true">
      {DECOR.map((d, i) => (
        <motion.span
          key={i}
          className="award-decor-item"
          style={{ top: d.top, left: d.left, fontSize: d.size }}
          animate={reduced ? undefined : { y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.3, ease: "easeInOut", delay: d.delay }}
        >
          {d.e}
        </motion.span>
      ))}
    </div>
  );
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return <p className="dashboard-empty">No scores yet. Start playing!</p>;
  }

  return (
    <div className="leaderboard-table">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.student_id}
          className={`leaderboard-row ${MEDALS[i + 1] ?? ""}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.05, 0.6) }}
        >
          <span className="lb-rank">
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
          </span>
          <span className="lb-emoji">
            {i === 0 && <span className="lb-crown" aria-hidden="true">👑</span>}
            {entry.emoji}
          </span>
          <span className="lb-name">{entry.name}</span>
          <span className="lb-stars">
            <span className="lb-stars-icons">{"⭐".repeat(Math.min(entry.total_stars, 5))}</span>
            <span className="lb-stars-num">{entry.total_stars}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [classId, setClassId] = useState<string | undefined>();
  const [tab, setTab] = useState<"global" | "class">("global");
  const { global, classBoard, loading } = useLeaderboard(classId);

  // Find user's class (if teacher, their class; if parent, their students' class)
  useEffect(() => {
    if (!user || !profile) return;
    if (profile.role === "teacher") {
      supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", user.id)
        .limit(1)
        .single()
        .then(({ data }) => { if (data) setClassId(data.id); });
    } else {
      supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id)
        .then(({ data: students }) => {
          if (!students?.length) return;
          supabase
            .from("student_class_links")
            .select("class_id")
            .in("student_id", students.map((s) => s.id))
            .limit(1)
            .then(({ data: links }) => {
              if (links?.[0]) setClassId(links[0].class_id);
            });
        });
    }
  }, [user, profile]);

  if (loading) return null;

  return (
    <motion.div
      className="screen leaderboard-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AwardDecor />

      <button
        type="button"
        className="lb-back"
        onClick={() => navigate(profile?.role === "teacher" ? "/teacher/dashboard" : "/parent/dashboard")}
      >
        ⏪ Back
      </button>

      <motion.div
        className="lb-banner"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <span className="lb-banner-trophy" aria-hidden="true">🏆</span>
        <span className="lb-banner-title">Leaderboard</span>
        <span className="lb-banner-trophy" aria-hidden="true">🏆</span>
      </motion.div>
      <p className="lb-subtitle">Our money-learning champions!</p>

      <div className="leaderboard-tabs">
        <button
          type="button"
          className={`lb-tab ${tab === "global" ? "active" : ""}`}
          onClick={() => setTab("global")}
        >
          🌍 Global
        </button>
        {classId && (
          <button
            type="button"
            className={`lb-tab ${tab === "class" ? "active" : ""}`}
            onClick={() => setTab("class")}
          >
            🎓 My Class
          </button>
        )}
      </div>

      <LeaderboardTable entries={tab === "global" ? global : classBoard} />
    </motion.div>
  );
}
