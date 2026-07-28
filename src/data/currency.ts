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
  // No 1-cent entry: Trinidad & Tobago eliminated the 1c coin and prices round
  // to the nearest 5c, so it isn't money a child will ever handle.
  // Coin art is the official Central Bank of Trinidad and Tobago photography
  // (value side), masked to a transparent circle.
  "tt-5-cent": {
    id: "tt-5-cent",
    value: 0.05,
    label: "Five cent coin",
    image: "/assets/money/tt-5-cent.png",
  },
  "tt-10-cent": {
    id: "tt-10-cent",
    value: 0.1,
    label: "Ten cent coin",
    image: "/assets/money/tt-10-cent.png",
  },
  "tt-25-cent": {
    id: "tt-25-cent",
    value: 0.25,
    label: "Twenty-five cent coin",
    image: "/assets/money/tt-25-cent.png",
  },
  "tt-50-cent": {
    id: "tt-50-cent",
    value: 0.5,
    label: "Fifty cent coin",
    image: "/assets/money/tt-50-cent.png",
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

/** Format a cent amount the way the worksheets do: 55 -> "55¢", 100 -> "$1.00". */
export function formatCents(cents: number): string {
  if (cents < 100) return `${cents}¢`;
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/** Spoken form for read-aloud: 55 -> "55 cents", 100 -> "1 dollar". */
export function speakCents(cents: number): string {
  if (cents < 100) return `${cents} cents`;
  const dollars = cents / 100;
  const whole = Math.floor(dollars);
  const rest = cents % 100;
  const dollarPart = `${whole} dollar${whole === 1 ? "" : "s"}`;
  return rest === 0 ? dollarPart : `${dollarPart} and ${rest} cents`;
}

/**
 * Coin art + on-screen size for each denomination, in cents.
 *
 * Sizes keep the real coins' relative proportions (the 5c really is wider than
 * the 10c, and the 25c is the biggest) so children learn to tell them apart by
 * size as well as picture — scaled up from the physical millimetre ratios so
 * the bird/hibiscus/chaconia stay legible on a tablet.
 */
export const COINS: Record<number, { id: string; image: string; label: string; size: number }> = {
  5: { id: "tt-5-cent", image: "/assets/money/tt-5-cent.png", label: "five cent coin", size: 66 },
  10: { id: "tt-10-cent", image: "/assets/money/tt-10-cent.png", label: "ten cent coin", size: 62 },
  25: { id: "tt-25-cent", image: "/assets/money/tt-25-cent.png", label: "twenty-five cent coin", size: 76 },
  50: { id: "tt-50-cent", image: "/assets/money/tt-50-cent.png", label: "fifty cent coin", size: 81 },
};

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
