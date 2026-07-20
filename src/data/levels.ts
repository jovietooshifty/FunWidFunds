import type { Level, Question, QuestionItem } from "../types";
import { MONEY } from "./currency";

// ---- Bill id shorthands (dollar notes only for now) ----
const N1 = "tt-1-dollar-note";
const N5 = "tt-5-dollar-note";
const N10 = "tt-10-dollar-note";
const N20 = "tt-20-dollar-note";
const rep = (id: string, n: number): string[] => Array.from({ length: n }, () => id);

// ============================================================
// Helpers — one per question shape. All produce a Question.
// ============================================================

// Bills offered in the draggable tray (a real spread, not just what's needed).
const TRAY = [N1, N5, N10, N20];

// Type 1 — Exact Match (Fruit Stand): drag bills until the total = price.
function payQ(num: number, itemName: string, itemImage: string, price: number): Question {
  return {
    id: `level-1-question-${num}`,
    prompt: `The ${itemName.toLowerCase()} costs $${price}. Drag the money to pay!`,
    item: { name: itemName, price, image: itemImage },
    mode: "exact",
    availableBills: TRAY,
    targetValue: price,
  };
}

// Types 2 & 3 — Counting / Making Change. Options are plain dollar amounts.
function amountQ(
  id: string,
  prompt: string,
  amounts: number[],
  correctValue: number,
  item?: QuestionItem,
): Question {
  const options = amounts.map((v, i) => ({
    id: `${id}-o${i}`,
    value: v,
    label: `$${v}`,
  }));
  const correct = options.find((o) => o.value === correctValue)!;
  return { id, prompt, item, options, correctOptionId: correct.id };
}

// Type 4 — Budgeting. Options are text choices (items/combos/yes-no).
function choiceQ(
  id: string,
  prompt: string,
  choices: { label: string; value?: number }[],
  correctIndex: number,
): Question {
  const options = choices.map((c, i) => ({
    id: `${id}-o${i}`,
    value: c.value ?? 0,
    label: c.label,
  }));
  return { id, prompt, options, correctOptionId: options[correctIndex].id };
}

// Type 5 — Least Bills. Options are combinations of real bills.
function billsQ(
  id: string,
  prompt: string,
  item: QuestionItem,
  combos: { bills: string[]; label: string }[],
  correctIndex: number,
): Question {
  const options = combos.map((c, i) => ({
    id: `${id}-o${i}`,
    value: c.bills.reduce((sum, b) => sum + MONEY[b].value, 0),
    label: c.label,
    bills: c.bills,
  }));
  return { id, prompt, item, options, correctOptionId: options[correctIndex].id };
}

// ============================================================
// Level 1 — Fruit Stand (Exact Match) — unchanged
// ============================================================
export const levelOneQuestions: Question[] = [
  payQ(1, "Apple", "/assets/items/apple.svg", 1),
  payQ(2, "Juice", "/assets/items/juice.svg", 5),
  payQ(3, "Orange", "/assets/items/orange.svg", 1),
  payQ(4, "Mango", "/assets/items/mango.svg", 5),
  payQ(5, "Pear", "/assets/items/pear.svg", 1),
  payQ(6, "Pineapple", "/assets/items/pineapple.svg", 10),
  payQ(7, "Coconut", "/assets/items/coconut.svg", 10),
  payQ(8, "Banana", "/assets/items/banana.svg", 1),
  payQ(9, "Grapes", "/assets/items/grapes.svg", 20),
  payQ(10, "Watermelon", "/assets/items/watermelon.svg", 20),
];

// ============================================================
// Level 2 — School Canteen (Budgeting on a fixed amount)
// ============================================================
export const canteenQuestions: Question[] = [
  choiceQ("budget-1", "You have $15 to spend at the canteen. Which lunch can you afford?",
    [{ label: "Sandwich $12", value: 12 }, { label: "Pizza slice $18", value: 18 }, { label: "Combo meal $20", value: 20 }], 0),
  choiceQ("budget-2", "You have $10. Can you buy the juice for $4 and the sandwich for $5?",
    [{ label: "Yes, $9 total", value: 9 }, { label: "No, too much", value: 0 }, { label: "Yes, exactly $10", value: 10 }], 0),
  choiceQ("budget-3", "You have $20. Which toy fits your budget?",
    [{ label: "Puzzle $14", value: 14 }, { label: "Robot $25", value: 25 }, { label: "Bike $40", value: 40 }], 0),
  choiceQ("budget-4", "You have $12. Pick two snacks that add up to $12 or less.",
    [{ label: "Chips $6 + Juice $5", value: 11 }, { label: "Chips $6 + Cookie $8", value: 14 }, { label: "Juice $5 + Cookie $8", value: 13 }], 0),
  choiceQ("budget-5", "You have $25. Which is the better deal within budget?",
    [{ label: "Puzzle $18", value: 18 }, { label: "Game $30", value: 30 }], 0),
];

// ============================================================
// Level 3 — Mini-Mart (Making Change)
// ============================================================
export const minimartQuestions: Question[] = [
  amountQ("change-1", "The toy costs $8. You give a $10 bill. How much change should you get?",
    [2, 8, 18], 2, { name: "toy", price: 8, emoji: "🧸" }),
  amountQ("change-2", "The book costs $15. You give a $20 bill. How much change?",
    [5, 35, 15], 5, { name: "book", price: 15, emoji: "📚" }),
  amountQ("change-3", "The candy costs $1. You give a $5 bill. How much change?",
    [4, 6, 5], 4, { name: "candy", price: 1, emoji: "🍬" }),
  amountQ("change-4", "The juice costs $9. You give a $10 bill. How much change?",
    [1, 19, 9], 1, { name: "juice", price: 9, emoji: "🧃" }),
  amountQ("change-5", "The ball costs $16. You give a $20 bill. How much change?",
    [4, 36, 16], 4, { name: "ball", price: 16, emoji: "⚽" }),
];

// ============================================================
// Level 4 — Toy Shop (Counting + Least Bills, mixed)
// ============================================================
const countingQuestions: Question[] = [
  amountQ("count-1", "You have these bills: $10, $5, and $1. How much money do you have?", [16, 15, 6], 16),
  amountQ("count-2", "You have $20, $1, and $1. How much money do you have?", [22, 21, 20], 22),
  amountQ("count-3", "You have $5, $5, and $10. How much money do you have?", [20, 15, 10], 20),
  amountQ("count-4", "You have $1, $1, $1, and $10. How much money do you have?", [13, 12, 11], 13),
  amountQ("count-5", "You have $20, $10, $5, and $1. How much money do you have?", [36, 35, 26], 36),
];

const leastBillsQuestions: Question[] = [
  billsQ("bills-1", "The book costs $21. Pay using the fewest bills possible.", { name: "book", price: 21, emoji: "📚" },
    [{ bills: [N10, N10, N1], label: "two $10 + one $1" }, { bills: rep(N1, 21), label: "21 × $1" }, { bills: [N10, ...rep(N1, 11)], label: "one $10 + eleven $1" }], 0),
  billsQ("bills-2", "The shoes cost $35. Pay with the fewest bills.", { name: "shoes", price: 35, emoji: "👟" },
    [{ bills: [N20, N10, N5], label: "one $20 + one $10 + one $5" }, { bills: rep(N5, 7), label: "seven $5" }, { bills: [N10, N10, N10, N5], label: "three $10 + one $5" }], 0),
  billsQ("bills-3", "The bag costs $16. Pay with the fewest bills.", { name: "bag", price: 16, emoji: "🎒" },
    [{ bills: [N10, N5, N1], label: "one $10 + one $5 + one $1" }, { bills: [N10, ...rep(N1, 6)], label: "one $10 + six $1" }, { bills: [N5, N5, N5, N1], label: "three $5 + one $1" }], 0),
  billsQ("bills-4", "The kite costs $42. Pay with the fewest bills.", { name: "kite", price: 42, emoji: "🪁" },
    [{ bills: [N20, N20, N1, N1], label: "two $20 + two $1" }, { bills: [N10, N10, N10, N10, N1, N1], label: "four $10 + two $1" }, { bills: [N20, N10, N10, N1, N1], label: "one $20 + two $10 + two $1" }], 0),
  billsQ("bills-5", "The lamp costs $27. Pay with the fewest bills.", { name: "lamp", price: 27, emoji: "💡" },
    [{ bills: [N20, N5, N1, N1], label: "one $20 + one $5 + two $1" }, { bills: [N10, N10, N5, N1, N1], label: "two $10 + one $5 + two $1" }, { bills: [N20, ...rep(N1, 7)], label: "one $20 + seven $1" }], 0),
];

// Mixed: alternate a counting question with a least-bills question.
export const toyShopQuestions: Question[] = countingQuestions.flatMap((c, i) => [c, leastBillsQuestions[i]]);

// ============================================================
export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Fruit Stand",
    description: "Buy tasty fruit with the right money!",
    emoji: "🍎",
    theme: "fruit",
    unlocked: true,
    questions: levelOneQuestions,
    maxStars: levelOneQuestions.length,
    completionRequirement: 0,
  },
  {
    id: 2,
    title: "School Canteen",
    description: "Spend wisely on lunch!",
    emoji: "🥪",
    theme: "canteen",
    unlocked: true,
    questions: canteenQuestions,
    maxStars: canteenQuestions.length,
    completionRequirement: 0,
  },
  {
    id: 3,
    title: "Mini-Mart",
    description: "Count your change!",
    emoji: "🏪",
    theme: "minimart",
    unlocked: true,
    questions: minimartQuestions,
    maxStars: minimartQuestions.length,
    completionRequirement: 0,
  },
  {
    id: 4,
    title: "Toy Shop",
    description: "Count it up, pay it smart!",
    emoji: "🧸",
    theme: "toyshop",
    unlocked: true,
    questions: toyShopQuestions,
    maxStars: toyShopQuestions.length,
    completionRequirement: 0,
  },
  {
    id: 5,
    title: "Savings Bank",
    description: "Coming soon!",
    emoji: "🏦",
    theme: "bank",
    unlocked: false,
    questions: [],
    maxStars: 0,
    completionRequirement: 0,
  },
];
