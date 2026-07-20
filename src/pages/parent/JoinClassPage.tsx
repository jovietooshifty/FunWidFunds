import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useClassJoin } from "../../hooks/useClassJoin";
import { useStudents } from "../../hooks/useStudents";
import { sounds } from "../../audio/sound";

export function JoinClassPage() {
  const { students } = useStudents();
  const { previewClass, loading, error, lookupCode, joinClass } = useClassJoin();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [joined, setJoined] = useState(false);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    await lookupCode(code);
  }

  async function handleJoin() {
    if (!previewClass || !selectedStudentId) return;
    await joinClass(selectedStudentId, previewClass.id);
    sounds.correct();
    setJoined(true);
  }

  if (joined) {
    return (
      <motion.div
        className="screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="auth-card" style={{ textAlign: "center", maxWidth: 440, margin: "2rem auto" }}>
          <h2 className="auth-title">Joined!</h2>
          <p className="auth-subtitle">Your learner is now in {previewClass?.name}.</p>
          <motion.button
            type="button"
            className="big-button"
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/parent/dashboard")}
          >
            Back to Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="auth-card" style={{ maxWidth: 460, margin: "2rem auto" }}>
        <h2 className="auth-title">Join a Class</h2>
        <p className="auth-subtitle">Enter the 6-character code from your teacher</p>

        <form onSubmit={handleLookup} className="auth-form">
          <label className="auth-label">
            Class code
            <input
              type="text"
              className="auth-input class-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              placeholder="ABC123"
              style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: "1.4rem" }}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          {!previewClass && (
            <motion.button
              type="submit"
              className="big-button auth-submit"
              whileTap={{ scale: 0.95 }}
              disabled={loading || code.length < 6}
            >
              {loading ? "Looking up..." : "Find Class"}
            </motion.button>
          )}
        </form>

        {previewClass && (
          <div className="class-preview">
            <div className="class-preview-card">
              <p className="class-preview-name">{previewClass.name}</p>
              <p className="class-preview-teacher">Teacher: {previewClass.teacher_name}</p>
            </div>

            {students.length > 0 && (
              <label className="auth-label">
                Which learner?
                <select
                  className="auth-input"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Select a learner...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                  ))}
                </select>
              </label>
            )}

            <motion.button
              type="button"
              className="big-button auth-submit"
              whileTap={{ scale: 0.95 }}
              disabled={!selectedStudentId}
              onClick={handleJoin}
            >
              Join Class
            </motion.button>
          </div>
        )}

        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/parent/dashboard")}
          style={{ marginTop: "1rem" }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
