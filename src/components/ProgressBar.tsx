import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ value, max, color = "var(--sunshine)" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="progress-bar-track">
      <motion.div
        className="progress-bar-fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
