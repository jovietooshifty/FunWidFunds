import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useClassDetail } from "../../hooks/useClassDetail";
import { ClassCodeDisplay } from "../../components/ClassCodeDisplay";
import { ConfirmButton } from "../../components/ConfirmButton";
import { sounds } from "../../audio/sound";

const RANK_ICON = ["🥇", "🥈", "🥉"];

function accuracyClass(pct: number): string {
  return pct >= 70 ? "good" : pct >= 40 ? "ok" : "low";
}

export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { klass, students, loading, kickStudent } = useClassDetail(classId);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (!klass) {
    return (
      <div className="screen dashboard-screen">
        <p className="dashboard-empty">That class could not be found.</p>
        <button type="button" className="link-button" onClick={() => navigate("/teacher/dashboard")}>
          Back to my classes
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="screen dashboard-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        type="button"
        className="link-button"
        onClick={() => navigate("/teacher/dashboard")}
      >
        ⏪ All classes
      </button>

      <div className="teacher-top-row">
        <h1 className="class-name-heading">🎓 {klass.name}</h1>
        <ClassCodeDisplay code={klass.class_code} />
      </div>

      {error && <p className="auth-error">{error}</p>}

      <h2 className="section-heading">🏆 Class Leaderboard</h2>

      {students.length === 0 ? (
        <div className="empty-class-card">
          <span className="empty-emoji" aria-hidden="true">📭</span>
          <p className="dashboard-empty">
            No students yet — share the class code above with parents!
          </p>
        </div>
      ) : (
        <div className="teacher-student-list">
          {students.map((s, i) => {
            const isOpen = expanded === s.student.id;
            return (
              <motion.div
                key={s.student.id}
                className={`teacher-student-card ${i < 3 ? `rank-${i + 1}` : ""}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <div className="teacher-student-row">
                  <span className="lb-rank">{RANK_ICON[i] ?? i + 1}</span>
                  <span className="teacher-student-emoji">{s.student.emoji}</span>
                  <span className="teacher-student-name">{s.student.name}</span>
                  <span className="teacher-stat">⭐ {s.totalStars}</span>
                  <span className={`teacher-pct-pill ${accuracyClass(s.accuracy)}`}>
                    {s.accuracy}% correct
                  </span>

                  <div className="student-row-actions">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        sounds.click();
                        setExpanded(isOpen ? null : s.student.id);
                      }}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Hide report" : "Report"}
                    </button>
                    <ConfirmButton
                      className="danger-link"
                      label="Kick"
                      confirmLabel="Tap again to kick!"
                      onConfirm={async () => {
                        setError(null);
                        try {
                          await kickStudent(s.student.id);
                        } catch (err: any) {
                          setError(err.message ?? "Could not remove that student.");
                        }
                      }}
                    />
                  </div>
                </div>

                {isOpen && (
                  <motion.div
                    className="student-report"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="report-stats">
                      <span className="report-stat">
                        Questions answered <strong>{s.attempted}</strong>
                      </span>
                      <span className="report-stat">
                        Got wrong <strong>{s.wrong}</strong>
                      </span>
                      <span className="report-stat">
                        Levels played <strong>{s.progress.length}</strong>
                      </span>
                    </div>

                    <h3 className="report-heading">Trickiest questions</h3>
                    {s.missed.length === 0 ? (
                      <p className="report-empty">
                        No wrong answers recorded yet — nice work! 🎉
                      </p>
                    ) : (
                      <ul className="report-list">
                        {s.missed.slice(0, 5).map((m) => (
                          <li className="report-item" key={m.question_id}>
                            <span className="report-prompt">{m.prompt}</span>
                            <span className="report-wrong">
                              {m.wrong} wrong / {m.attempts} tried
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
