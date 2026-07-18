export interface MoneyOption {
  id: string;
  value: number;
  label: string;
  image: string;
}

export interface QuestionItem {
  name: string;
  price: number;
  image: string;
}

export interface Question {
  id: string;
  prompt: string;
  item: QuestionItem;
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
