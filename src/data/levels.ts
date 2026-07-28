import type { Level, Question } from "../types";
import { MONEY, speakCents } from "./currency";

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
// Level 6 — Count the Coins (shown second on the map)
// Rows of real TT coins; drag the matching total onto each row.
// Chips = the six answers plus two distractors, so elimination doesn't work.
// ============================================================
export const coinCountRows = [
  { id: "coins-1", coins: [10, 10, 10, 25], answer: 55 },
  { id: "coins-2", coins: [5, 5, 5, 25, 5], answer: 45 },
  { id: "coins-3", coins: [25, 25, 25, 25], answer: 100 },
  { id: "coins-4", coins: [10, 10, 10, 10, 25], answer: 65 },
  { id: "coins-5", coins: [5, 5, 5, 5, 5], answer: 25 },
  { id: "coins-6", coins: [10, 25, 25, 5, 10], answer: 75 },
];

const coinChips = [55, 45, 100, 65, 25, 75, 20, 90]; // last two are distractors

// ============================================================
// Level 7 — Pay With Coins (shown second on the map)
// One question at a time: drag coins until they total the price exactly.
// Every pool holds more coins than needed, and several combinations work.
//
// Every target is a multiple of 5c: Trinidad & Tobago eliminated the 1c coin
// and prices round to the nearest 5c, so amounts like 7c can't actually be paid.
// ============================================================
function coinPayQ(num: number, targetCents: number, availableCoins: number[]): Question {
  return {
    id: `level-2-question-${num}`,
    // Written out in words so read-aloud says "fifty-five cents", not "55 c".
    prompt: `Pay exactly ${speakCents(targetCents)}!`,
    mode: "coin-pay",
    targetCents,
    availableCoins,
  };
}

export const coinPayQuestions: Question[] = [
  coinPayQ(1, 25, [5, 5, 10, 25, 10, 5]), // one 25c, or 10+10+5
  coinPayQ(2, 35, [10, 10, 25, 5, 5, 10]), // 25+10, or 10+10+10+5
  coinPayQ(3, 50, [25, 25, 10, 10, 5, 5]), // 25+25, or 25+10+10+5
  coinPayQ(4, 15, [5, 5, 5, 10, 25, 10]), // 10+5, or 5+5+5
  coinPayQ(5, 20, [5, 5, 5, 5, 10, 10, 25]), // small coins, no single-coin shortcut
  coinPayQ(6, 65, [25, 25, 10, 10, 5, 5, 50, 10]), // 50+10+5, or 25+25+10+5
  coinPayQ(7, 80, [25, 25, 25, 10, 5, 5, 10, 50]), // 50+25+5, or 25+25+25+5
  coinPayQ(8, 100, [25, 25, 25, 25, 10, 10, 50, 5]), // 25x4, or 50+25+25
];

/** True when a level actually has something to play (questions or coin rows). */
export function hasContent(level: Level): boolean {
  return level.kind === "coin-count"
    ? (level.coinRows?.length ?? 0) > 0
    : level.questions.length > 0;
}

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
    // Stable ids (not map positions) — saved progress is keyed by level_id, so
    // renumbering would silently repoint real students' history at other shops.
    // The map numbers by position, so this shows as "Level 2".
    id: 7,
    title: "Pay With Coins",
    description: "Drag coins to pay the exact price!",
    emoji: "💰",
    theme: "coins",
    unlocked: true,
    questions: coinPayQuestions,
    maxStars: coinPayQuestions.length,
    completionRequirement: 0,
  },
  {
    id: 6,
    title: "Count the Coins",
    description: "Add up the coins and drag the total!",
    emoji: "🪙",
    theme: "coins",
    unlocked: true,
    kind: "coin-count",
    coinRows: coinCountRows,
    coinChips,
    questions: [],
    maxStars: coinCountRows.length,
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
