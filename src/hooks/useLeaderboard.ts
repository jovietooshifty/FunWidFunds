import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface LeaderboardEntry {
  student_id: string;
  name: string;
  emoji: string;
  total_stars: number;
}

export function useLeaderboard(classId?: string) {
  const [global, setGlobal] = useState<LeaderboardEntry[]>([]);
  const [classBoard, setClassBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);

    // Global leaderboard: all students ranked by total stars
    const { data: students } = await supabase.from("students").select("id, name, emoji");
    const { data: progress } = await supabase.from("student_level_progress").select("student_id, stars_earned");

    const starMap: Record<string, number> = {};
    for (const p of progress ?? []) {
      starMap[p.student_id] = (starMap[p.student_id] ?? 0) + p.stars_earned;
    }

    const globalEntries: LeaderboardEntry[] = (students ?? [])
      .map((s) => ({
        student_id: s.id,
        name: s.name.split(" ")[0], // first name only for privacy
        emoji: s.emoji,
        total_stars: starMap[s.id] ?? 0,
      }))
      .sort((a, b) => b.total_stars - a.total_stars);

    setGlobal(globalEntries);

    // Class leaderboard
    if (classId) {
      const { data: links } = await supabase
        .from("student_class_links")
        .select("student_id")
        .eq("class_id", classId);
      const classIds = new Set((links ?? []).map((l) => l.student_id));
      setClassBoard(globalEntries.filter((e) => classIds.has(e.student_id)));
    }

    setLoading(false);
  }, [classId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { global, classBoard, loading };
}
