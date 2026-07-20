import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useProgress } from "../../hooks/useProgress";
import { useReadAloud } from "../../hooks/useReadAloud";
import { LEVELS } from "../../data/levels";
import { CHARACTERS } from "../../data/characters";
import { FloatingDecor } from "../../components/FloatingDecor";
import { ReadAloudToggle } from "../../components/ReadAloudToggle";
import { LevelSelectScreen } from "../../screens/LevelSelectScreen";
import { GameScreen } from "../../screens/GameScreen";
import { ResultsScreen } from "../../screens/ResultsScreen";
import type { Student } from "../../types/database";
import type { AnswerRecord, Level } from "../../types";

type GamePhase = "levels" | "game" | "results";

export function StudentGamePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { progress, upsertProgress } = useProgress(studentId);
  const { enabled: readAloud, toggle: toggleReadAloud, speak } = useReadAloud();
  const shellRef = useRef<HTMLDivElement>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [phase, setPhase] = useState<GamePhase>("levels");
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [runId, setRunId] = useState(0);

  // Fetch student record
  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single()
      .then(({ data }) => setStudent(data));
  }, [studentId]);

  // Read-aloud: observe question prompts via MutationObserver
  useEffect(() => {
    if (!shellRef.current) return;
    const observer = new MutationObserver(() => {
      const prompt = shellRef.current?.querySelector(".question-prompt");
      if (prompt?.textContent) speak(prompt.textContent);
    });
    observer.observe(shellRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [speak]);

  if (!student) return null;

  // Map student's emoji to a Character for the game screens
  const character = CHARACTERS.find((c) => c.emoji === student.emoji) ?? CHARACTERS[0];

  // Compute unlocked levels from progress
  const levelsWithUnlock = LEVELS.map((level) => {
    if (level.id === 1) return { ...level, unlocked: true };
    const prevProgress = progress.find((p) => p.level_id === level.id - 1);
    const unlocked = prevProgress ? prevProgress.stars_earned >= prevProgress.level_id : false;
    return { ...level, unlocked: unlocked || level.unlocked };
  });

  async function handleComplete(records: AnswerRecord[]) {
    setAnswers(records);
    setPhase("results");

    if (activeLevel && studentId) {
      const correct = records.filter((r) => r.correct).length;
      const wrong = records.filter((r) => !r.correct).length;
      await upsertProgress(activeLevel.id, correct, correct + wrong, wrong);
    }
  }

  return (
    <div className="app-shell" ref={shellRef}>
      <FloatingDecor />
      <ReadAloudToggle enabled={readAloud} onToggle={toggleReadAloud} />
      <AnimatePresence mode="wait">
        {phase === "levels" && (
          <LevelSelectScreen
            key="levels"
            playerName={student.name}
            character={character}
            levels={levelsWithUnlock}
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
            onComplete={handleComplete}
            onQuit={() => setPhase("levels")}
          />
        )}

        {phase === "results" && activeLevel && (
          <ResultsScreen
            key="results"
            level={activeLevel}
            character={character}
            playerName={student.name}
            answers={answers}
            onRetry={() => {
              setRunId((r) => r + 1);
              setPhase("game");
            }}
            onBackToLevels={() => setPhase("levels")}
          />
        )}
      </AnimatePresence>

      <button
        type="button"
        className="back-to-dashboard-button"
        onClick={() => navigate("/parent/dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
