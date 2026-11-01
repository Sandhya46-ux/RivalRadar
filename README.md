# RivalRadar Frontend

A responsive React + Vite dashboard prototype for the RivalRadar competitor-intelligence project.

## Requirements
- Windows 10/11
- Node.js 20.19+ or 22.12+ recommended
- npm

## Run in PowerShell
1. Extract this ZIP.
2. Open the extracted `RivalRadar-Frontend` folder in VS Code.
3. Open Terminal → New Terminal (PowerShell).
4. Run:

```powershell
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Current functionality
- Company URL validation
- Add/remove up to three competitor URLs
- Navigation and dashboard tabs
- Demo scan state and agent-status display
- Responsive desktop/tablet/mobile layout

## Important
The scan currently simulates a short demo and uses illustrative sample metrics and findings. It does not yet call TinyFish or a backend. The next integration step is to connect the scan button to a FastAPI `/investigate` endpoint and render verified results from the agents.
