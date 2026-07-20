import { useState } from "react";
import { motion } from "framer-motion";

interface ClassCodeDisplayProps {
  code: string;
}

export function ClassCodeDisplay({ code }: ClassCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      className="class-code-display"
      whileHover={{ scale: 1.02 }}
      onClick={handleCopy}
      style={{ cursor: "pointer" }}
      title="Click to copy"
    >
      <span className="class-code-label">Class Code</span>
      <span className="class-code-value">{code}</span>
      <span className="class-code-hint">
        {copied ? "Copied!" : "Click to copy"}
      </span>
    </motion.div>
  );
}
