import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sounds } from "../audio/sound";

interface ConfirmButtonProps {
  label: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
  /** ms before an un-confirmed press resets (default 4s) */
  timeout?: number;
}

/**
 * Two-step destructive action: the first press arms the button and swaps in a
 * warning label, the second press commits. Auto-disarms after `timeout` so a
 * stray tap can never linger in the armed state.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  className = "",
  timeout = 4000,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function disarmLater() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setArmed(false), timeout);
  }

  async function handleClick() {
    if (busy) return;
    if (!armed) {
      sounds.click();
      setArmed(true);
      disarmLater();
      return;
    }
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setArmed(false);
    }
  }

  return (
    <motion.button
      type="button"
      className={`${className} ${armed ? "armed" : ""}`}
      whileTap={{ scale: 0.94 }}
      onClick={handleClick}
      disabled={busy}
      aria-live="polite"
    >
      {busy ? "Working..." : armed ? `⚠️ ${confirmLabel}` : label}
    </motion.button>
  );
}
