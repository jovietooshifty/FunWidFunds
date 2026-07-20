import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message ?? "Could not sign in. Try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      <h2 className="auth-title">Welcome back!</h2>
      <p className="auth-subtitle">Sign in to continue your learning adventure</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <motion.button
          type="submit"
          className="big-button auth-submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Let's Go!"}
        </motion.button>
      </form>

      <div className="auth-links">
        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        <Link to="/signup" className="auth-link">Don't have an account? Sign up!</Link>
      </div>
    </motion.div>
  );
}
