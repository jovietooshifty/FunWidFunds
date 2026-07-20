export interface MoneyOption {
  id: string;
  value: number;
  label: string;
  image?: string; // single bill/coin (exact-match, counting-source)
  bills?: string[]; // NEW: multiple MONEY ids shown together as one option
}

export interface QuestionItem {
  name: string;
  price: number;
  image?: string; // SVG/PNG asset (fruit, coins)
  emoji?: string; // NEW: render an emoji instead of an image asset
}

export interface Question {
  id: string;
  prompt: string;
  item?: QuestionItem; // optional: counting/budgeting have no single item
  options: MoneyOption[];
  correctOptionId: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  emoji: string;
  theme: string;
  unlocked: boolean;
  questions: Question[];
  maxStars: number;
  completionRequirement: number;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  correct: boolean;
  starEarned: boolean;
}

export type Screen = "welcome" | "levels" | "game" | "results";
