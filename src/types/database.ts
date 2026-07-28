export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: "parent" | "teacher";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          role?: "parent" | "teacher";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: "parent" | "teacher";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          parent_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          emoji: string;
          parent_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          parent_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          class_code: string;
          teacher_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          class_code: string;
          teacher_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          class_code?: string;
          teacher_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_class_links: {
        Row: {
          student_id: string;
          class_id: string;
          joined_at: string;
        };
        Insert: {
          student_id: string;
          class_id: string;
          joined_at?: string;
        };
        Update: {
          student_id?: string;
          class_id?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_class_links_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_class_links_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
      };
      student_answers: {
        Row: {
          id: string;
          student_id: string;
          level_id: number;
          question_id: string;
          prompt: string | null;
          correct: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          level_id: number;
          question_id: string;
          prompt?: string | null;
          correct: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          level_id?: number;
          question_id?: string;
          prompt?: string | null;
          correct?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_answers_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_level_progress: {
        Row: {
          id: string;
          student_id: string;
          level_id: number;
          stars_earned: number;
          lessons_completed: number;
          lessons_wrong: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          level_id: number;
          stars_earned?: number;
          lessons_completed?: number;
          lessons_wrong?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          level_id?: number;
          stars_earned?: number;
          lessons_completed?: number;
          lessons_wrong?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_level_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // SECURITY DEFINER lookup: lets a parent see a class + its teacher's name
      // from a class code without opening up `profiles` reads generally.
      lookup_class_by_code: {
        Args: { p_code: string };
        Returns: {
          id: string;
          name: string;
          class_code: string;
          teacher_id: string;
          teacher_name: string;
        }[];
      };
      // Cross-user leaderboards (definer functions — RLS limits direct reads to
      // your own students, so aggregates have to be computed server-side).
      country_leaderboard: {
        Args: { p_limit?: number };
        Returns: {
          student_id: string;
          name: string;
          emoji: string;
          total_stars: number;
        }[];
      };
      class_leaderboard: {
        Args: { p_class_id: string };
        Returns: {
          student_id: string;
          name: string;
          emoji: string;
          total_stars: number;
        }[];
      };
      my_children_classes: {
        Args: Record<string, never>;
        Returns: {
          student_id: string;
          student_name: string;
          class_id: string;
          class_name: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Class = Database["public"]["Tables"]["classes"]["Row"];
export type StudentClassLink = Database["public"]["Tables"]["student_class_links"]["Row"];
export type StudentLevelProgress = Database["public"]["Tables"]["student_level_progress"]["Row"];
export type StudentAnswerRow = Database["public"]["Tables"]["student_answers"]["Row"];
