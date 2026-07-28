import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useClasses } from "../../hooks/useClasses";
import { ConfirmButton } from "../../components/ConfirmButton";
import { sounds } from "../../audio/sound";

export function TeacherDashboard() {
  const { profile } = useAuth();
  const { classes, loading, deleteClass } = useClasses();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  return (
    <motion.div
      className="screen dashboard-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="dashboard-greeting">Welcome, {profile?.name}!</h1>

      <div className="teacher-actions">
        <motion.button
          type="button"
          className="big-button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            sounds.click();
            navigate("/teacher/create-class");
          }}
        >
          ➕ Add Class
        </motion.button>
        <motion.button
          type="button"
          className="secondary-button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            sounds.click();
            navigate("/teacher/play");
          }}
        >
          🎮 Play Levels
        </motion.button>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {classes.length === 0 ? (
        <div className="empty-class-card">
          <span className="empty-emoji" aria-hidden="true">🏫</span>
          <p className="dashboard-empty">
            No classes yet. Tap <strong>Add Class</strong> to make your first one!
          </p>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((c, i) => (
            <motion.div
              key={c.id}
              className="class-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              whileHover={{ scale: 1.02 }}
            >
              <button
                type="button"
                className="class-card-main"
                onClick={() => {
                  sounds.click();
                  navigate(`/teacher/class/${c.id}`);
                }}
              >
                <span className="class-card-emoji" aria-hidden="true">🎓</span>
                <span className="class-card-name">{c.name}</span>
                <span className="class-card-meta">
                  {c.student_count} {c.student_count === 1 ? "student" : "students"}
                </span>
                <span className="class-card-code">Code: {c.class_code}</span>
                <span className="class-card-open">Open ▶</span>
              </button>

              <ConfirmButton
                className="danger-link"
                label="Delete class"
                confirmLabel="Tap again to delete!"
                onConfirm={async () => {
                  setError(null);
                  try {
                    await deleteClass(c.id);
                  } catch (err: any) {
                    setError(err.message ?? "Could not delete that class.");
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
