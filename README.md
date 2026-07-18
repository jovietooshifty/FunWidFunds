# FunWidFunds
Teaching how to handle legal tender

A playful money-learning game for kindergarteners set in a Caribbean storybook
town, using Trinidad and Tobago currency.

## Milestone 1

- Name entry + character selection
- Level map (Level 1 "Fruit Stand" playable, Levels 2–5 locked)
- 10 questions matching TT coins/notes to item prices
- One try per question, star scoring, gentle feedback, results + review, retry

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build in dist/
```

## Structure

- `src/data/levels.ts` — data-driven levels/questions (add levels here)
- `src/data/currency.ts` — TT currency registry (images in `public/assets/money/`)
- `src/screens/` — Welcome, LevelSelect, Game, Results
- `src/audio/sound.ts` — short WebAudio chimes (no narration; toggle-ready)
