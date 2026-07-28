import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Class } from "../types/database";

export interface ClassWithCount extends Class {
  student_count: number;
}

function makeCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** All classes owned by the signed-in teacher, plus create/delete. */
export function useClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: rows } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: true });

    const list = rows ?? [];

    // Student counts per class (one query, grouped client-side).
    let counts: Record<string, number> = {};
    if (list.length > 0) {
      const { data: links } = await supabase
        .from("student_class_links")
        .select("class_id")
        .in("class_id", list.map((c) => c.id));
      counts = (links ?? []).reduce<Record<string, number>>((acc, l) => {
        acc[l.class_id] = (acc[l.class_id] ?? 0) + 1;
        return acc;
      }, {});
    }

    setClasses(list.map((c) => ({ ...c, student_count: counts[c.id] ?? 0 })));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const createClass = async (name: string) => {
    if (!user) return;
    // Retry on the (unlikely) chance of a duplicate join code.
    for (let attempt = 0; attempt < 4; attempt++) {
      const { error } = await supabase.from("classes").insert({
        name,
        class_code: makeCode(),
        teacher_id: user.id,
      });
      if (!error) {
        await fetchClasses();
        return;
      }
      if (error.code !== "23505") throw error;
    }
    throw new Error("Could not generate a unique class code. Please try again.");
  };

  const deleteClass = async (classId: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", classId);
    if (error) throw error;
    await fetchClasses();
  };

  return { classes, loading, createClass, deleteClass, refetch: fetchClasses };
}
