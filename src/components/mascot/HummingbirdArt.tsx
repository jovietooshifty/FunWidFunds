/**
 * Mascot artwork: a friendly front-facing hummingbird perched on a branch,
 * waving one wing, wearing a graduation cap, a Trinidad & Tobago flag sash
 * and a monocle over its right eye.
 *
 * This is the single asset boundary for the mascot — to swap in final
 * artwork (image, sprite or Lottie), replace this component only.
 * Named groups (.mascot-wave-wing, .mascot-eyelid, .mascot-tassel,
 * .mascot-head) are animated from CSS depending on the mascot state.
 */
export function HummingbirdArt() {
  return (
    <svg
      className="hummingbird-art"
      viewBox="0 0 260 290"
      role="img"
      aria-label="Professor Pico, the friendly hummingbird guide, wearing a graduation cap and a Trinidad and Tobago sash"
    >
      <defs>
        <linearGradient id="mascot-body-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#41c9ee" />
          <stop offset="100%" stopColor="#1e9fd4" />
        </linearGradient>
        <linearGradient id="mascot-head-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fd3f5" />
          <stop offset="100%" stopColor="#2fb4e3" />
        </linearGradient>
        <clipPath id="mascot-body-clip">
          <ellipse cx="130" cy="196" rx="60" ry="56" />
        </clipPath>
      </defs>

      {/* branch */}
      <path
        d="M12 258 q62 -10 118 -6 q62 4 118 -2 l0 11 q-56 8 -118 4 q-56 -4 -118 4 z"
        fill="#8d6e63"
        stroke="#6d4c41"
        strokeWidth="3"
      />
      <path d="M210 252 q18 -18 36 -14 q-9 19 -32 21z" fill="#66bb6a" />
      <path d="M28 261 q-15 12 -9 25 q15 -6 17 -23z" fill="#43a047" />

      {/* tail feathers peeking out behind the body */}
      <g fill="#1780b8">
        <path d="M96 236 q-26 16 -30 40 q20 -4 32 -24z" />
        <path d="M110 242 q-12 20 -8 38 q14 -10 18 -30z" />
      </g>

      {/* resting wing (viewer left) */}
      <path
        d="M82 172 q-32 6 -38 40 q20 9 38 -5 q14 -11 11 -24 z"
        fill="#1e9fd4"
        stroke="#1780b8"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* body */}
      <ellipse cx="130" cy="196" rx="60" ry="56" fill="url(#mascot-body-grad)" />
      <ellipse cx="130" cy="212" rx="38" ry="36" fill="#fdf6e8" />

      {/* T&T flag sash across the chest */}
      <g clipPath="url(#mascot-body-clip)">
        <g transform="rotate(40 130 196)">
          <rect x="60" y="176" width="140" height="10" fill="#da1a35" />
          <rect x="60" y="186" width="140" height="8" fill="#ffffff" />
          <rect x="60" y="194" width="140" height="10" fill="#1a1a1a" />
        </g>
      </g>

      {/* waving wing (viewer right) */}
      <g className="mascot-wave-wing">
        <path
          d="M180 174 q4 -34 32 -50 q12 -7 11 5 q-1 8 -9 14 q15 -9 19 1 q3 8 -8 15 q13 -2 11 9 q-2 10 -17 13 q-26 6 -41 -5 z"
          fill="#1e9fd4"
          stroke="#1780b8"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M188 168 q10 -20 26 -30" fill="none" stroke="#1780b8" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* feet gripping the branch */}
      <g stroke="#f5a623" strokeWidth="5" strokeLinecap="round">
        <path d="M112 244 l-4 12 m4 -12 l1 13 m-1 -13 l6 12" />
        <path d="M148 244 l-4 12 m4 -12 l1 13 m-1 -13 l6 12" />
      </g>

      {/* head group (tilts when thinking) */}
      <g className="mascot-head">
        <circle cx="130" cy="108" r="56" fill="url(#mascot-head-grad)" />
        {/* white face patch */}
        <ellipse cx="130" cy="122" rx="39" ry="33" fill="#fdf6e8" />
        {/* eyes: big and glossy */}
        <circle cx="108" cy="104" r="9.5" fill="#263238" />
        <circle cx="152" cy="104" r="9.5" fill="#263238" />
        <circle cx="111" cy="100" r="3.2" fill="#ffffff" />
        <circle cx="155" cy="100" r="3.2" fill="#ffffff" />
        <circle cx="105" cy="107" r="1.6" fill="#ffffff" opacity="0.8" />
        <circle cx="149" cy="107" r="1.6" fill="#ffffff" opacity="0.8" />
        {/* blink lids */}
        <g className="mascot-eyelid">
          <circle cx="108" cy="104" r="11" fill="#fdf6e8" />
          <circle cx="152" cy="104" r="11" fill="#fdf6e8" />
        </g>
        {/* monocle over the right eye */}
        <circle cx="152" cy="104" r="15.5" fill="none" stroke="#d4a017" strokeWidth="3.5" />
        <path d="M162 116 q6 20 -5 34" fill="none" stroke="#d4a017" strokeWidth="2" strokeDasharray="3 3" />
        {/* small open happy beak */}
        <path d="M115 123 q15 -9 30 0 q-7 9 -15 9 q-8 0 -15 -9 z" fill="#f5a623" stroke="#d78819" strokeWidth="2" strokeLinejoin="round" />
        <path d="M120 131 q10 11 20 0 q-3 13 -10 13 q-7 0 -10 -13 z" fill="#8a4b2a" />
        <ellipse cx="130" cy="139" rx="4.6" ry="3.2" fill="#ff8a80" />
        {/* cheek blush */}
        <circle cx="93" cy="124" r="6.5" fill="#ff8a80" opacity="0.5" />
        <circle cx="167" cy="124" r="6.5" fill="#ff8a80" opacity="0.5" />
        {/* graduation cap */}
        <path d="M106 58 h48 v13 q-24 10 -48 0 z" fill="#3d3646" />
        <path d="M84 50 L130 30 L176 50 L130 70 Z" fill="#2f2a33" stroke="#241f2b" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="130" cy="50" r="3.5" fill="#d4a017" />
        <g className="mascot-tassel">
          <path d="M130 50 q24 0 34 9" fill="none" stroke="#d4a017" strokeWidth="2.5" />
          <line x1="164" y1="59" x2="164" y2="80" stroke="#d4a017" strokeWidth="2.5" />
          <ellipse cx="164" cy="86" rx="4.5" ry="8" fill="#f0b429" />
        </g>
      </g>
    </svg>
  );
}
