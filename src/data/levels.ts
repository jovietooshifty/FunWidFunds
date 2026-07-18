import type { Level, Question } from "../types";
import { MONEY } from "./currency";

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

// Milestone 1 gameplay is dollar-notes only — no cents.
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
    description: "Lunchtime shopping fun!",
    emoji: "🥪",
    theme: "canteen",
    unlocked: false,
    questions: [],
    maxStars: 10,
    completionRequirement: 6,
  },
  {
    id: 3,
    title: "Mini-Mart",
    description: "So many things to buy!",
    emoji: "🏪",
    theme: "minimart",
    unlocked: false,
    questions: [],
    maxStars: 10,
    completionRequirement: 6,
  },
  {
    id: 4,
    title: "Toy Shop",
    description: "Pick a toy, pay the price!",
    emoji: "🧸",
    theme: "toyshop",
    unlocked: false,
    questions: [],
    maxStars: 10,
    completionRequirement: 6,
  },
  {
    id: 5,
    title: "Savings Bank",
    description: "Save your stars like money!",
    emoji: "🏦",
    theme: "bank",
    unlocked: false,
    questions: [],
    maxStars: 10,
    completionRequirement: 6,
  },
];
