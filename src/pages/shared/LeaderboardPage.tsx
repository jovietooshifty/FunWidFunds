import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useLeaderboard, type LeaderboardEntry } from "../../hooks/useLeaderboard";
import { supabase } from "../../lib/supabase";

const MEDALS = ["", "medal-gold", "medal-silver", "medal-bronze"];

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
          transition={{ delay: i * 0.05 }}
        >
          <span className="lb-rank">
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
          </span>
          <span className="lb-emoji">{entry.emoji}</span>
          <span className="lb-name">{entry.name}</span>
          <span className="lb-stars">{"⭐".repeat(Math.min(entry.total_stars, 10))} {entry.total_stars}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const { profile, user } = useAuth();
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
      // Parent: find any class their students are in
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
      <h1 className="screen-title">Leaderboard</h1>

      <div className="leaderboard-tabs">
        <button
          type="button"
          className={`lb-tab ${tab === "global" ? "active" : ""}`}
          onClick={() => setTab("global")}
        >
          Global
        </button>
        {classId && (
          <button
            type="button"
            className={`lb-tab ${tab === "class" ? "active" : ""}`}
            onClick={() => setTab("class")}
          >
            My Class
          </button>
        )}
      </div>

      <LeaderboardTable entries={tab === "global" ? global : classBoard} />
    </motion.div>
  );
}
