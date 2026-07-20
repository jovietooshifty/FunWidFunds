import { motion } from "framer-motion";

interface ReadAloudToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function ReadAloudToggle({ enabled, onToggle }: ReadAloudToggleProps) {
  return (
    <motion.button
      type="button"
      className="read-aloud-toggle"
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      title={enabled ? "Mute read-aloud" : "Enable read-aloud"}
      aria-label={enabled ? "Mute read-aloud" : "Enable read-aloud"}
    >
      {enabled ? "🔊" : "🔇"}
    </motion.button>
  );
}
