import type { Level, Question } from "../types";
import { MONEY } from "./currency";

// ---- Bill id shorthands (dollar notes only for now) ----
const N1 = "tt-1-dollar-note";
const N5 = "tt-5-dollar-note";
const N10 = "tt-10-dollar-note";
const N20 = "tt-20-dollar-note";

// ============================================================
// Helpers — one per question shape. All produce a Question.
// ============================================================

// Bills offered in the draggable tray (a real spread, not just what's needed).
const TRAY = [N1, N5, N10, N20];

// Type 1 — Exact Match (Fruit Stand): tap one of three single bills.
// Kept as the gentle tap intro; drag-to-pay begins at the shops after it.
function q(
  num: number,
  itemName: string,
  itemImage: string,
  price: number,
  optionIds: [string, string, string],
  correctOptionId: string,
): Question {
  return {
    id: `level-1-question-${num}`,
    prompt: `The ${itemName.toLowerCase()} costs $${price}. What do you pay with?`,
    item: { name: itemName, price, image: itemImage },
    options: optionIds.map((id) => MONEY[id]),
    correctOptionId,
  };
}

// Type 3 — Making Change (Mini-Mart): drag the correct change back to the customer.
function changeQ(
  id: string,
  name: string,
  emoji: string,
  price: number,
  paid: number,
  change: number,
): Question {
  return {
    id,
    prompt: `The ${name} costs $${price}. You paid with a $${paid} bill. Drag the change to give back!`,
    item: { name, price, emoji },
    mode: "change",
    availableBills: TRAY,
    targetValue: change,
  };
}

// Counting (Toy Shop): drag bills to build exactly the price.
function exactPayQ(id: string, name: string, emoji: string, price: number): Question {
  return {
    id,
    prompt: `The ${name} costs $${price}. Drag money to pay exactly $${price}!`,
    item: { name, price, emoji },
    mode: "exact",
    availableBills: TRAY,
    targetValue: price,
  };
}

// Least Bills (Toy Shop): reach the price using the fewest bills possible.
function leastBillsQ(id: string, name: string, emoji: string, price: number): Question {
  return {
    id,
    prompt: `The ${name} costs $${price}. Pay with the fewest bills you can!`,
    item: { name, price, emoji },
    mode: "least-bills",
    availableBills: TRAY,
    targetValue: price,
  };
}

// Type 4 — Budgeting (School Canteen): drag items into a cart within budget.
function budgetQ(
  id: string,
  budget: number,
  buyCount: number,
  prompt: string,
  items: { name: string; emoji: string; price: number }[],
): Question {
  return {
    id,
    prompt,
    mode: "budget",
    budget,
    buyCount,
    shopItems: items.map((it, i) => ({ id: `${id}-i${i}`, ...it })),
  };
}

// ============================================================
// Level 1 — Fruit Stand (Exact Match) — unchanged
// ============================================================
export const levelOneQuestions: Question[] = [
  q(1, "Apple", "/assets/items/apple.svg", 1,
    ["tt-1-dollar-note", "tt-5-dollar-note", "tt-10-dollar-note"], "tt-1-dollar-note"),
  q(2, "Juice", "/assets/items/juice.svg", 5,
    ["tt-1-dollar-note", "tt-5-dollar-note", "tt-20-dollar-note"], "tt-5-dollar-note"),
  q(3, "Orange", "/assets/items/orange.svg", 1,
    ["tt-10-dollar-note", "tt-1-dollar-note", "tt-5-dollar-note"], "tt-1-dollar-note"),
  q(4, "Mango", "/assets/items/mango.svg", 5,
    ["tt-5-dollar-note", "tt-10-dollar-note", "tt-1-dollar-note"], "tt-5-dollar-note"),
  q(5, "Pear", "/assets/items/pear.svg", 1,
    ["tt-20-dollar-note", "tt-1-dollar-note", "tt-10-dollar-note"], "tt-1-dollar-note"),
  q(6, "Pineapple", "/assets/items/pineapple.svg", 10,
    ["tt-10-dollar-note", "tt-20-dollar-note", "tt-5-dollar-note"], "tt-10-dollar-note"),
  q(7, "Coconut", "/assets/items/coconut.svg", 10,
    ["tt-1-dollar-note", "tt-10-dollar-note", "tt-20-dollar-note"], "tt-10-dollar-note"),
  q(8, "Banana", "/assets/items/banana.svg", 1,
    ["tt-5-dollar-note", "tt-1-dollar-note", "tt-20-dollar-note"], "tt-1-dollar-note"),
  q(9, "Grapes", "/assets/items/grapes.svg", 20,
    ["tt-5-dollar-note", "tt-10-dollar-note", "tt-20-dollar-note"], "tt-20-dollar-note"),
  q(10, "Watermelon", "/assets/items/watermelon.svg", 20,
    ["tt-20-dollar-note", "tt-1-dollar-note", "tt-10-dollar-note"], "tt-20-dollar-note"),
];

// ============================================================
// Level 2 — School Canteen (Budgeting on a fixed amount)
// ============================================================
export const canteenQuestions: Question[] = [
  budgetQ("budget-1", 15, 1, "You have $15. Drag 1 lunch you can afford into your cart!",
    [{ name: "Sandwich", emoji: "🥪", price: 12 }, { name: "Pizza", emoji: "🍕", price: 18 }, { name: "Combo", emoji: "🍱", price: 20 }]),
  budgetQ("budget-2", 10, 2, "You have $10. Drag 2 snacks that fit your budget!",
    [{ name: "Juice", emoji: "🧃", price: 4 }, { name: "Sandwich", emoji: "🥪", price: 5 }, { name: "Cookie", emoji: "🍪", price: 8 }]),
  budgetQ("budget-3", 20, 1, "You have $20. Drag 1 toy that fits your budget!",
    [{ name: "Puzzle", emoji: "🧩", price: 14 }, { name: "Robot", emoji: "🤖", price: 25 }, { name: "Bike", emoji: "🚲", price: 40 }]),
  budgetQ("budget-4", 12, 2, "You have $12. Drag 2 snacks without going over!",
    [{ name: "Chips", emoji: "🍟", price: 6 }, { name: "Juice", emoji: "🧃", price: 5 }, { name: "Cookie", emoji: "🍪", price: 8 }]),
  budgetQ("budget-5", 25, 1, "You have $25. Drag the better deal that fits your budget!",
    [{ name: "Puzzle", emoji: "🧩", price: 18 }, { name: "Game", emoji: "🎮", price: 30 }]),
];

// ============================================================
// Level 3 — Mini-Mart (Making Change)
// ============================================================
export const minimartQuestions: Question[] = [
  changeQ("change-1", "toy", "🧸", 8, 10, 2),
  changeQ("change-2", "book", "📚", 15, 20, 5),
  changeQ("change-3", "candy", "🍬", 1, 5, 4),
  changeQ("change-4", "juice", "🧃", 9, 10, 1),
  changeQ("change-5", "ball", "⚽", 16, 20, 4),
];

// ============================================================
// Level 4 — Toy Shop (Counting + Least Bills, mixed)
// ============================================================
const countingQuestions: Question[] = [
  exactPayQ("count-1", "toy car", "🚗", 7),
  exactPayQ("count-2", "doll", "🪆", 12),
  exactPayQ("count-3", "blocks", "🧱", 8),
  exactPayQ("count-4", "yo-yo", "🪀", 9),
  exactPayQ("count-5", "teddy bear", "🧸", 6),
];

const leastBillsQuestions: Question[] = [
  leastBillsQ("bills-1", "book", "📚", 21),
  leastBillsQ("bills-2", "shoes", "👟", 35),
  leastBillsQ("bills-3", "bag", "🎒", 16),
  leastBillsQ("bills-4", "kite", "🪁", 42),
  leastBillsQ("bills-5", "lamp", "💡", 27),
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
