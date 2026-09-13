# 2048

A browser implementation of the [2048](https://en.wikipedia.org/wiki/2048_(video_game)) puzzle game, built with React, TypeScript, and Vite.

Combine tiles with the arrow keys, WASD, or a swipe gesture to reach 2048.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Project structure

- `src/game/` — pure, framework-agnostic game logic (board state, moves, merges, win/lose detection) and its unit tests
- `src/hooks/` — `useGame` (state/score/persistence via `useReducer`) and `useSwipe` (touch input)
- `src/components/` — presentational `Board` and `Tile` components
