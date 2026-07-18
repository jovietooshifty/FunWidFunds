import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CHARACTERS } from "../data/characters";
import type { Character } from "../types";
import { sounds } from "../audio/sound";
import { BirdMascot, type MascotState } from "../components/mascot/BirdMascot";
import { prefersReducedMotion } from "../motion";

const WELCOME_MESSAGE = "Welcome to FUN WID FUNDS! Pick a buddy, then let's begin!";
const BUDDY_PICKED_MESSAGES = ["Great choice!", "That's a wonderful buddy!"];
const READY_MESSAGE = "You're ready for the adventure!";

interface WelcomeScreenProps {
  onStart: (name: string, character: Character) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Character | null>(null);
  const [guideState, setGuideState] = useState<MascotState>("idle");
  const [guideMessage, setGuideMessage] = useState(WELCOME_MESSAGE);
  const guideTimer = useRef<number | null>(null);
  const reducedMotion = prefersReducedMotion();
  const ready = name.trim().length > 0 && selected !== null;

  useEffect(() => {
    return () => {
      if (guideTimer.current !== null) window.clearTimeout(guideTimer.current);
    };
  }, []);

  function handleBuddyPick(c: Character, alreadyPicked: boolean) {
    sounds.click();
    setSelected(c);
    if (guideTimer.current !== null) window.clearTimeout(guideTimer.current);
    setGuideState("correct");
    setGuideMessage(BUDDY_PICKED_MESSAGES[alreadyPicked ? 1 : 0]);
    guideTimer.current = window.setTimeout(() => {
      setGuideState("idle");
      setGuideMessage(READY_MESSAGE);
    }, 1800);
  }

  return (
    <motion.div
      className="screen welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="guide-layout welcome-layout">
        <div className="guide-col">
          <BirdMascot
            state={guideState}
            message={guideMessage}
            size="medium"
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="welcome-panel">
          <motion.div
            className="logo"
            initial={{ y: -60, scale: 0.8 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <span className="logo-fun">FUN</span>
            <span className="logo-wid">WID</span>
            <span className="logo-funds">FUNDS</span>
            <span className="logo-coin" aria-hidden="true">🪙</span>
          </motion.div>
          <p className="tagline">Learn money the fun way!</p>

          <label className="name-label" htmlFor="player-name">
            What&apos;s your name?
          </label>
          <input
            id="player-name"
            className="name-input"
            type="text"
            maxLength={20}
            placeholder="Type your name…"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />

          <p className="pick-label">Pick your buddy!</p>
          <div className="character-grid" role="radiogroup" aria-label="Choose your learning buddy">
            {CHARACTERS.map((c) => {
              const isSelected = selected?.id === c.id;
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`character-card ${isSelected ? "selected" : ""}`}
                  style={{ ["--char-color" as string]: c.color }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    isSelected
                      ? { scale: [1, 1.18, 1.08], rotate: [0, -6, 6, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.5 }}
                  onClick={() => handleBuddyPick(c, selected !== null)}
                >
                  <span className="character-emoji">{c.emoji}</span>
                  <span className="character-name">{c.name}</span>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            type="button"
            className="big-button play-button"
            disabled={!ready}
            whileTap={ready ? { scale: 0.93 } : undefined}
            animate={ready ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={ready ? { repeat: Infinity, duration: 1.4 } : undefined}
            onClick={() => {
              if (!ready || !selected) return;
              sounds.click();
              onStart(name.trim(), selected);
            }}
          >
            Let&apos;s Play! 🎉
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
