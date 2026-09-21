# Retium Academy v0.3.0 — Learning Flow Prototype

Independent community project by @nhunghuytam; not an official Retium product.

## What works
- 185 previously screened questions, divided among six modules. **Not all questions have been independently verified against the latest official documentation**. Every question includes a source link for further review.
- Five random questions per attempt, 10 seconds per question, 4/5 to pass; next lesson remains locked until previous passed. Retry on failure.
- Score: 100 for correct + 10 per remaining second; 0 for incorrect/timeout.
- Personal progress and a **local-only daily leaderboard** in this browser. This is NOT a shared cross-user leaderboard. For a public leaderboard, use a database, server-authoritative timed quiz sessions, user identification, and abuse controls.
- Downloadable PNG certificate after passing. Share on X opens a prefilled post; attach PNG manually. **Automatic X certificate preview and public certificate verification are not connected to randomized quiz sessions in this prototype**; the older certificate API is not used by this flow.
- Correct supplied Retium logo in public/retium-logo.png.

## Windows
```powershell
npm install
npm run dev
```
Open localhost address shown in terminal. Node.js 20+ required. No recovery phrase or wallet connection is required.

## Before sending to the team
Review the 185 question explanations and source links; test timer, lock flow, mobile layout and certificate. Do not represent the local leaderboard or X image attachment as publicly working features. The app is a prototype, not a deployed service.
