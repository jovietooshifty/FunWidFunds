const DECOR = [
  { emoji: "🪙", left: "6%", top: "12%", dur: 7, delay: 0 },
  { emoji: "⭐", left: "88%", top: "18%", dur: 9, delay: 1.2 },
  { emoji: "☁️", left: "14%", top: "70%", dur: 11, delay: 0.5 },
  { emoji: "🪙", left: "80%", top: "72%", dur: 8, delay: 2 },
  { emoji: "🌴", left: "3%", top: "42%", dur: 10, delay: 0.8 },
  { emoji: "☁️", left: "70%", top: "6%", dur: 12, delay: 0 },
  { emoji: "⭐", left: "30%", top: "8%", dur: 8, delay: 2.4 },
  { emoji: "🍉", left: "92%", top: "48%", dur: 9, delay: 1.6 },
];

/** Decorative floating coins, stars and clouds behind every screen. */
export function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      {DECOR.map((d, i) => (
        <span
          key={i}
          className="floaty"
          style={{
            left: d.left,
            top: d.top,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}
