<div align="center">

<img src="ui/public/qwerty-logo.png" alt="qwerty-bot logo" width="96" height="96" />

# qwerty-bot

**An Electron + React desktop app for automating repetitive mouse/keyboard sequences on Windows.**

[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-593D88?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![nut.js](https://img.shields.io/badge/nut--tree--fork%2Fnut--js-FF6F00?style=for-the-badge&logo=windowsterminal&logoColor=white)](https://github.com/nut-tree/nut.js)
[![electron-builder](https://img.shields.io/badge/electron--builder-4A4A55?style=for-the-badge&logo=electron&logoColor=white)](https://www.electron.build/)

</div>

Capture a series of screen coordinates, tune the click, key, and delay behavior for each one, and replay the whole sequence — or many named sequences — on demand.

## Features

- **Trigger bots** — group captured screen positions into named, reusable sequences (up to 20 per app). Each bot can be run, duplicated, or deleted independently.
- **Position capture** — press `Space` while capturing to record the current cursor position, `Escape` to stop. Positions can also be appended to an existing bot later.
- **Grid generation** — auto-generate an evenly spaced grid of positions (5/10/15/20 points) across the screen instead of capturing manually, useful for bulk click patterns.
- **Per-position configuration** — each captured point has its own:
  - Replay delay (100ms–10s)
  - Mouse button (left or right click)
  - Optional key press after the click, with its own follow-up delay
- **Live overlay** — toggle a bot's positions on/off (as a whole or one at a time) to visualize them as on-screen dots before triggering, including drag-to-reposition support.
- **Import / export** — save trigger bots to a JSON file and reload them later or on another machine, with automatic name de-duplication and a slot limit guard on import.
- **Trigger defaults** — set default delay, key, and key delay applied to newly captured positions from the Settings page.
- **Dashboard** — shows whether OS automation is available, screen resolution, and live system stats (CPU, RAM, GPU, OS, hostname, uptime).
- **Graceful degradation** — on platforms where the native automation binding fails to load, automation features are disabled and the UI shows a warning instead of crashing.

## How it works

Mouse and keyboard control is powered by [`@nut-tree-fork/nut-js`](https://github.com/nut-tree/nut.js) running in the Electron main process. The renderer never touches OS APIs directly — it communicates over IPC through a context-bridge preload script (see [src/shared/ipc.ts](src/shared/ipc.ts)).

When a trigger bot runs, the app minimizes itself, then for each saved position: moves the mouse, waits briefly for it to settle, clicks with the configured button, waits the configured delay, and optionally presses a key and waits again — before moving to the next position. The window is restored once the sequence finishes.

## Project structure

```
src/
  main/       Electron main process (window, IPC handlers, system info, nut.js robot client)
  preload/    Context-bridge preload script exposing window.robot / window.capture / window.overlay / window.system / window.appWindow
  shared/     Types and IPC channel names shared between main and renderer
ui/
  src/
    pages/        Dashboard, Triggers, Logs, Settings
    overlay/       Transparent always-on-top overlay window (renders position dots)
    commons/       Header, Sidebar
    store/         Zustand stores (trigger bots, trigger settings, theme)
    services/      Overlay + trigger bot state helpers
    utils/         Grid position generation, import/export parsing, async helpers
```

## Getting started

### Prerequisites

- Node.js 18+
- Windows (the packaged build targets Windows via NSIS/portable; automation requires admin privileges on some platforms)

### Development

```bash
npm install
npm run dev
```

This starts the app with hot reload via `electron-vite`.

### Building

```bash
npm run build      # type-check, then build main/preload/renderer for production
npm run preview    # preview the production build
npm run dist:win    # build and package a Windows installer (NSIS) + portable exe
npm run dist:dir     # build and package to an unpacked directory (faster, for local testing)
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the app in development mode with hot reload |
| `npm run build` | Type-check both projects, then build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Type-check the main/preload project and the renderer project |
| `npm run typecheck:node` | Type-check only the Electron main/preload project |
| `npm run typecheck:web` | Type-check only the React renderer project |
| `npm run dist:win` | Package a distributable Windows installer + portable exe |
| `npm run dist:dir` | Package to an unpacked output directory |

## Tech stack

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/) for the desktop shell and build tooling
- [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) for the renderer UI
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [`@nut-tree-fork/nut-js`](https://github.com/nut-tree/nut.js) for native mouse/keyboard automation
- [electron-builder](https://www.electron.build/) for packaging

## Disclaimer

This tool automates mouse and keyboard input. Use it only in contexts where automated input is permitted (e.g. it may violate the terms of service of some applications or games). You are responsible for how you use it.
