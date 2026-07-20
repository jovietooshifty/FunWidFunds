import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { AnswerRecord, Character, Level } from "../types";
import { formatMoney } from "../data/currency";
import { OptionVisual } from "../components/OptionVisual";
import { sounds } from "../audio/sound";
import { prefersReducedMotion } from "../motion";

interface ResultsScreenProps {
  level: Level;
  character: Character;
  playerName: string;
  answers: AnswerRecord[];
  onRetry: () => void;
  onBackToLevels: () => void;
}

function longestStreak(answers: AnswerRecord[]): number {
  let best = 0;
  let current = 0;
  for (const a of answers) {
    current = a.correct ? current + 1 : 0;
    if (current > best) best = current;
  }
  return best;
}

function performanceTier(correct: number, total: number) {
  const scaled = (correct / total) * 10;
  if (scaled >= 9) {
    return { badge: "🥇", label: "Money Superstar!", tier: "gold" as const };
  }
  if (scaled >= 6) {
    return { badge: "🥈", label: "Great money skills!", tier: "silver" as const };
  }
  return { badge: "🥉", label: "Good start! Let's practise again.", tier: "bronze" as const };
}

export function ResultsScreen({
  level,
  character,
  playerName,
  answers,
  onRetry,
  onBackToLevels,
}: ResultsScreenProps) {
  const total = level.questions.length;
  const correct = answers.filter((a) => a.correct).length;
  const missed = answers.filter((a) => !a.correct);
  const bestStreak = longestStreak(answers);
  const { badge, label, tier } = performanceTier(correct, total);

  useEffect(() => {
    if (prefersReducedMotion() || tier === "bronze") return;
    const big = tier === "gold";
    confetti({
      particleCount: big ? 180 : 80,
      spread: big ? 110 : 70,
      origin: { y: 0.4 },
      disableForReducedMotion: true,
    });
  }, [tier]);

  return (
    <motion.div
      className="screen results-screen"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`results-card ${tier}`}
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <motion.span
          className="results-character"
          animate={
            tier === "bronze"
              ? { rotate: [0, -8, 8, 0] }
              : { y: [0, -18, 0], rotate: [0, -10, 10, 0] }
          }
          transition={{ repeat: Infinity, duration: 1.8, repeatDelay: 0.6 }}
        >
          {character.emoji}
        </motion.span>
        <motion.span
          className="results-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.55 }}
        >
          {badge}
        </motion.span>
        <h1 className="results-title">Great work, {playerName}!</h1>
        <p className="results-message">{label}</p>

        <div className="results-stars" role="img" aria-label={`${correct} of ${total} stars`}>
          {Array.from({ length: total }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring", bounce: 0.6 }}
            >
              {i < correct ? "⭐" : "☆"}
            </motion.span>
          ))}
        </div>
        <p className="results-score">
          You earned <strong>{correct}</strong> out of <strong>{total}</strong> stars!
        </p>
        <div className="results-tally">
          <span className="tally correct-tally">Correct: {correct}</span>
          {missed.length > 0 && (
            <span className="tally practise-tally">Let&apos;s practise: {missed.length}</span>
          )}
          {bestStreak > 0 && (
            <motion.span
              className="tally streak-tally"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, type: "spring", bounce: 0.6 }}
            >
              🔥 Best streak: {bestStreak}
              {bestStreak > 1 ? " in a row!" : ""}
            </motion.span>
          )}
        </div>
      </motion.div>

      <div className="results-buttons">
        <motion.button
          type="button"
          className="big-button retry-button"
          whileTap={{ scale: 0.93 }}
          onClick={() => {
            sounds.click();
            onRetry();
          }}
        >
          Try Again! 🔁
        </motion.button>
        <motion.button
          type="button"
          className="big-button map-button"
          whileTap={{ scale: 0.93 }}
          onClick={() => {
            sounds.click();
            onBackToLevels();
          }}
        >
          Back to Map 🗺️
        </motion.button>
      </div>

      {missed.length > 0 && (
        <div className="review-section">
          <h2 className="review-title">Let&apos;s look again! 🔍</h2>
          {missed.map((record) => {
            const question = level.questions.find((qq) => qq.id === record.questionId);
            if (!question) return null;

            // Drag-to-pay questions have no pre-set options — review by amount.
            if (question.mode) {
              const paid = record.selectedOptionId.split(":")[1] ?? "0";
              const needed = record.correctOptionId.split(":")[1] ?? "0";
              return (
                <div className="review-card" key={record.questionId}>
                  <p className="review-prompt">{question.prompt}</p>
                  <div className="review-answers">
                    <div className="review-answer chosen">
                      <span className="review-answer-label">You paid</span>
                      <span className="option-text">${paid}</span>
                    </div>
                    <span className="review-arrow" aria-hidden="true">➡️</span>
                    <div className="review-answer right">
                      <span className="review-answer-label">Needed</span>
                      <span className="option-text">${needed}</span>
                    </div>
                  </div>
                </div>
              );
            }

            const chosen = question.options?.find((o) => o.id === record.selectedOptionId);
            const right = question.options?.find((o) => o.id === record.correctOptionId);
            return (
              <div className="review-card" key={record.questionId}>
                {question.item ? (
                  <div className="review-item">
                    {question.item.emoji ? (
                      <span className="review-emoji">{question.item.emoji}</span>
                    ) : (
                      <img src={question.item.image} alt={question.item.name} />
                    )}
                    <span className="review-price">
                      The {question.item.name.toLowerCase()} costs{" "}
                      <strong>{formatMoney(question.item.price)}</strong>
                    </span>
                  </div>
                ) : (
                  <p className="review-prompt">{question.prompt}</p>
                )}
                <div className="review-answers">
                  <div className="review-answer chosen">
                    <span className="review-answer-label">You chose</span>
                    {chosen && <OptionVisual option={chosen} />}
                  </div>
                  <span className="review-arrow" aria-hidden="true">➡️</span>
                  <div className="review-answer right">
                    <span className="review-answer-label">Correct answer</span>
                    {right && <OptionVisual option={right} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
