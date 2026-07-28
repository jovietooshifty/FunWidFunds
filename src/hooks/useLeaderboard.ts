import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface LeaderboardEntry {
  student_id: string;
  name: string;
  emoji: string;
  total_stars: number;
}

export interface ChildClass {
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
}

/** Country-wide board (all players), via a SECURITY DEFINER aggregate. */
export function useCountryLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("country_leaderboard", { p_limit: 100 });
      if (!active) return;
      setEntries(data ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { entries, loading };
}

/** Board for a single class (teacher of it, or a parent with a child in it). */
export function useClassLeaderboard(classId: string | undefined) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBoard = useCallback(async () => {
    if (!classId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc("class_leaderboard", { p_class_id: classId });
    setEntries(data ?? []);
    setLoading(false);
  }, [classId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return { entries, loading };
}

/** The signed-in parent's children and the class each belongs to (for filtering). */
export function useMyChildrenClasses() {
  const [options, setOptions] = useState<ChildClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("my_children_classes");
      if (!active) return;
      setOptions(data ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { options, loading };
}
