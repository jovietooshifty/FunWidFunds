import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Student } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export function useStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true });
    setStudents(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const addStudent = async (name: string, emoji: string) => {
    if (!user) return;
    const { error } = await supabase.from("students").insert({
      name,
      emoji,
      parent_id: user.id,
    });
    if (error) throw error;
    await fetch();
  };

  return { students, loading, addStudent, refetch: fetch };
}
