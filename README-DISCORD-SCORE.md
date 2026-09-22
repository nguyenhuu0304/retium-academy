# Retium Academy v0.5.0 — Discord score UI patch

Copy `app/page.tsx` and `app/api/leaderboard/route.ts` into your existing v0.5.0 folder, overwriting those two files only. Preserve `.env.local`. Stop and restart `npm run dev`.

This patch removes the X-handle requirement for leaderboard submission. The server already derives the leaderboard player key from the signed Discord session (`d` + Discord user ID, truncated to 15 chars); the certificate name remains freely editable. Existing Supabase schema still uses `players.x_username`, so the public leaderboard displays an opaque `d...` identifier, NOT the friendly Discord username. This is a UI compatibility patch, NOT a production-ready Discord identity migration or anti-cheat solution. It does not prevent replaying the same quiz answers or guarantee the quiz was played in the browser. Do not deploy as a secure leaderboard until the database is migrated to a unique full Discord ID and quiz attempt validation is implemented.
