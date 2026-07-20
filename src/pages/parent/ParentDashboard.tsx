import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useStudents } from "../../hooks/useStudents";
import { supabase } from "../../lib/supabase";
import type { StudentLevelProgress } from "../../types/database";
import { StudentCard } from "../../components/StudentCard";
import { sounds } from "../../audio/sound";

export function ParentDashboard() {
  const { profile } = useAuth();
  const { students, loading } = useStudents();
  const navigate = useNavigate();
  const [progressMap, setProgressMap] = useState<Record<string, StudentLevelProgress[]>>({});

  useEffect(() => {
    if (students.length === 0) return;
    const ids = students.map((s) => s.id);
    supabase
      .from("student_level_progress")
      .select("*")
      .in("student_id", ids)
      .then(({ data }) => {
        const map: Record<string, StudentLevelProgress[]> = {};
        for (const row of data ?? []) {
          (map[row.student_id] ??= []).push(row);
        }
        setProgressMap(map);
      });
  }, [students]);

  if (loading) return null;

  return (
    <motion.div
      className="screen dashboard-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="dashboard-greeting">Hi, {profile?.name}! Here are your learners</h1>

      <div className="student-grid">
        {students.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            progress={progressMap[s.id] ?? []}
            onPlay={() => navigate(`/parent/play/${s.id}`)}
            onJoinClass={() => navigate("/parent/join-class")}
          />
        ))}

        <motion.button
          type="button"
          className="student-card student-card--add"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { sounds.click(); navigate("/parent/add-student"); }}
        >
          <span className="add-icon">+</span>
          <span className="add-label">Add a Learner</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
