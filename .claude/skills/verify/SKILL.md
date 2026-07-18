---
name: verify
description: Build, run and drive FUN WID FUNDS (Vite + React kids' money game) to verify changes end-to-end.
---

# Verifying FUN WID FUNDS

## Build / launch

```bash
npm run build        # tsc -b && vite build
npm run dev          # dev server on http://localhost:5173 (run in background)
```

## Drive it (Playwright)

Chromium for Playwright is already installed on this machine. Install `playwright`
in a scratch dir (not the project) and drive the flow:

1. Welcome: fill `#player-name`, click a character via `getByRole("radio", { name: /Tia/ })`.
2. The **Let's Play button pulses forever by design** — Playwright's stability
   check times out; click it with `{ force: true }`.
3. Level map: `getByRole("button", { name: /Play level 1/ })`. Locked levels show
   "Coming soon!" for ~1.4s when clicked.
4. Questions: the correct option is the `.money-option` whose `.money-value` text
   equals the `.price-tag` text. Feedback auto-advances after ~1.7s (correct) /
   ~2.4s (incorrect); options are disabled during feedback.
5. Results: `.results-card`, missed questions in `.review-card`, buttons
   `Try Again` / `Back to Map`.

## Gotchas

- All game state is in-memory (no persistence by design — Milestone 1).
- Sounds are WebAudio-generated; headless runs are silent, nothing to assert.
- Confetti respects `prefers-reduced-motion`.
