import type { MoneyOption } from "../types";
import { MONEY, formatMoney } from "../data/currency";

/**
 * Renders the inner visual of a money answer option, handling all question
 * types with one component (used by both GameScreen and ResultsScreen):
 *  - bills[]  → a row of bill images grouped by denomination with ×counts
 *               plus a total tally (Least-Bills questions)
 *  - image    → a single bill/coin image + its value (Exact-Match)
 *  - neither  → the label as text (Counting amounts, Budgeting choices)
 */
export function OptionVisual({ option }: { option: MoneyOption }) {
  if (option.bills && option.bills.length > 0) {
    const groups: { id: string; count: number }[] = [];
    for (const id of option.bills) {
      const g = groups.find((x) => x.id === id);
      if (g) g.count += 1;
      else groups.push({ id, count: 1 });
    }
    return (
      <>
        <span className="bill-stack">
          {groups.map((g, i) => (
            <span className="bill-group" key={i}>
              <img src={MONEY[g.id]?.image} alt="" />
              {g.count > 1 && <span className="bill-mult">×{g.count}</span>}
            </span>
          ))}
        </span>
        <span className="bill-count">
          {option.bills.length} bill{option.bills.length > 1 ? "s" : ""}
        </span>
        <span className="option-caption">{option.label}</span>
      </>
    );
  }

  if (option.image) {
    return (
      <>
        <img src={option.image} alt={option.label} />
        <span className="money-value">{formatMoney(option.value)}</span>
      </>
    );
  }

  return <span className="option-text">{option.label}</span>;
}

/** The CSS type class that should sit on the option button wrapper. */
export function optionTypeClass(option: MoneyOption): string {
  if (option.bills && option.bills.length > 0) return "bills";
  if (option.image) return "note";
  return "text";
}
