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

export type PaymentMode = "exact" | "change" | "least-bills" | "budget";

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

export interface Question {
  id: string;
  prompt: string;
  item?: QuestionItem; // optional: counting/budgeting have no single item
  // Tap-to-select model (legacy shops still being converted to drag):
  options?: MoneyOption[];
  correctOptionId?: string;
  // Drag-to-pay model:
  mode?: PaymentMode;
  availableBills?: string[]; // denominations offered in the draggable tray
  targetValue?: number; // amount the kid must reach (price, or change owed)
  // Budgeting (drag items into a cart) model:
  budget?: number; // spending limit
  shopItems?: ShopItem[]; // items available on the shelf
  buyCount?: number; // how many items must end up in the cart
}

/** One row of coins the child must total up (values in cents). */
export interface CoinRowSpec {
  id: string;
  coins: number[];
  answer: number; // cents
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
  /** "questions" (default) = one-at-a-time; "coin-count" = drag totals onto rows. */
  kind?: "questions" | "coin-count";
  coinRows?: CoinRowSpec[];
  /** Draggable chip values in cents (answers plus distractors). */
  coinChips?: number[];
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
