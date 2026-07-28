import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { COINS, formatCents, speakCents } from "../data/currency";
import { useReadAloud } from "../contexts/ReadAloudContext";
import { sounds } from "../audio/sound";

const OVERPAY = "Oops, that's too much! Tap undo.";

interface CoinPayProps {
  targetCents: number;
  availableCoins: number[];
  disabled?: boolean;
  /** Fired once the tray total exactly equals the target. */
  onSolved: (coinsUsed: number[], originRect: DOMRect | null) => void;
}

interface CoinInstance {
  key: string;
  value: number;
}

/**
 * "Pay With Coins": drag coins from the pool into the tray until they add up to
 * the price exactly. Any combination that totals the target is accepted — the
 * child is never forced down one path. Overpaying does not fail the question;
 * it just warns and waits for Undo, so experimenting stays safe.
 */
export function CoinPay({ targetCents, availableCoins, disabled, onSolved }: CoinPayProps) {
  const trayRef = useRef<HTMLDivElement>(null);
  const solvedRef = useRef(false);
  const { speak } = useReadAloud();

  const [pool] = useState<CoinInstance[]>(() =>
    availableCoins.map((value, i) => ({ key: `c${i}-${value}`, value })),
  );
  const [tray, setTray] = useState<CoinInstance[]>([]);
  const [overpaid, setOverpaid] = useState(false);

  const total = tray.reduce((sum, c) => sum + c.value, 0);
  const inTray = new Set(tray.map((c) => c.key));

  // Reset when the question changes (the component is keyed per question, but
  // guard anyway so a re-render can't leave a stale "solved" latch).
  useEffect(() => {
    solvedRef.current = false;
  }, [targetCents]);

  function settle(next: CoinInstance[]) {
    setTray(next);
    const sum = next.reduce((s, c) => s + c.value, 0);

    if (sum === targetCents && !solvedRef.current) {
      solvedRef.current = true;
      setOverpaid(false);
      onSolved(next.map((c) => c.value), trayRef.current?.getBoundingClientRect() ?? null);
      return;
    }
    if (sum > targetCents) {
      setOverpaid(true);
      sounds.incorrect();
      speak(OVERPAY);
      return;
    }
    setOverpaid(false);
  }

  function handleDragEnd(coin: CoinInstance, info: PanInfo) {
    if (disabled || solvedRef.current || inTray.has(coin.key)) return;
    const zone = trayRef.current?.getBoundingClientRect();
    if (!zone) return;
    const { x, y } = info.point;
    const inside = x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
    if (!inside) return;
    sounds.click();
    settle([...tray, coin]);
  }

  function undoLast() {
    if (disabled || solvedRef.current || tray.length === 0) return;
    sounds.click();
    settle(tray.slice(0, -1));
  }

  const remaining = targetCents - total;

  return (
    <div className="pay-area coinpay">
      <div className="coinpay-target">
        <span className="coinpay-target-label">Pay exactly</span>
        <span className="coinpay-target-value">{formatCents(targetCents)}</span>
      </div>

      <motion.div
        className={`payment-tray coinpay-tray ${overpaid ? "over" : ""} ${solvedRef.current ? "solved" : ""}`}
        ref={trayRef}
        animate={overpaid ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        {tray.length === 0 ? (
          <span className="pay-hint">Drag coins here 👇</span>
        ) : (
          tray.map((c) => (
            <motion.img
              key={c.key}
              className="coin-img"
              src={COINS[c.value].image}
              alt={COINS[c.value].label}
              style={{ width: COINS[c.value].size, height: COINS[c.value].size }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              draggable={false}
            />
          ))
        )}
      </motion.div>

      <div className={`coinpay-total ${overpaid ? "over" : ""}`} aria-live="polite">
        Running total: <strong>{formatCents(total)}</strong>
        {overpaid ? (
          <span className="coinpay-note over"> — too much!</span>
        ) : remaining > 0 && total > 0 ? (
          <span className="coinpay-note"> — {formatCents(remaining)} to go</span>
        ) : null}
      </div>

      <div className="coin-pool">
        {pool.map((coin) => {
          const used = inTray.has(coin.key);
          const meta = COINS[coin.value];
          return (
            <motion.img
              key={coin.key}
              className={`coin-img coin-draggable ${used ? "used" : ""}`}
              src={meta.image}
              alt={meta.label}
              style={{ width: meta.size, height: meta.size }}
              draggable={false}
              drag={!disabled && !used && !solvedRef.current}
              dragSnapToOrigin
              dragElastic={0.55}
              whileDrag={{ scale: 1.18, zIndex: 60 }}
              whileTap={used ? undefined : { scale: 1.08 }}
              onDragEnd={(_, info) => handleDragEnd(coin, info)}
              aria-label={`${meta.label}, ${speakCents(coin.value)}`}
            />
          );
        })}
      </div>

      <button
        type="button"
        className="undo-button"
        onClick={undoLast}
        disabled={disabled || tray.length === 0 || solvedRef.current}
      >
        ↩ Undo last
      </button>
    </div>
  );
}
