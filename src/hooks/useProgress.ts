import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { StudentLevelProgress } from "../types/database";

export function useProgress(studentId: string | undefined) {
  const [progress, setProgress] = useState<StudentLevelProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    const { data } = await supabase
      .from("student_level_progress")
      .select("*")
      .eq("student_id", studentId);
    setProgress(data ?? []);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsertProgress = async (
    levelId: number,
    starsEarned: number,
    completed: number,
    wrong: number,
  ) => {
    if (!studentId) return;

    const existing = progress.find((p) => p.level_id === levelId);

    if (existing) {
      // Best-score merge
      await supabase.from("student_level_progress").update({
        stars_earned: Math.max(existing.stars_earned, starsEarned),
        lessons_completed: existing.lessons_completed + completed,
        lessons_wrong: existing.lessons_wrong + wrong,
      }).eq("id", existing.id);
    } else {
      await supabase.from("student_level_progress").insert({
        student_id: studentId,
        level_id: levelId,
        stars_earned: starsEarned,
        lessons_completed: completed,
        lessons_wrong: wrong,
      });
    }

    await fetch();
  };

  return { progress, loading, upsertProgress, refetch: fetch };
}
