import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useClasses } from "../../hooks/useClasses";
import { sounds } from "../../audio/sound";

export function CreateClassPage() {
  const { createClass } = useClasses();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await createClass(name.trim());
      sounds.correct();
      navigate("/teacher/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Could not create class. Try again!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="auth-card" style={{ maxWidth: 440, margin: "2rem auto" }}>
        <h2 className="auth-title">Create a Class</h2>
        <p className="auth-subtitle">Give your class a name. A join code will be generated automatically.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Class name
            <input
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              placeholder="e.g. Ms. Roberts' Class"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <motion.button
            type="submit"
            className="big-button auth-submit"
            whileTap={{ scale: 0.95 }}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Class"}
          </motion.button>
        </form>

        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/teacher/dashboard")}
          style={{ marginTop: "1rem" }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
