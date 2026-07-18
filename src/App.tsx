import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { AnswerRecord, Character, Level, Screen } from "./types";
import { FloatingDecor } from "./components/FloatingDecor";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { LevelSelectScreen } from "./screens/LevelSelectScreen";
import { GameScreen } from "./screens/GameScreen";
import { ResultsScreen } from "./screens/ResultsScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [playerName, setPlayerName] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  // remounts GameScreen on retry so all question state resets
  const [runId, setRunId] = useState(0);

  return (
    <div className="app-shell">
      <FloatingDecor />
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <WelcomeScreen
            key="welcome"
            onStart={(name, chosen) => {
              setPlayerName(name);
              setCharacter(chosen);
              setScreen("levels");
            }}
          />
        )}

        {screen === "levels" && character && (
          <LevelSelectScreen
            key="levels"
            playerName={playerName}
            character={character}
            onPlayLevel={(level) => {
              setActiveLevel(level);
              setRunId((r) => r + 1);
              setScreen("game");
            }}
          />
        )}

        {screen === "game" && character && activeLevel && (
          <GameScreen
            key={`game-${runId}`}
            level={activeLevel}
            onComplete={(records) => {
              setAnswers(records);
              setScreen("results");
            }}
            onQuit={() => setScreen("levels")}
          />
        )}

        {screen === "results" && character && activeLevel && (
          <ResultsScreen
            key="results"
            level={activeLevel}
            character={character}
            playerName={playerName}
            answers={answers}
            onRetry={() => {
              setRunId((r) => r + 1);
              setScreen("game");
            }}
            onBackToLevels={() => setScreen("levels")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
