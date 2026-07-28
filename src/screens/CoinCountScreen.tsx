import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import type { AnswerRecord, Level } from "../types";
import { COINS, formatCents, speakCents } from "../data/currency";
import { StarBar } from "../components/StarBar";
import { BirdMascot, type MascotState } from "../components/mascot/BirdMascot";
import { useReadAloud } from "../contexts/ReadAloudContext";
import { sounds } from "../audio/sound";
import { prefersReducedMotion } from "../motion";

const INTRO = "Count the coins in each row. Drag the matching total to the box!";
const PRAISE = [
  "That's right! Great counting!",
  "Perfect! You counted them all!",
  "Yes! Well done!",
  "Excellent counting!",
];
const TRY_AGAIN = ["Hmm, try counting again!", "Not quite — count them one more time!"];
const FINISH = "Amazing! You counted every row!";

interface CoinCountScreenProps {
  level: Level;
  onComplete: (answers: AnswerRecord[]) => void;
  onQuit: () => void;
}

interface Chip {
  key: string;
  value: number;
}

export function CoinCountScreen({ level, onComplete, onQuit }: CoinCountScreenProps) {
  const rows = level.coinRows ?? [];
  const reducedMotion = prefersReducedMotion();
  const { speak } = useReadAloud();

  const dropRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const doneRef = useRef(false);

  const [chips] = useState<Chip[]>(() =>
    (level.coinChips ?? []).map((value, i) => ({ key: `chip-${i}-${value}`, value })),
  );
  const [placed, setPlaced] = useState<Record<string, number>>({}); // rowId -> chip value
  const [usedChips, setUsedChips] = useState<Set<string>>(new Set());
  const [wrongRow, setWrongRow] = useState<string | null>(null);
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [mascotMessage, setMascotMessage] = useState<string | null>(null);

  // Read the instruction once on entry — never again, so answering a row can
  // never re-trigger the prompt.
  useEffect(() => {
    speak(INTRO);
  }, [speak]);

  const matchedCount = Object.keys(placed).length;

  function handleDragEnd(chip: Chip, info: PanInfo) {
    if (usedChips.has(chip.key)) return;
    const { x, y } = info.point;

    for (const row of rows) {
      if (placed[row.id] !== undefined) continue; // already solved
      const el = dropRefs.current[row.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      if (!inside) continue;

      if (chip.value === row.answer) {
        // Correct: lock the chip into the row.
        const nextPlaced = { ...placed, [row.id]: chip.value };
        setPlaced(nextPlaced);
        setUsedChips((prev) => new Set(prev).add(chip.key));
        sounds.correct();
        setMascotState("correct");
        setMascotMessage(PRAISE[Object.keys(nextPlaced).length % PRAISE.length]);
        speak(PRAISE[Object.keys(nextPlaced).length % PRAISE.length]);

        if (!reducedMotion) {
          confetti({
            particleCount: 34,
            spread: 55,
            startVelocity: 24,
            origin: {
              x: (r.left + r.width / 2) / window.innerWidth,
              y: r.top / window.innerHeight,
            },
            disableForReducedMotion: true,
          });
        }

        // Level finished?
        if (Object.keys(nextPlaced).length === rows.length && !doneRef.current) {
          doneRef.current = true;
          setMascotState("streak");
          setMascotMessage(FINISH);
          speak(FINISH);
          sounds.levelComplete();
          const records: AnswerRecord[] = rows.map((rw) => ({
            questionId: rw.id,
            selectedOptionId: `cents:${rw.answer}`,
            correctOptionId: `cents:${rw.answer}`,
            correct: true,
            starEarned: (misses[rw.id] ?? 0) === 0,
          }));
          window.setTimeout(() => onComplete(records), 2200);
        }
      } else {
        // Wrong: the chip springs back (dragSnapToOrigin) — just flag the row.
        setMisses((m) => ({ ...m, [row.id]: (m[row.id] ?? 0) + 1 }));
        setWrongRow(row.id);
        sounds.incorrect();
        const msg = TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)];
        setMascotState("incorrect");
        setMascotMessage(msg);
        speak(msg);
        window.setTimeout(() => setWrongRow(null), 900);
      }
      return;
    }
  }

  return (
    <motion.div
      className="screen game-screen coin-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="game-header">
        <button type="button" className="quit-button" onClick={onQuit} aria-label="Back to level map">
          🗺️
        </button>
        <StarBar earned={matchedCount} total={rows.length} />
        <span className="question-count">
          {matchedCount}/{rows.length}
        </span>
      </header>

      <h2 className="question-prompt coin-prompt">{INTRO}</h2>

      <div className="coin-layout">
        <div className="coin-guide">
          <BirdMascot
            state={mascotState}
            message={mascotMessage}
            size="medium"
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="coin-rows">
          {rows.map((row, i) => {
            const solved = placed[row.id] !== undefined;
            return (
              <div
                className={`coin-row ${solved ? "solved" : ""} ${wrongRow === row.id ? "wrong" : ""}`}
                key={row.id}
              >
                <div className="coin-row-coins">
                  {row.coins.map((c, ci) => {
                    const coin = COINS[c];
                    return (
                      <img
                        key={ci}
                        className="coin-img"
                        src={coin.image}
                        alt={coin.label}
                        style={{ width: coin.size, height: coin.size }}
                        draggable={false}
                      />
                    );
                  })}
                </div>

                <motion.div
                  className="coin-drop"
                  ref={(el) => {
                    dropRefs.current[row.id] = el;
                  }}
                  animate={
                    wrongRow === row.id && !reducedMotion
                      ? { x: [0, -8, 8, -5, 5, 0] }
                      : solved
                        ? { scale: [1, 1.1, 1] }
                        : {}
                  }
                  transition={{ duration: 0.45 }}
                  aria-label={`Drop the total for row ${i + 1} here`}
                >
                  {solved ? (
                    <span className="coin-chip placed">{formatCents(placed[row.id])}</span>
                  ) : (
                    <span className="coin-drop-hint">?</span>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chip-pool">
        <span className="chip-pool-label">Drag a total 👇</span>
        <div className="chip-pool-row">
          {chips.map((chip) => {
            const used = usedChips.has(chip.key);
            return (
              <motion.button
                key={chip.key}
                type="button"
                className={`coin-chip ${used ? "used" : ""}`}
                drag={!used}
                dragSnapToOrigin
                dragElastic={0.5}
                whileDrag={{ scale: 1.14, zIndex: 60 }}
                whileTap={used ? undefined : { scale: 1.06 }}
                onDragEnd={(_, info) => handleDragEnd(chip, info)}
                disabled={used}
                aria-label={`${speakCents(chip.value)} total`}
              >
                {formatCents(chip.value)}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
