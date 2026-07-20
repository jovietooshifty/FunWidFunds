import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function VerifyEmailPage() {
  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      <h2 className="auth-title">Email verified!</h2>
      <p className="auth-subtitle">
        Your account is all set. You can now sign in and start learning!
      </p>
      <Link to="/login" className="big-button auth-submit" style={{ textAlign: "center", textDecoration: "none" }}>
        Sign In
      </Link>
    </motion.div>
  );
}
