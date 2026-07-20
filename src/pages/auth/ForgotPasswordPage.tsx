import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="auth-title">Check your email!</h2>
        <p className="auth-subtitle">
          If an account exists for <strong>{email}</strong>, we sent a reset link.
        </p>
        <Link to="/login" className="auth-link">Back to sign in</Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      <h2 className="auth-title">Forgot your password?</h2>
      <p className="auth-subtitle">No worries! Enter your email and we'll send you a reset link.</p>

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

        {error && <p className="auth-error">{error}</p>}

        <motion.button
          type="submit"
          className="big-button auth-submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </form>

      <div className="auth-links">
        <Link to="/login" className="auth-link">Back to sign in</Link>
      </div>
    </motion.div>
  );
}
