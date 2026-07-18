import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LEVELS } from "../data/levels";
import type { Character, Level } from "../types";
import { sounds } from "../audio/sound";
import { BirdMascot, type MascotState } from "../components/mascot/BirdMascot";
import { prefersReducedMotion } from "../motion";

const MAP_MESSAGE = "Welcome to Money Town! Let's start at the Fruit Stand!";
const LOCKED_MESSAGE = "More shops will unlock soon!";

interface LevelSelectScreenProps {
  playerName: string;
  character: Character;
  onPlayLevel: (level: Level) => void;
}

export function LevelSelectScreen({
  playerName,
  character,
  onPlayLevel,
}: LevelSelectScreenProps) {
  const [comingSoonId, setComingSoonId] = useState<number | null>(null);
  const [guideState, setGuideState] = useState<MascotState>("idle");
  const [guideMessage, setGuideMessage] = useState(MAP_MESSAGE);
  const guideTimer = useRef<number | null>(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    return () => {
      if (guideTimer.current !== null) window.clearTimeout(guideTimer.current);
    };
  }, []);

  function handleSelect(level: Level) {
    if (level.unlocked) {
      sounds.click();
      onPlayLevel(level);
    } else {
      sounds.incorrect();
      setComingSoonId(level.id);
      if (guideTimer.current !== null) window.clearTimeout(guideTimer.current);
      setGuideState("incorrect");
      setGuideMessage(LOCKED_MESSAGE);
      guideTimer.current = window.setTimeout(() => {
        setComingSoonId(null);
        setGuideState("idle");
        setGuideMessage(MAP_MESSAGE);
      }, 1600);
    }
  }

  return (
    <motion.div
      className="screen level-screen"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
    >
      <header className="level-header">
        <span className="player-chip" style={{ ["--char-color" as string]: character.color }}>
          <span className="player-chip-emoji">{character.emoji}</span>
          {playerName}
        </span>
        <h1 className="screen-title">Money Town Map</h1>
        <p className="screen-subtitle">Where are we shopping today?</p>
      </header>

      <div className="guide-layout">
        <div className="guide-col">
          <BirdMascot
            state={guideState}
            message={guideMessage}
            size="medium"
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="level-map">
          {LEVELS.map((level, i) => (
            <motion.button
              key={level.id}
              type="button"
              className={`level-card ${level.unlocked ? "unlocked" : "locked"}`}
              initial={{ opacity: 0, y: 40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.12, type: "spring", bounce: 0.45 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(level)}
              aria-label={
                level.unlocked
                  ? `Play level ${level.id}: ${level.title}`
                  : `Level ${level.id}: ${level.title} — locked`
              }
            >
              <span className="level-number">Level {level.id}</span>
              <motion.span
                className="level-emoji"
                animate={
                  comingSoonId === level.id ? { x: [0, -8, 8, -6, 6, 0] } : undefined
                }
                transition={{ duration: 0.45 }}
              >
                {level.unlocked ? level.emoji : "🔒"}
              </motion.span>
              <span className="level-title">{level.title}</span>
              <span className="level-desc">
                {comingSoonId === level.id ? "Coming soon!" : level.description}
              </span>
              {level.unlocked && <span className="level-go">PLAY ▶</span>}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
