import { useState } from "react";
import { supabase } from "../lib/supabase";

export interface ClassPreview {
  id: string;
  name: string;
  class_code: string;
  teacher_id: string;
  teacher_name: string;
}

export function useClassJoin() {
  const [previewClass, setPreviewClass] = useState<ClassPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupCode = async (code: string) => {
    setError(null);
    setLoading(true);
    setPreviewClass(null);

    // RPC (SECURITY DEFINER) rather than an embedded join: RLS restricts
    // `profiles` reads to your own row, so joining here returned a null
    // teacher and the UI fell back to the literal word "Teacher".
    const { data, error: err } = await supabase.rpc("lookup_class_by_code", {
      p_code: code.trim(),
    });

    setLoading(false);

    const row = data?.[0];
    if (err || !row) {
      setError("No class found with that code. Check and try again!");
      return;
    }

    setPreviewClass(row);
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
