import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  useCountryLeaderboard,
  useClassLeaderboard,
  useMyChildrenClasses,
} from "../../hooks/useLeaderboard";
import { AwardDecor, LeaderboardPanel } from "../../components/LeaderboardPanel";
import { supabase } from "../../lib/supabase";

export function LeaderboardPage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = profile?.role === "teacher";

  const [tab, setTab] = useState<"country" | "class">("country");
  const [classId, setClassId] = useState<string | undefined>();

  const { entries: country, loading: countryLoading } = useCountryLeaderboard();
  const { options: childClasses } = useMyChildrenClasses();
  const { entries: classEntries, loading: classLoading } = useClassLeaderboard(classId);

  // Teachers pick from their own classes; parents pick from their children's.
  const [teacherClasses, setTeacherClasses] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!isTeacher || !user) return;
    supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", user.id)
      .order("created_at")
      .then(({ data }) => setTeacherClasses(data ?? []));
  }, [isTeacher, user]);

  // Default the class selection once options load.
  useEffect(() => {
    if (classId) return;
    if (isTeacher && teacherClasses.length > 0) setClassId(teacherClasses[0].id);
    if (!isTeacher && childClasses.length > 0) setClassId(childClasses[0].class_id);
  }, [classId, isTeacher, teacherClasses, childClasses]);

  const hasClassOption = isTeacher ? teacherClasses.length > 0 : childClasses.length > 0;

  if (countryLoading) return null;

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
        onClick={() => navigate(isTeacher ? "/teacher/dashboard" : "/parent/dashboard")}
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
          className={`lb-tab ${tab === "country" ? "active" : ""}`}
          onClick={() => setTab("country")}
        >
          🇹🇹 Country
        </button>
        {hasClassOption && (
          <button
            type="button"
            className={`lb-tab ${tab === "class" ? "active" : ""}`}
            onClick={() => setTab("class")}
          >
            🎓 Class
          </button>
        )}
      </div>

      {/* Which class? Parents may have children in different classes. */}
      {tab === "class" && hasClassOption && (
        <label className="lb-filter">
          <span className="lb-filter-label">Showing:</span>
          <select
            className="auth-input lb-filter-select"
            value={classId ?? ""}
            onChange={(e) => setClassId(e.target.value)}
          >
            {isTeacher
              ? teacherClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              : childClasses.map((c) => (
                  <option key={`${c.student_id}-${c.class_id}`} value={c.class_id}>
                    {c.student_name}'s class — {c.class_name}
                  </option>
                ))}
          </select>
        </label>
      )}

      {tab === "country" ? (
        <LeaderboardPanel entries={country} />
      ) : classLoading ? null : (
        <LeaderboardPanel
          entries={classEntries}
          emptyMessage="No one in this class has played yet!"
        />
      )}
    </motion.div>
  );
}
