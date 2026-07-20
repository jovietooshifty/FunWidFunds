import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { AnswerRecord, Level, MoneyOption } from "../types";
import { formatMoney, minBills } from "../data/currency";
import { DragPayment, type PayResult } from "../components/DragPayment";
import { StarBar } from "../components/StarBar";
import { StreakBadge } from "../components/StreakBadge";
import { BirdMascot, type MascotState } from "../components/mascot/BirdMascot";
import { OptionVisual, optionTypeClass } from "../components/OptionVisual";
import { sounds } from "../audio/sound";
import { prefersReducedMotion } from "../motion";

const SUCCESS_MESSAGES = [
  "Great job!",
  "Excellent!",
  "You got it!",
  "Well done!",
  "Amazing!",
];
const TRY_MESSAGES = [
  "Nice try!",
  "Good attempt!",
  "Almost!",
  "Keep going!",
  "You can do it!",
];
const STREAK_MILESTONES: Record<number, string> = {
  2: "Great streak!",
  3: "You're on a roll!",
  5: "Money master!",
};

function pick(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

interface GameScreenProps {
  level: Level;
  onComplete: (answers: AnswerRecord[]) => void;
  onQuit: () => void;
}

interface FlyingStar {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function GameScreen({ level, onComplete, onQuit }: GameScreenProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<"answering" | "feedback">("answering");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [mascotMessage, setMascotMessage] = useState<string | null>(null);
  const [flyingStar, setFlyingStar] = useState<FlyingStar | null>(null);
  const timerRef = useRef<number | null>(null);
  const reducedMotion = prefersReducedMotion();

  const question = level.questions[index];
  const total = level.questions.length;
  const starsEarned = answers.filter((a) => a.starEarned).length;
  const isMilestone = mascotState === "streak";

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Defensive: a level with no questions (e.g. a "coming soon" shop) should
  // never crash the game — show a friendly bail-out instead.
  if (!question) {
    return (
      <motion.div
        className="screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: "3rem 1rem" }}
      >
        <div className="item-emoji" style={{ fontSize: 72 }}>🚧</div>
        <h2 className="screen-title">This shop is coming soon!</h2>
        <button type="button" className="big-button" onClick={onQuit}>
          Back to Map 🗺️
        </button>
      </motion.div>
    );
  }

  // Shared post-answer flow: streak, mascot, confetti, flying star, advance.
  // `originRect` is where the confetti/star launch from (the tapped option or
  // the Confirm button).
  function resolveAnswer(record: AnswerRecord, originRect: DOMRect | null) {
    const correct = record.correct;
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);
    setPhase("feedback");

    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const milestone = STREAK_MILESTONES[nextStreak];
      setMascotState(milestone ? "streak" : "correct");
      setMascotMessage(milestone ?? pick(SUCCESS_MESSAGES));
      sounds.correct();
      if (!reducedMotion && originRect) {
        const bar = document.getElementById("star-bar")?.getBoundingClientRect();
        if (bar) {
          setFlyingStar({
            fromX: originRect.left + originRect.width / 2,
            fromY: originRect.top + originRect.height / 2,
            toX: bar.left + bar.width / 2,
            toY: bar.top + bar.height / 2,
          });
        }
        confetti({
          particleCount: milestone ? 70 : 40,
          spread: milestone ? 80 : 60,
          startVelocity: 28,
          origin: {
            x: (originRect.left + originRect.width / 2) / window.innerWidth,
            y: originRect.top / window.innerHeight,
          },
          disableForReducedMotion: true,
        });
      }
    } else {
      setStreak(0);
      setMascotState("incorrect");
      setMascotMessage(pick(TRY_MESSAGES));
      sounds.incorrect();
    }

    timerRef.current = window.setTimeout(
      () => {
        setFlyingStar(null);
        setMascotState("idle");
        setMascotMessage(null);
        if (index + 1 >= total) {
          sounds.levelComplete();
          onComplete(nextAnswers);
        } else {
          setIndex(index + 1);
          setPhase("answering");
          setSelectedId(null);
        }
      },
      correct ? 1700 : 2400,
    );
  }

  // Tap model (legacy shops): pick one of the pre-set options.
  function handleAnswer(option: MoneyOption, event: React.MouseEvent<HTMLButtonElement>) {
    if (phase !== "answering") return;
    const correct = option.id === question.correctOptionId;
    setSelectedId(option.id);
    resolveAnswer(
      {
        questionId: question.id,
        selectedOptionId: option.id,
        correctOptionId: question.correctOptionId ?? "",
        correct,
        starEarned: correct,
      },
      event.currentTarget.getBoundingClientRect(),
    );
  }

  // Drag model: the child built an amount by dragging bills; check it here.
  function handleConfirm(result: PayResult) {
    if (phase !== "answering") return;
    const target = question.targetValue ?? 0;
    let correct = result.total === target;
    if (question.mode === "least-bills") {
      const fewest = minBills(target, question.availableBills ?? []);
      correct = result.total === target && result.count === fewest;
    }
    resolveAnswer(
      {
        questionId: question.id,
        selectedOptionId: `paid:${result.total}:${result.count}`,
        correctOptionId: `need:${target}`,
        correct,
        starEarned: correct,
      },
      result.originRect,
    );
  }

  return (
    <motion.div
      className="screen game-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="game-header">
        <button type="button" className="quit-button" onClick={onQuit} aria-label="Back to level map">
          🗺️
        </button>
        <StarBar earned={starsEarned} total={total} />
        <StreakBadge streak={streak} milestone={isMilestone} />
        <span className="question-count">
          {index + 1}/{total}
        </span>
      </header>

      <div className="progress-track">
        <motion.div
          className="progress-fill"
          animate={{ width: `${((index + (phase === "feedback" ? 1 : 0)) / total) * 100}%` }}
          transition={{ type: "spring", bounce: 0.2 }}
        />
      </div>

      <div className="guide-layout">
        <div className="guide-col">
          <BirdMascot
            state={mascotState}
            message={mascotMessage}
            streak={streak}
            size="large"
            reducedMotion={reducedMotion}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            className="question-area"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -120, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          >
            {question.item && (
              <div className="shop-shelf">
                {question.item.emoji ? (
                  <motion.span
                    className="item-image item-emoji"
                    animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                  >
                    {question.item.emoji}
                  </motion.span>
                ) : (
                  <motion.img
                    className="item-image"
                    src={question.item.image}
                    alt={question.item.name}
                    animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                  />
                )}
                <span className="price-tag">{formatMoney(question.item.price)}</span>
              </div>
            )}
            <h2 className="question-prompt">{question.prompt}</h2>

            {question.mode ? (
              <DragPayment
                key={question.id}
                availableBills={question.availableBills ?? []}
                disabled={phase !== "answering"}
                onConfirm={handleConfirm}
              />
            ) : (
            <div className="options-row">
              {(question.options ?? []).map((option) => {
                const isSelected = selectedId === option.id;
                const isCorrectOption = option.id === question.correctOptionId;
                const showFeedback = phase === "feedback";
                let feedbackClass = "";
                if (showFeedback && isSelected && isCorrectOption) feedbackClass = "correct";
                else if (showFeedback && isSelected) feedbackClass = "wrong";
                else if (showFeedback && isCorrectOption) feedbackClass = "reveal";

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    className={`money-option ${optionTypeClass(option)} ${feedbackClass}`}
                    disabled={showFeedback}
                    whileTap={phase === "answering" ? { scale: 0.92 } : undefined}
                    animate={
                      feedbackClass === "wrong" && !reducedMotion
                        ? { x: [0, -10, 10, -7, 7, 0] }
                        : feedbackClass === "correct"
                          ? { scale: [1, 1.12, 1.05] }
                          : {}
                    }
                    transition={{ duration: 0.5 }}
                    onClick={(e) => handleAnswer(option, e)}
                    aria-label={option.label}
                  >
                    {(feedbackClass === "correct" || feedbackClass === "reveal") && (
                      <span className="option-check" aria-hidden="true">✓</span>
                    )}
                    <OptionVisual option={option} />
                  </motion.button>
                );
              })}
            </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {flyingStar && (
        <motion.span
          className="flying-star"
          initial={{ left: flyingStar.fromX, top: flyingStar.fromY, scale: 1.4, opacity: 1 }}
          animate={{ left: flyingStar.toX, top: flyingStar.toY, scale: 0.6, opacity: 0.9 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          aria-hidden="true"
        >
          ⭐
        </motion.span>
      )}
    </motion.div>
  );
}
