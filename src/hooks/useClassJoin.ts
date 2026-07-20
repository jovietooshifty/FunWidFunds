import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Class } from "../types/database";

export function useClassJoin() {
  const [previewClass, setPreviewClass] = useState<(Class & { teacher_name: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupCode = async (code: string) => {
    setError(null);
    setLoading(true);
    setPreviewClass(null);

    const { data, error: err } = await supabase
      .from("classes")
      .select("*, profiles!classes_teacher_id_fkey(name)")
      .eq("class_code", code.toUpperCase())
      .single();

    setLoading(false);

    if (err || !data) {
      setError("No class found with that code. Check and try again!");
      return;
    }

    const teacherName = (data as any).profiles?.name ?? "Teacher";
    setPreviewClass({ ...data, teacher_name: teacherName });
  };

  const joinClass = async (studentId: string, classId: string) => {
    setError(null);
    const { error: err } = await supabase.from("student_class_links").insert({
      student_id: studentId,
      class_id: classId,
    });
    if (err) {
      if (err.code === "23505") {
        setError("Already in this class!");
      } else {
        throw err;
      }
    }
  };

  return { previewClass, loading, error, lookupCode, joinClass };
}
