import { motion } from "framer-motion";
import type { Student, StudentLevelProgress } from "../types/database";

interface StudentCardProps {
  student: Student;
  progress: StudentLevelProgress[];
  onPlay: () => void;
  onJoinClass?: () => void;
}

export function StudentCard({ student, progress, onPlay, onJoinClass }: StudentCardProps) {
  const totalStars = progress.reduce((sum, p) => sum + p.stars_earned, 0);
  const levelsPlayed = progress.length;

  return (
    <motion.div
      className="student-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <span className="student-card-emoji">{student.emoji}</span>
      <h3 className="student-card-name">{student.name}</h3>
      <div className="student-card-stats">
        <span className="student-stat">Stars: {totalStars}</span>
        <span className="student-stat">Levels: {levelsPlayed}</span>
      </div>
      <div className="student-card-actions">
        <motion.button
          type="button"
          className="big-button play-button"
          whileTap={{ scale: 0.93 }}
          onClick={onPlay}
        >
          Play!
        </motion.button>
        {onJoinClass && (
          <button type="button" className="link-button" onClick={onJoinClass}>
            Join a class
          </button>
        )}
      </div>
    </motion.div>
  );
}
