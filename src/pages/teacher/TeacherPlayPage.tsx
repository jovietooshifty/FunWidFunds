import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEVELS } from "../../data/levels";
import { CHARACTERS } from "../../data/characters";
import { useAuth } from "../../contexts/AuthContext";
import { useReadAloud } from "../../contexts/ReadAloudContext";
import { FloatingDecor } from "../../components/FloatingDecor";
import { ReadAloudToggle } from "../../components/ReadAloudToggle";
import { LevelSelectScreen } from "../../screens/LevelSelectScreen";
import { GameScreen } from "../../screens/GameScreen";
import { ResultsScreen } from "../../screens/ResultsScreen";
import type { AnswerRecord, Level } from "../../types";

type Phase = "levels" | "game" | "results";

/**
 * Teacher preview mode: every level with real content is unlocked and nothing
 * is written to the database, so teachers can experience the content their
 * students see without affecting any student's progress.
 */
export function TeacherPlayPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { enabled: readAloud, toggle: toggleReadAloud } = useReadAloud();
  const [phase, setPhase] = useState<Phase>("levels");
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [runId, setRunId] = useState(0);

  const character = CHARACTERS[0];
  const levels = LEVELS.map((l) => ({ ...l, unlocked: l.questions.length > 0 }));

  return (
    <div className="app-shell">
      <FloatingDecor />
      <ReadAloudToggle enabled={readAloud} onToggle={toggleReadAloud} />

      {phase === "levels" && (
        <LevelSelectScreen
          key="levels"
          playerName={profile?.name ?? "Teacher"}
          character={character}
          levels={levels}
          onPlayLevel={(level) => {
            setActiveLevel(level);
            setRunId((r) => r + 1);
            setPhase("game");
          }}
        />
      )}

      {phase === "game" && activeLevel && (
        <GameScreen
          key={`game-${runId}`}
          level={activeLevel}
          onComplete={(records) => {
            setAnswers(records);
            setPhase("results");
          }}
          onQuit={() => setPhase("levels")}
        />
      )}

      {phase === "results" && activeLevel && (
        <ResultsScreen
          key="results"
          level={activeLevel}
          character={character}
          playerName={profile?.name ?? "Teacher"}
          answers={answers}
          onRetry={() => {
            setRunId((r) => r + 1);
            setPhase("game");
          }}
          onBackToLevels={() => setPhase("levels")}
        />
      )}

      <button
        type="button"
        className="back-to-dashboard-button"
        onClick={() => navigate("/teacher/dashboard")}
        aria-label="Back to dashboard"
        title="Back to dashboard"
      >
        ⏪
      </button>

      <span className="preview-badge">👩‍🏫 Preview mode — progress isn't saved</span>
    </div>
  );
}
