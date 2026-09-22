# Retium Academy v0.5.2 answer-key TEST

This build moves the numeric answer key out of the client question bank into `lib/quiz-answer-key.server.ts` and grades each answer on the server. Correct answers are disclosed after each question is submitted for review. Server timestamps/points still rely on SQL-SERVER-SPEED.sql.

DO NOT deploy yet. Backup Supabase first; run SQL-SERVER-SPEED.sql only after testing/migration planning, as it replaces the old score RPC and makes v0.5.1 incompatible with the same database. Install deps, run `npm run build`, then test end-to-end with Discord/Supabase on a separate test database. This is not cheat-proof: a user may replay the quiz to learn answers; server clock is affected by network latency; historical scores do not have speed bonus.
