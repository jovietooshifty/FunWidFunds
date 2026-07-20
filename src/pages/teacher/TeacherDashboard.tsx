import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useClasses } from "../../hooks/useClasses";
import { ClassCodeDisplay } from "../../components/ClassCodeDisplay";
import { sounds } from "../../audio/sound";

export function TeacherDashboard() {
  const { profile } = useAuth();
  const { teacherClass, classStudents, loading } = useClasses();
  const navigate = useNavigate();

  if (loading) return null;

  if (!teacherClass) {
    return (
      <motion.div
        className="screen dashboard-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dashboard-greeting">Welcome, {profile?.name}!</h1>
        <div className="empty-class-card">
          <p className="dashboard-empty">You don't have a class yet. Let's create one!</p>
          <motion.button
            type="button"
            className="big-button"
            whileTap={{ scale: 0.93 }}
            onClick={() => { sounds.click(); navigate("/teacher/create-class"); }}
          >
            Create a Class
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="screen dashboard-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="dashboard-greeting">Welcome, {profile?.name}!</h1>

      <div className="teacher-top-row">
        <h2 className="class-name-heading">{teacherClass.name}</h2>
        <ClassCodeDisplay code={teacherClass.class_code} />
      </div>

      {classStudents.length === 0 ? (
        <div className="empty-class-card">
          <p className="dashboard-empty">No students yet. Share your class code with parents!</p>
        </div>
      ) : (
        <div className="teacher-student-list">
          {classStudents.map(({ student, progress }) => {
            const totalStars = progress.reduce((s, p) => s + p.stars_earned, 0);
            const totalCompleted = progress.reduce((s, p) => s + p.lessons_completed, 0);
            const totalWrong = progress.reduce((s, p) => s + p.lessons_wrong, 0);
            const pct = totalCompleted > 0
              ? Math.round(((totalCompleted - totalWrong) / totalCompleted) * 100)
              : 0;

            return (
              <div className="teacher-student-row" key={student.id}>
                <span className="teacher-student-emoji">{student.emoji}</span>
                <span className="teacher-student-name">{student.name}</span>
                <span className="teacher-stat">Stars: {totalStars}</span>
                <span className="teacher-stat">Lessons: {totalCompleted}</span>
                <span className={`teacher-pct-pill ${pct >= 70 ? "good" : pct >= 40 ? "ok" : "low"}`}>
                  {pct}% correct
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
