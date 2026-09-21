# Retium Academy v0.4.0 — Shared leaderboard (pilot)

## Setup
1. Supabase: existing `players` and `quiz_results` tables from the SQL setup are required. Keep RLS enabled and do not add public insert/select policies.
2. Vercel > existing Retium Academy project > Settings > Environment Variables: add `SUPABASE_URL` (project URL) and `SUPABASE_SECRET_KEY` (Supabase Secret key, **server only**). Add them for Production (and Preview if desired). Do not put secrets in GitHub, chat, or `NEXT_PUBLIC_` variables. Retain your existing `CERTIFICATE_SECRET` if configured.
3. Deploy by pushing this project's code to the same GitHub repository (`main`). Vercel will build the updated project. Check `/api/leaderboard` returns `{ "rows": [] }` before the first score.
4. Enter an X username in the quiz result screen and press **Save score to shared leaderboard**. Open the website on another device to confirm it appears. The leaderboard refreshes every 30 seconds.

## Pilot limitations — read before community launch
- X username is **not verified**. Someone can submit under another person's handle. Scores for the same handle are merged by best score per UTC day.
- This pilot recomputes correct answers on the server but the browser sends its own answers and question order; users can inspect the public question bank and submit fabricated answers. **It is NOT cheat-resistant and must not be used for prizes or competitive rewards.** A later release needs server-issued quiz sessions, server-enforced question deadlines, authenticated identity, replay protection and rate limits.
- The shared board shows **best single quiz score per handle per UTC day**, not the sum of all quizzes. Server scores are 100 per correct answer, max 500; the existing local quiz UI still shows its original time bonus. These values intentionally differ.
- Learning progress, unlocks and Knowledge Passport remain stored in each browser; only the leaderboard is shared.
- Supabase REST GET uses a 10,000-row cap; add a SQL aggregate view or server pagination before a large public launch.
