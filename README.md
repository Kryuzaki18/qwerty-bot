# qwerty-bot

An Electron + React desktop app for recording mouse positions and replaying them as click "trigger bots" — capture a sequence of screen coordinates, attach a delay to each, then replay the clicks on demand.

## How it works

- **Dashboard** — shows whether OS automation is available, the screen size, and the current mouse position. Lets you jump the mouse to a fixed point or type text into the focused window.
- **Triggers** — capture a set of mouse positions (press `Space` to record the current cursor position, `Escape` to stop), name the set, and save it as a trigger bot. Each saved position can have its own replay delay. Triggering a bot moves the mouse to each position, clicks, and waits before moving to the next.

Mouse/keyboard control is powered by [`@nut-tree-fork/nut-js`](https://github.com/nut-tree/nut.js) in the Electron main process; the renderer talks to it over IPC (see [src/shared/ipc.ts](src/shared/ipc.ts)). On platforms where the native binding fails to load, automation features are disabled and the UI shows a warning instead of crashing.

## Project structure

```
src/
  main/       Electron main process (window, IPC handlers, robot/nut.js client)
  preload/    Context-bridge preload script exposing window.robot / window.capture
  shared/     Types and IPC channel names shared between main and renderer
ui/
  src/        React renderer (pages: Dashboard, Triggers; commons: Header, Sidebar)
```

## Development

```
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the app in development mode with hot reload
- `npm run build` — type-check then build for production
- `npm run preview` — preview the production build
- `npm run typecheck` — type-check both the main/preload and renderer projects
