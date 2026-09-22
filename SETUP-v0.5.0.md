# v0.5.0 experimental local test — do not deploy yet

This build uses a **separate Discord OAuth application flow**; the Supabase Discord provider configured earlier is not used by this experimental build. Add `http://localhost:3000/api/auth/callback` to Discord OAuth2 Redirects. For production add `https://retium-academy-uvex.vercel.app/api/auth/callback` only after security review.

Copy `.env.example` to `.env.local` and enter real values locally; never upload the file. `NEXT_PUBLIC_SITE_URL` must match the address used in Discord redirect exactly. Set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` from the Discord Developer Portal and generate `AUTH_SESSION_SECRET` as a random string of at least 32 characters. Keep the existing Supabase and certificate values.

Run `npm install`, then `npm run dev`; visit `http://localhost:3000`. A Discord login requires `identify guilds` permissions and membership in guild `1490455567100022965`. No bot invitation is needed.

**NOT PRODUCTION READY:** This is an authentication prototype, not a secure anti-cheat release. Quiz answers are shipped to the browser and the score POST can be replayed; existing database uses X username as player key and Discord ID is truncated to fit. A production migration must introduce a unique full Discord ID, server-owned quiz attempts with single-use IDs, and server-side rate limiting. Do not use this build for prizes or deploy to production.
