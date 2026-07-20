import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"parent" | "teacher">("parent");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(email, password, name, role);
      if (needsConfirmation) {
        setSuccess(true);
      } else {
        // Auto-confirm is on: the user is already signed in. Send them in.
        navigate(role === "parent" ? "/parent/dashboard" : "/teacher/dashboard", {
          replace: true,
        });
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (/password/i.test(msg)) {
        setError("That password is too weak. Use at least 6 characters.");
      } else if (/already registered|already exists/i.test(msg)) {
        setError("That email already has an account. Try signing in!");
      } else {
        setError(msg || "Could not create account. Try again!");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="auth-title">Check your email!</h2>
        <p className="auth-subtitle">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account!
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
      <h2 className="auth-title">Join the fun!</h2>
      <p className="auth-subtitle">Create your FunWidFunds account</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          Your name
          <input
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

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
            minLength={6}
            autoComplete="new-password"
          />
          <span className="auth-hint">At least 6 characters</span>
        </label>

        <fieldset className="auth-role-picker">
          <legend className="auth-role-legend">I am a...</legend>
          <div className="auth-role-options">
            <label className={`auth-role-option ${role === "parent" ? "active" : ""}`}>
              <input
                type="radio"
                name="role"
                value="parent"
                checked={role === "parent"}
                onChange={() => setRole("parent")}
              />
              <span className="auth-role-emoji">👨‍👧</span>
              <span>Parent</span>
            </label>
            <label className={`auth-role-option ${role === "teacher" ? "active" : ""}`}>
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === "teacher"}
                onChange={() => setRole("teacher")}
              />
              <span className="auth-role-emoji">👩‍🏫</span>
              <span>Teacher</span>
            </label>
          </div>
        </fieldset>

        {error && <p className="auth-error">{error}</p>}

        <motion.button
          type="submit"
          className="big-button auth-submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </motion.button>
      </form>

      <div className="auth-links">
        <Link to="/login" className="auth-link">Already have an account? Sign in!</Link>
      </div>
    </motion.div>
  );
}
