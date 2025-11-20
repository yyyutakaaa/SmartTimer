# SmartTimer – Desktop countdown from target time

Electron-based desktop timer that starts counting down from “now” to a target time you choose. Ships with a modern animated UI, looping alarm until dismissed, and desktop notifications.

## Features
- Countdown starts from the moment you hit Save toward your chosen clock time (handles next-day rollover).
- Looping alarm audio plus Web Audio fallback; stops only when dismissed.
- In-app toast and desktop notification on completion (requests permission on first start).
- Responsive layout that stacks the meta card below the timer on smaller windows.
- Built for Windows via Electron; works offline (no network calls).

## Getting started
### Prerequisites
- Node.js 18+ and npm

### Install and run (dev)
```sh
npm install
npm start
```

### Package a Windows executable
```sh
npm run package:win
```
Output will land in `dist/SmartTimer-win32-x64/SmartTimer.exe`.
The packaging script regenerates `TimerLogo.ico` from `TimerLogo.png` before building so the executable uses your custom icon.

## Project structure
- `main.js` – Electron main process bootstrapping the window.
- `preload.js` – Sandbox-friendly preload (currently minimal).
- `index.html`, `styles.css`, `app.js` – UI and timer logic.
- `package.json` – Scripts and Electron dependencies.
- `TimerLogo.png` / `TimerLogo.ico` – App icon used for the window and packaged build.

## Usage notes
- Keep the window open for the alarm sound to play.
- Allow notifications when prompted if you want desktop alerts.
- Use the Reset button or dismiss toast to silence the alarm.

## Development tips
- UI assets are local; no CDN beyond Google Fonts and Alpine.js (loaded via CDN).
- If you adjust the UI, test at narrower widths to verify the stacked layout.
- No build step is required for HTML/CSS/JS; Electron loads files directly.
