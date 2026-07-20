import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Class, Student, StudentLevelProgress } from "../types/database";

export interface ClassStudentDetail {
  student: Student;
  progress: StudentLevelProgress[];
}

export function useClasses() {
  const { user } = useAuth();
  const [teacherClass, setTeacherClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClass = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", user.id)
      .limit(1)
      .single();
    setTeacherClass(data);

    if (data) {
      // Fetch students in this class
      const { data: links } = await supabase
        .from("student_class_links")
        .select("student_id")
        .eq("class_id", data.id);

      if (links && links.length > 0) {
        const studentIds = links.map((l) => l.student_id);

        const { data: students } = await supabase
          .from("students")
          .select("*")
          .in("id", studentIds);

        const { data: progress } = await supabase
          .from("student_level_progress")
          .select("*")
          .in("student_id", studentIds);

        const details: ClassStudentDetail[] = (students ?? []).map((s) => ({
          student: s,
          progress: (progress ?? []).filter((p) => p.student_id === s.id),
        }));
        setClassStudents(details);
      } else {
        setClassStudents([]);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchClass(); }, [fetchClass]);

  const createClass = async (name: string) => {
    if (!user) return;
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("classes").insert({
      name,
      class_code: classCode,
      teacher_id: user.id,
    });
    if (error) {
      if (error.code === "23505") {
        // Retry once with different code on unique collision
        const retryCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error: retryErr } = await supabase.from("classes").insert({
          name,
          class_code: retryCode,
          teacher_id: user.id,
        });
        if (retryErr) throw retryErr;
      } else {
        throw error;
      }
    }
    await fetchClass();
  };

  return { teacherClass, classStudents, loading, createClass, refetch: fetchClass };
}
