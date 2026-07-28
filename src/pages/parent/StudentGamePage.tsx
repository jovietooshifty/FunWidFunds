import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useProgress } from "../../hooks/useProgress";
import { useReadAloud } from "../../contexts/ReadAloudContext";
import { LEVELS } from "../../data/levels";
import { CHARACTERS } from "../../data/characters";
import { FloatingDecor } from "../../components/FloatingDecor";
import { ReadAloudToggle } from "../../components/ReadAloudToggle";
import { InGameLeaderboard } from "../../components/InGameLeaderboard";
import { sounds } from "../../audio/sound";
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
  const { enabled: readAloud, toggle: toggleReadAloud } = useReadAloud();
  const [student, setStudent] = useState<Student | null>(null);
  const [phase, setPhase] = useState<GamePhase>("levels");
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [runId, setRunId] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [classId, setClassId] = useState<string | undefined>();

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

  // Which class this student belongs to (for the in-game class leaderboard)
  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("student_class_links")
      .select("class_id")
      .eq("student_id", studentId)
      .limit(1)
      .then(({ data }) => setClassId(data?.[0]?.class_id));
  }, [studentId]);

  if (!student) return null;

  // Map student's emoji to a Character for the game screens
  const character = CHARACTERS.find((c) => c.emoji === student.emoji) ?? CHARACTERS[0];

  // Compute unlocked levels from progress
  const levelsWithUnlock = LEVELS.map((level) => {
    // A level with no questions ("coming soon") is never playable.
    const hasQuestions = level.questions.length > 0;
    if (level.id === 1) return { ...level, unlocked: hasQuestions };
    const prevProgress = progress.find((p) => p.level_id === level.id - 1);
    const progressed = prevProgress ? prevProgress.stars_earned >= prevProgress.level_id : false;
    return { ...level, unlocked: hasQuestions && (progressed || level.unlocked) };
  });

  async function handleComplete(records: AnswerRecord[]) {
    setAnswers(records);
    setPhase("results");

    if (activeLevel && studentId) {
      const correct = records.filter((r) => r.correct).length;
      const wrong = records.filter((r) => !r.correct).length;
      await upsertProgress(activeLevel.id, correct, correct + wrong, wrong);

      // Per-question log powers the teacher's "trickiest questions" report.
      const rows = records.map((r) => ({
        student_id: studentId,
        level_id: activeLevel.id,
        question_id: r.questionId,
        prompt: activeLevel.questions.find((q) => q.id === r.questionId)?.prompt ?? null,
        correct: r.correct,
      }));
      if (rows.length > 0) {
        // Non-blocking: analytics must never break finishing a level.
        supabase.from("student_answers").insert(rows).then(({ error }) => {
          if (error) console.warn("Could not record answers:", error.message);
        });
      }
    }
  }

  return (
    <div className="app-shell">
      <FloatingDecor />
      <ReadAloudToggle enabled={readAloud} onToggle={toggleReadAloud} />

      {showLeaderboard && studentId && (
        <InGameLeaderboard
          studentId={studentId}
          classId={classId}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

        {phase === "levels" && (
          <LevelSelectScreen
            key="levels"
            playerName={student.name}
            character={character}
            levels={levelsWithUnlock}
            headerAction={
              <button
                type="button"
                className="view-leaderboard-button"
                onClick={() => {
                  sounds.click();
                  setShowLeaderboard(true);
                }}
              >
                🏆 View Leaderboard
              </button>
            }
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

      <button
        type="button"
        className="back-to-dashboard-button"
        onClick={() => navigate("/parent/dashboard")}
        aria-label="Back to dashboard"
        title="Back to dashboard"
      >
        ⏪
      </button>
    </div>
  );
}
