import type { MoneyOption } from "../types";

/**
 * Trinidad and Tobago currency registry.
 * Questions reference these by id — images are static assets,
 * never generated from descriptive text at runtime.
 *
 * Note images are the official Central Bank of Trinidad and Tobago
 * polymer-series photos (front faces). Coins exist in the registry for
 * future levels but Milestone 1 gameplay is dollar-notes only.
 */
export const MONEY: Record<string, MoneyOption> = {
  "tt-1-cent": {
    id: "tt-1-cent",
    value: 0.01,
    label: "One cent coin",
    image: "/assets/money/tt-1-cent.svg",
  },
  "tt-5-cent": {
    id: "tt-5-cent",
    value: 0.05,
    label: "Five cent coin",
    image: "/assets/money/tt-5-cent.svg",
  },
  "tt-10-cent": {
    id: "tt-10-cent",
    value: 0.1,
    label: "Ten cent coin",
    image: "/assets/money/tt-10-cent.svg",
  },
  "tt-25-cent": {
    id: "tt-25-cent",
    value: 0.25,
    label: "Twenty-five cent coin",
    image: "/assets/money/tt-25-cent.svg",
  },
  "tt-1-dollar-coin": {
    id: "tt-1-dollar-coin",
    value: 1,
    label: "One dollar coin",
    image: "/assets/money/tt-1-dollar-coin.svg",
  },
  "tt-1-dollar-note": {
    id: "tt-1-dollar-note",
    value: 1,
    label: "One dollar note",
    image: "/assets/money/tt-1-dollar-note.png",
  },
  "tt-5-dollar-note": {
    id: "tt-5-dollar-note",
    value: 5,
    label: "Five dollar note",
    image: "/assets/money/tt-5-dollar-note.png",
  },
  "tt-10-dollar-note": {
    id: "tt-10-dollar-note",
    value: 10,
    label: "Ten dollar note",
    image: "/assets/money/tt-10-dollar-note.png",
  },
  "tt-20-dollar-note": {
    id: "tt-20-dollar-note",
    value: 20,
    label: "Twenty dollar note",
    image: "/assets/money/tt-20-dollar-note.png",
  },
  "tt-100-dollar-note": {
    id: "tt-100-dollar-note",
    value: 100,
    label: "One hundred dollar note",
    image: "/assets/money/tt-100-dollar-note.png",
  },
};

export function formatMoney(value: number): string {
  return value < 1 ? `${Math.round(value * 100)}¢` : `$${value}`;
}

export function isNote(id: string): boolean {
  return id.includes("note");
}

/**
 * Fewest number of bills needed to make `target` using the given denomination
 * ids. Greedy is optimal for the canonical $1/$5/$10/$20 set. Returns Infinity
 * if the target cannot be made exactly.
 */
export function minBills(target: number, billIds: string[]): number {
  const values = billIds
    .map((id) => MONEY[id]?.value ?? 0)
    .filter((v) => v > 0)
    .sort((a, b) => b - a);
  let remaining = target;
  let count = 0;
  for (const v of values) {
    while (remaining >= v) {
      remaining -= v;
      count += 1;
    }
  }
  return remaining === 0 ? count : Infinity;
}
