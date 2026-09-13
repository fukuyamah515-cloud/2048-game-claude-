# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) then production build (`vite build`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint (not ESLint; see `.oxlintrc.json`)
- `npm run test` — run the full Vitest suite once
- `npm run test:watch` — run Vitest in watch mode
- Run a single test file: `npx vitest run src/game/board.test.ts`
- Run tests matching a name: `npx vitest run -t "merges leftmost pair"`

## Architecture

- **Vite + React 19 + TypeScript**. `tsconfig.json` is a solution file referencing `tsconfig.app.json` (browser code, strict, `noUnusedLocals`/`noUnusedParameters` on) and `tsconfig.node.json` (Vite config itself).
- **Game logic is pure and framework-agnostic**, isolated in `src/game/board.ts`. The core algorithm is `slideRowLeft`, which slides/merges a single row to the left (leftmost-first merge priority, matching official 2048 rules). `move(board, direction)` implements all four directions by transposing and/or reversing the board and reusing `slideRowLeft` — when changing merge behavior or supporting non-square boards, that one function is the place to change, not four separate per-direction implementations. This module has no React dependency and is the most heavily unit-tested part of the codebase (`board.test.ts`).
- **State management** lives in `src/hooks/useGame.ts` as a single `useReducer` (`MOVE` / `RESET` / `CONTINUE` actions). It owns score, best score (persisted to `localStorage` under `2048-best-score`), and win/lose `status`. Keyboard input (arrow keys + WASD) is wired via a `window` `keydown` listener inside this hook.
- **Touch input** is handled separately in `src/hooks/useSwipe.ts`, which translates swipe gestures into the same `Direction` type as keyboard input. Both input sources call `useGame`'s `applyMove`, so `useGame` never knows how a direction was produced.
- **Components are presentational only**: `Board.tsx` renders empty grid cells plus non-zero tiles; `Tile.tsx` positions itself using CSS custom properties (`--row`, `--col`) consumed by `App.css`, so tile movement is animated via CSS transitions rather than JS.
- **Testing**: Vitest + jsdom + React Testing Library. Test config lives inline in the `test` block of `vite.config.ts` (no separate `vitest.config.ts`). `src/setupTests.ts` wires up jest-dom matchers.
