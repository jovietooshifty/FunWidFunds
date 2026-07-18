interface StarBarProps {
  earned: number;
  total: number;
}

/** Row of stars at the top of the game — filled stars are questions answered correctly. */
export function StarBar({ earned, total }: StarBarProps) {
  return (
    <div
      id="star-bar"
      className="star-bar"
      role="img"
      aria-label={`${earned} of ${total} stars earned`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < earned ? "star filled" : "star empty"}>
          {i < earned ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
