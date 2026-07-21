import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface LeaderboardEntry {
  student_id: string;
  name: string;
  emoji: string;
  total_stars: number;
}

// Demo champions so the global board feels alive during testing.
// (Frontend-only — not stored in the database.)
const DEMO_ENTRIES: LeaderboardEntry[] = [
  { student_id: "demo-1", name: "Amara", emoji: "🦜", total_stars: 46 },
  { student_id: "demo-2", name: "Kai", emoji: "🐢", total_stars: 41 },
  { student_id: "demo-3", name: "Sofia", emoji: "🐠", total_stars: 37 },
  { student_id: "demo-4", name: "Diego", emoji: "🦩", total_stars: 33 },
  { student_id: "demo-5", name: "Priya", emoji: "🐵", total_stars: 28 },
  { student_id: "demo-6", name: "Leo", emoji: "🦀", total_stars: 24 },
  { student_id: "demo-7", name: "Maya", emoji: "🦜", total_stars: 19 },
  { student_id: "demo-8", name: "Noah", emoji: "🐢", total_stars: 16 },
  { student_id: "demo-9", name: "Zoe", emoji: "🐠", total_stars: 13 },
  { student_id: "demo-10", name: "Omar", emoji: "🦩", total_stars: 11 },
  { student_id: "demo-11", name: "Isla", emoji: "🐵", total_stars: 9 },
  { student_id: "demo-12", name: "Ethan", emoji: "🦀", total_stars: 6 },
  { student_id: "demo-13", name: "Ruby", emoji: "🦜", total_stars: 4 },
  { student_id: "demo-14", name: "Mason", emoji: "🐢", total_stars: 2 },
];

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

    const realEntries: LeaderboardEntry[] = (students ?? []).map((s) => ({
      student_id: s.id,
      name: s.name.split(" ")[0], // first name only for privacy
      emoji: s.emoji,
      total_stars: starMap[s.id] ?? 0,
    }));

    // Blend real players with the demo champions, then rank everyone together.
    const globalEntries = [...realEntries, ...DEMO_ENTRIES].sort(
      (a, b) => b.total_stars - a.total_stars,
    );

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
