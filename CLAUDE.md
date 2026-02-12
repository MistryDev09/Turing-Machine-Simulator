# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands run from `turing-machine-site/`:

```bash
cd turing-machine-site
npm install     # install dependencies
npm run dev     # dev server at http://localhost:5173
npm run build   # production build
npm run preview # preview production build
```

No test framework, linter, or formatter is configured.

## Architecture

Client-side React 18 + Vite 5 app deployed on Vercel. The app root is **`turing-machine-site/`** (not the repo root — the repo root `package.json` only has `@vercel/analytics`).

### Core pattern: single hook owns all state

`useTuringMachine.js` is the centralized state hook — it holds **all** machine state (tape, head, rules, history, running/halted/won flags) and exposes every action. `TuringMachine.jsx` calls this hook once and passes slices down as props to child components. No component manages its own domain state.

### Key files

- **`src/constants/challenges.js`** — `BLANK` symbol constant (`⬜`), `CHALLENGES` array (4 challenges + sandbox), `INIT_RULES` for the default Binary Inverter challenge
- **`src/styles/theme.js`** — `colors`, `font`, shared style factories (`btnStyle`, `tinyBtnStyle`, `ruleInputStyle`, etc.). All styling is inline — no CSS modules or styled-components
- **`src/hooks/useTuringMachine.js`** — all TM logic: step execution, run/pause/undo/reset, rule CRUD, tape editing, localStorage persistence (debounced 500ms), history (capped at 500 entries)
- **`src/components/TuringMachine.jsx`** — orchestrator that computes layout values (cell size, visible tape window) and renders all sub-components
- **`src/components/StateGraph.jsx`** — SVG-based graph visualization of transition rules

### Responsive breakpoints

`useWindowSize.js`: mobile < 640px, tablet 640-899px, desktop 900px+. Every component receives `isMobile`/`isTablet` as props and adjusts inline styles accordingly.

## Conventions

- **Inline styles everywhere** — no CSS files, no class-based styling. Use the helpers from `theme.js`.
- **WCAG AA accessible colors** — text colors are solid (no alpha transparency) and chosen for contrast ratios against the dark background (`#0a0a0f`). `textDisabled` is 3.5:1, only for large/decorative text.
- **Keyboard shortcuts** — S=step, Space=run/pause, Z=undo, R=reset (handled in ControlPanel).
- **State names** are strings like `"q0"`, `"q1"`, `"HALT"`. The special state `"HALT"` stops execution.
- **Rule shape**: `{ state, read, write, move, nextState }` where move is `"L"`, `"R"`, or `"N"`.
