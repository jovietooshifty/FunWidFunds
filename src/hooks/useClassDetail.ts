import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Class, Student, StudentLevelProgress, StudentAnswerRow } from "../types/database";

export interface MissedQuestion {
  question_id: string;
  prompt: string;
  wrong: number;
  attempts: number;
}

export interface ClassStudent {
  student: Student;
  progress: StudentLevelProgress[];
  totalStars: number;
  attempted: number;
  wrong: number;
  accuracy: number; // 0-100
  missed: MissedQuestion[]; // worst first
}

/** One class plus its students, ranked by stars, with per-question analytics. */
export function useClassDetail(classId: string | undefined) {
  const [klass, setKlass] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!classId) return;
    setLoading(true);

    const { data: classRow } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .maybeSingle();
    setKlass(classRow ?? null);

    const { data: links } = await supabase
      .from("student_class_links")
      .select("student_id")
      .eq("class_id", classId);

    const ids = (links ?? []).map((l) => l.student_id);
    if (ids.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const [{ data: studentRows }, { data: progressRows }, { data: answerRows }] = await Promise.all([
      supabase.from("students").select("*").in("id", ids),
      supabase.from("student_level_progress").select("*").in("student_id", ids),
      supabase.from("student_answers").select("*").in("student_id", ids),
    ]);

    const built: ClassStudent[] = (studentRows ?? []).map((s) => {
      const progress = (progressRows ?? []).filter((p) => p.student_id === s.id);
      const answers = (answerRows ?? []).filter((a) => a.student_id === s.id);

      const totalStars = progress.reduce((sum, p) => sum + p.stars_earned, 0);

      // Prefer the per-question log (accurate); fall back to level aggregates
      // for students who played before answer logging existed.
      let attempted: number;
      let wrong: number;
      if (answers.length > 0) {
        attempted = answers.length;
        wrong = answers.filter((a) => !a.correct).length;
      } else {
        attempted = progress.reduce((sum, p) => sum + p.lessons_completed, 0);
        wrong = progress.reduce((sum, p) => sum + p.lessons_wrong, 0);
      }
      const accuracy = attempted > 0 ? Math.round(((attempted - wrong) / attempted) * 100) : 0;

      // Most-missed questions
      const byQuestion = new Map<string, { prompt: string; wrong: number; attempts: number }>();
      for (const a of answers as StudentAnswerRow[]) {
        const entry = byQuestion.get(a.question_id) ?? {
          prompt: a.prompt ?? a.question_id,
          wrong: 0,
          attempts: 0,
        };
        entry.attempts += 1;
        if (!a.correct) entry.wrong += 1;
        if (a.prompt) entry.prompt = a.prompt;
        byQuestion.set(a.question_id, entry);
      }
      const missed: MissedQuestion[] = [...byQuestion.entries()]
        .map(([question_id, v]) => ({ question_id, ...v }))
        .filter((m) => m.wrong > 0)
        .sort((a, b) => b.wrong - a.wrong || b.attempts - a.attempts);

      return { student: s, progress, totalStars, attempted, wrong, accuracy, missed };
    });

    // Leaderboard order: stars desc, then accuracy desc
    built.sort((a, b) => b.totalStars - a.totalStars || b.accuracy - a.accuracy);
    setStudents(built);
    setLoading(false);
  }, [classId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  /** Remove a student from this class (the student record itself is untouched). */
  const kickStudent = async (studentId: string) => {
    if (!classId) return;
    const { error } = await supabase
      .from("student_class_links")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", studentId);
    if (error) throw error;
    await fetchDetail();
  };

  return { klass, students, loading, kickStudent, refetch: fetchDetail };
}
