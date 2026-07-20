import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CHARACTERS } from "../../data/characters";
import { useStudents } from "../../hooks/useStudents";
import { BirdMascot } from "../../components/mascot/BirdMascot";
import { prefersReducedMotion } from "../../motion";
import { sounds } from "../../audio/sound";

export function AddStudentPage() {
  const { addStudent } = useStudents();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(CHARACTERS[0].emoji);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await addStudent(name.trim(), emoji);
      sounds.correct();
      navigate("/parent/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Could not add learner. Try again!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="screen add-student-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="add-student-layout">
        <div className="add-student-mascot">
          <BirdMascot
            state="idle"
            message="Pick a buddy for your learner!"
            size="medium"
            reducedMotion={prefersReducedMotion()}
          />
        </div>

        <form onSubmit={handleSubmit} className="auth-card add-student-form">
          <h2 className="auth-title">Add a Learner</h2>

          <label className="auth-label">
            Learner's name
            <input
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
            />
          </label>

          <fieldset className="buddy-picker">
            <legend className="auth-role-legend">Choose a buddy</legend>
            <div className="buddy-grid">
              {CHARACTERS.map((c) => (
                <motion.label
                  key={c.id}
                  className={`buddy-option ${emoji === c.emoji ? "active" : ""}`}
                  style={{ ["--buddy-color" as string]: c.color }}
                  whileTap={{ scale: 0.9 }}
                >
                  <input
                    type="radio"
                    name="buddy"
                    value={c.emoji}
                    checked={emoji === c.emoji}
                    onChange={() => { setEmoji(c.emoji); sounds.click(); }}
                  />
                  <span className="buddy-emoji">{c.emoji}</span>
                  <span className="buddy-name">{c.name}</span>
                </motion.label>
              ))}
            </div>
          </fieldset>

          {error && <p className="auth-error">{error}</p>}

          <motion.button
            type="submit"
            className="big-button auth-submit"
            whileTap={{ scale: 0.95 }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Learner"}
          </motion.button>

          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/parent/dashboard")}
          >
            Cancel
          </button>
        </form>
      </div>
    </motion.div>
  );
}
